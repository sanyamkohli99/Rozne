"use client";

import React, { useState, useTransition } from "react";
import { saveCredentials } from "@/_actions/credentials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/layouts/icons";

type Props = {
  initialKeyId: string;
  hasSecret: boolean;
  hasWebhook: boolean;
};

function RazorpayCredentialsForm({
  initialKeyId,
  hasSecret,
  hasWebhook,
}: Props) {
  const { toast } = useToast();
  const [keyId, setKeyId] = useState(initialKeyId);
  const [keySecret, setKeySecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  const onSave = () => {
    if (!password) {
      toast({
        title: "Enter your admin password to save.",
        variant: "destructive",
      });
      return;
    }
    if (!keyId && !keySecret && !webhookSecret) {
      toast({
        title: "Enter at least one key to save.",
        variant: "destructive",
      });
      return;
    }
    startTransition(async () => {
      const result = await saveCredentials(
        "razorpay",
        {
          keyId: keyId || undefined,
          keySecret: keySecret || undefined,
          webhookSecret: webhookSecret || undefined,
        },
        password,
      );
      if (!result.ok) {
        toast({ title: result.error ?? "Failed to save.", variant: "destructive" });
        return;
      }
      toast({ title: "Razorpay keys saved securely." });
      setKeySecret("");
      setWebhookSecret("");
      setPassword("");
    });
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-lg border border-border p-4 space-y-4">
        <p className="text-xs text-muted-foreground">
          {hasSecret
            ? "Keys are stored. Enter new values to replace them, or leave blank to keep current."
            : "No keys stored yet. Enter your Razorpay test keys below."}
        </p>

        <div className="space-y-1">
          <label className="text-sm font-medium">Key ID (publishable)</label>
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
              placeholder="rzp_test_..."
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showKey ? "Hide" : "Show"}
            >
              {showKey ? <Icons.hide className="h-4 w-4" /> : <Icons.view className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Key Secret</label>
          <div className="relative">
            <Input
              type={showSecret ? "text" : "password"}
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
              placeholder={hasSecret ? "•••••••• (stored)" : "Enter key secret"}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showSecret ? "Hide" : "Show"}
            >
              {showSecret ? <Icons.hide className="h-4 w-4" /> : <Icons.view className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Webhook Secret</label>
          <div className="relative">
            <Input
              type={showWebhook ? "text" : "password"}
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder={hasWebhook ? "•••••••• (stored)" : "Pick a secret string"}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowWebhook(!showWebhook)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showWebhook ? "Hide" : "Show"}
            >
              {showWebhook ? <Icons.hide className="h-4 w-4" /> : <Icons.view className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm with admin password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="max-w-xs"
          autoComplete="current-password"
        />
      </div>

      <Button onClick={onSave} disabled={isPending}>
        Save Keys
        {isPending && <Spinner className="ml-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      </Button>
    </div>
  );
}

export default RazorpayCredentialsForm;
