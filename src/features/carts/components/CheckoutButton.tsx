"use client";
import React, { useState } from "react";
import { getStripe } from "@/lib/stripe/stripeClient";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { CartItems } from "@/features/carts";

type CheckoutButtonProps = React.ComponentProps<typeof Button> & {
  order: CartItems;
  guest: boolean;
  promoCode?: string;
  stripePublishableKey?: string;
  razorpayKeyId?: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: any) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CheckoutButton({ order, guest, promoCode, stripePublishableKey, razorpayKeyId, ...props }: CheckoutButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const useRazorpay = !!razorpayKeyId;
  const useStripe = !!stripePublishableKey;

  const onClickHandler = async () => {
    if (!useRazorpay && !useStripe) {
      toast({ title: "No payment method configured yet." });
      return;
    }

    setIsLoading(true);

    try {
      if (useRazorpay) {
        await handleRazorpay();
      } else {
        await handleStripe();
      }
    } catch {
      toast({ title: "Something went wrong. Please try again." });
      setIsLoading(false);
    }
  };

  const handleRazorpay = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast({ title: "Could not load payment gateway. Please try again." });
      setIsLoading(false);
      return;
    }

    const res = await fetch("/api/payments/razorpay", {
      method: "POST",
      body: JSON.stringify({ orderProducts: order, guest, promoCode: promoCode || undefined }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast({ title: data?.error || "Payment unavailable. Please try again." });
      setIsLoading(false);
      return;
    }

    const { dbOrderId, razorpayOrderId, amount, currency, keyId } = await res.json();

    const checkout = new window.Razorpay!({
      key: keyId,
      amount,
      currency,
      name: "ROZNE",
      description: "Premium Knitwear & Hosiery",
      order_id: razorpayOrderId,
      theme: { color: "#2C2420" },
      handler: async (response: any) => {
        const verifyRes = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          body: JSON.stringify(response),
        });
        if (!verifyRes.ok) {
          toast({ title: "Payment verification failed. Contact support." });
          return;
        }
        window.location.href = `/orders/${dbOrderId}`;
      },
      modal: { ondismiss: () => setIsLoading(false) },
    });

    checkout.open();
  };

  const handleStripe = async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({ orderProducts: order, guest, promoCode: promoCode || undefined }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast({ title: data?.error || "Payment unavailable. Please try again." });
      setIsLoading(false);
      return;
    }

    const { sessionId } = await res.json();
    setIsLoading(false);
    const stripe = await getStripe(stripePublishableKey!);
    stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <Button
      {...props}
      className={cn("w-full", props.className)}
      onClick={onClickHandler}
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : "Checkout"}
      {isLoading && (
        <Spinner className="ml-3 h-4 w-4 animate-spin" aria-hidden="true" />
      )}
    </Button>
  );
}

export default CheckoutButton;
