"use client";

import React, { useState, useTransition } from "react";
import { updatePaymentGateways } from "@/_actions/settings";
import { saveCredentials } from "@/_actions/credentials";
import type { PaymentGatewayFlags } from "@/lib/supabase/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/layouts/icons";

type Props = {
  initialGateways: PaymentGatewayFlags;
  initialRazorpayKeyId: string;
  hasRazorpaySecret: boolean;
  initialStripeKeyId: string;
  hasStripeSecret: boolean;
};

const GATEWAYS: { key: keyof PaymentGatewayFlags; label: string; hint: string }[] = [
  { key: "razorpay", label: "Razorpay (UPI / Cards / NetBanking)", hint: "Recommended for India" },
  { key: "stripe", label: "Stripe (International Cards)", hint: "Card payments via Stripe Checkout" },
];

function PaymentSettingsForm({
  initialGateways,
  initialRazorpayKeyId,
  hasRazorpaySecret,
  initialStripeKeyId,
  hasStripeSecret,
}: Props) {
  const { toast } = useToast();
  const [flags, setFlags] = useState<PaymentGatewayFlags>(initialGateways);

  const [razorpayKeyId, setRazorpayKeyId] = useState(initialRazorpayKeyId);
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState("");

  const [stripeKeyId, setStripeKeyId] = useState(initialStripeKeyId);
  const [stripeKeySecret, setStripeKeySecret] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");

  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showRpSecret, setShowRpSecret] = useState(false);
  const [showRpWebhook, setShowRpWebhook] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showStripeWebhook, setShowStripeWebhook] = useState(false);

  const noneEnabled = !flags.razorpay && !flags.stripe;

  const onSave = () => {
    if (!password) {
      toast({ title: "Enter your admin password to save.", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      try {
        const results = await Promise.all([
          updatePaymentGateways(flags, password),
          saveCredentials("razorpay", {
            keyId: razorpayKeyId || undefined,
            keySecret: razorpayKeySecret || undefined,
            webhookSecret: razorpayWebhookSecret || undefined,
          }, password),
          saveCredentials("stripe", {
            keyId: stripeKeyId || undefined,
            keySecret: stripeKeySecret || undefined,
            webhookSecret: stripeWebhookSecret || undefined,
          }, password),
        ]);

        const failed = results.find((r) => !r.ok);
        if (failed) {
          toast({ title: failed.error ?? "Could not save.", variant: "destructive" });
          return;
        }

        toast({ title: "Payment settings saved." });
        setRazorpayKeySecret("");
        setRazorpayWebhookSecret("");
        setStripeKeySecret("");
        setStripeWebhookSecret("");
        setPassword("");
      } catch {
        toast({ title: "Something went wrong. Try again.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-xl space-y-8">
      {/* Gateway toggles */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Payment Methods</h3>
        <div className="rounded-lg border border-border divide-y divide-border">
          {GATEWAYS.map(({ key, label, hint }) => (
            <div key={key} className="flex items-center justify-between px-4 py-4 gap-x-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
              </div>
              <Switch
                checked={flags[key]}
                onCheckedChange={(checked) =>
                  setFlags((prev) => ({ ...prev, [key]: checked }))
                }
                aria-label={`Toggle ${label}`}
              />
            </div>
          ))}
        </div>
        {noneEnabled && (
          <p className="text-sm text-destructive mt-2">
            At least one payment method should stay enabled.
          </p>
        )}
      </div>

      {/* Razorpay keys */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Razorpay API Keys</h3>
        <div className="rounded-lg border border-border p-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            {hasRazorpaySecret
              ? "Keys are stored. Enter new values to replace, or leave blank to keep current."
              : "Enter your Razorpay test or live keys below."}
          </p>
          <div className="space-y-1">
            <label className="text-sm font-medium">Key ID</label>
            <Input type="text" value={razorpayKeyId} onChange={(e) => setRazorpayKeyId(e.target.value)} placeholder="rzp_test_..." autoComplete="off" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Key Secret</label>
            <div className="relative">
              <Input type={showRpSecret ? "text" : "password"} value={razorpayKeySecret} onChange={(e) => setRazorpayKeySecret(e.target.value)} placeholder={hasRazorpaySecret ? "•••••••• (stored)" : "Enter key secret"} autoComplete="off" />
              <button type="button" onClick={() => setShowRpSecret(!showRpSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showRpSecret ? <Icons.hide className="h-4 w-4" /> : <Icons.view className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Webhook Secret</label>
            <div className="relative">
              <Input type={showRpWebhook ? "text" : "password"} value={razorpayWebhookSecret} onChange={(e) => setRazorpayWebhookSecret(e.target.value)} placeholder="Pick a secret string" autoComplete="off" />
              <button type="button" onClick={() => setShowRpWebhook(!showRpWebhook)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showRpWebhook ? <Icons.hide className="h-4 w-4" /> : <Icons.view className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe keys */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Stripe API Keys</h3>
        <div className="rounded-lg border border-border p-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            {hasStripeSecret
              ? "Keys are stored. Enter new values to replace, or leave blank to keep current."
              : "Enter your Stripe test or live keys below."}
          </p>
          <div className="space-y-1">
            <label className="text-sm font-medium">Publishable Key</label>
            <Input type="text" value={stripeKeyId} onChange={(e) => setStripeKeyId(e.target.value)} placeholder="pk_test_..." autoComplete="off" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Secret Key</label>
            <div className="relative">
              <Input type={showStripeSecret ? "text" : "password"} value={stripeKeySecret} onChange={(e) => setStripeKeySecret(e.target.value)} placeholder={hasStripeSecret ? "•••••••• (stored)" : "Enter secret key"} autoComplete="off" />
              <button type="button" onClick={() => setShowStripeSecret(!showStripeSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showStripeSecret ? <Icons.hide className="h-4 w-4" /> : <Icons.view className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Webhook Signing Secret</label>
            <div className="relative">
              <Input type={showStripeWebhook ? "text" : "password"} value={stripeWebhookSecret} onChange={(e) => setStripeWebhookSecret(e.target.value)} placeholder="whsec_..." autoComplete="off" />
              <button type="button" onClick={() => setShowStripeWebhook(!showStripeWebhook)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showStripeWebhook ? <Icons.hide className="h-4 w-4" /> : <Icons.view className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password + save */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm with admin password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="max-w-xs"
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">
          Required every time you change payment settings.
        </p>
      </div>

      <Button onClick={onSave} disabled={isPending}>
        Save Changes
        {isPending && <Spinner className="ml-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      </Button>
    </div>
  );
}

export default PaymentSettingsForm;
