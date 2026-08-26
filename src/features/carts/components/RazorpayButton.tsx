"use client";
import React, { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { CartItems } from "@/features/carts";

type RazorpayButtonProps = React.ComponentProps<typeof Button> & {
  order: CartItems;
  guest: boolean;
  promoCode?: string;
};

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
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

function RazorpayButton({
  order,
  guest,
  promoCode,
  ...props
}: RazorpayButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onClickHandler = async () => {
    setIsLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({ title: "Could not load payment gateway. Please try again." });
        return;
      }

      const res = await fetch("/api/payments/razorpay", {
        method: "POST",
        body: JSON.stringify({
          orderProducts: order,
          guest,
          promoCode: promoCode || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast({
          title:
            data?.error ||
            "Online payments are not available right now. Please try again later.",
        });
        return;
      }

      const {
        dbOrderId,
        razorpayOrderId,
        amount,
        currency,
        keyId,
      } = (await res.json()) as {
        dbOrderId: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId: string;
        successUrl: string;
      };

      const checkout = new window.Razorpay!({
        key: keyId,
        amount,
        currency,
        name: "ROZNE",
        description: "Premium Knitwear & Hosiery",
        order_id: razorpayOrderId,
        theme: { color: "#2C2420" },
        handler: async (response) => {
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
        modal: {
          ondismiss: () => setIsLoading(false),
        },
      });

      checkout.open();
    } catch {
      toast({ title: "Something went wrong. Please try again." });
    } finally {
      // Keep the button in loading state while the modal is open.
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  return (
    <Button
      {...props}
      className={cn("w-full", props.className)}
      variant={props.variant ?? "outline"}
      onClick={onClickHandler}
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : "Pay with UPI / Card"}
      {isLoading && (
        <Spinner className="ml-3 h-4 w-4 animate-spin" aria-hidden="true" />
      )}
    </Button>
  );
}

export default RazorpayButton;
