import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/env.mjs";
import { getCredentials } from "@/_actions/credentials";

/** Read Razorpay credentials from DB first, then env var fallback. */
async function resolveCreds() {
  const db = await getCredentials("razorpay");
  return {
    keyId: db?.keyId || env.RAZORPAY_KEY_ID || "",
    keySecret: db?.keySecret || env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: db?.webhookSecret || env.RAZORPAY_WEBHOOK_SECRET || "",
  };
}

export async function isRazorpayConfigured() {
  const { keyId, keySecret } = await resolveCreds();
  return Boolean(keyId && keySecret);
}

type RazorpayOrderInput = {
  amountInPaise: number;
  receipt: string;
  currency?: string;
  notes?: Record<string, string>;
};

export async function createRazorpayOrder({
  amountInPaise,
  receipt,
  currency = "INR",
  notes,
}: RazorpayOrderInput) {
  const { keyId, keySecret } = await resolveCreds();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency,
      receipt,
      notes,
      payment_capture: 1,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(
      new Error(data?.error?.description || "Razorpay order creation failed."),
      { status: 502 },
    );
  }
  return data as { id: string; amount: number; currency: string };
}

export async function verifyPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}) {
  const { keySecret } = await resolveCreds();
  if (!keySecret) return false;
  const expected = createHmac("sha256", keySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(input.signature));
  } catch {
    return false;
  }
}

export async function verifyWebhookSignature(rawBody: string, signature: string) {
  const { webhookSecret } = await resolveCreds();
  if (!webhookSecret) return false;
  const expected = createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
