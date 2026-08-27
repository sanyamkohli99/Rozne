import { env } from "@/env.mjs";
import { getCredentials } from "@/_actions/credentials";
import Stripe from "stripe";

/** Read Stripe credentials from DB first, then env var fallback. */
async function resolveCreds() {
  const db = await getCredentials("stripe");
  return {
    secretKey: db?.keyId || env.STRIPE_SECRET_KEY || "",
    webhookSecret: db?.keySecret || env.STRIPE_WEBHOOK_SECERT_KEY || "",
    publishableKey: db?.keyId || env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  };
}

export async function isStripeConfigured() {
  const { secretKey } = await resolveCreds();
  return Boolean(secretKey);
}

/** Get Stripe instance (server-side). Reads secret from DB. */
export async function getStripeServer() {
  const { secretKey } = await resolveCreds();
  return new Stripe(secretKey, {
    apiVersion: "2023-10-16",
    appInfo: { name: "ROZNE", version: "1.0.0" },
  });
}

/** Get Stripe publishable key for the client. */
export async function getStripePublishableKey() {
  const { publishableKey } = await resolveCreds();
  return publishableKey;
}

/** Get Stripe webhook secret for signature verification. */
export async function getStripeWebhookSecret() {
  const { webhookSecret } = await resolveCreds();
  return webhookSecret;
}
