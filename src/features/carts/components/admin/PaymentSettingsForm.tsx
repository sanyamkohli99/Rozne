"use client";

import React, { useState, useTransition } from "react";
import { updatePaymentGateways } from "@/_actions/settings";
import type { PaymentGatewayFlags } from "@/lib/supabase/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  initial: PaymentGatewayFlags;
};

const GATEWAYS: { key: keyof PaymentGatewayFlags; label: string; hint: string }[] = [
  { key: "razorpay", label: "Razorpay (UPI / Cards / NetBanking)", hint: "Recommended for India" },
  { key: "stripe", label: "Stripe (International Cards)", hint: "Card payments via Stripe Checkout" },
];

function PaymentSettingsForm({ initial }: Props) {
  const { toast } = useToast();
  const [flags, setFlags] = useState<PaymentGatewayFlags>(initial);
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  const noneEnabled = !flags.razorpay && !flags.stripe;

  const onSave = () => {
    if (!password) {
      toast({
        title: "Enter your admin password to save changes.",
        variant: "destructive",
      });
      return;
    }
    startTransition(async () => {
      try {
        const result = await updatePaymentGateways(flags, password);
        if (!result.ok) {
          toast({ title: result.error ?? "Could not save.", variant: "destructive" });
          return;
        }
        toast({ title: "Payment settings updated." });
        setPassword("");
      } catch {
        toast({ title: "Something went wrong. Try again.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-xl space-y-6">
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
        <p className="text-sm text-destructive">
          At least one payment method should stay enabled, otherwise customers cannot pay.
        </p>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">Confirm with admin password</p>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="max-w-xs"
          autoComplete="current-password"
        />
        <p className="text-xs text-muted-foreground">
          Same password you use for the admin login. Required every time you change
          payment settings.
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
