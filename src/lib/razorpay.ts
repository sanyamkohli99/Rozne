import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/env.mjs";

export function isRazorpayConfigured() {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

type RazorpayOrderInput = {
  amountInPaise: number;
  receipt: string;
  currency?: string;
  notes?: Record<string, string>;
};

/**
 * Creates an order via Razorpay's REST API.
 * Docs: https://razorpay.com/docs/api/orders/#create-an-order
 */
export async function createRazorpayOrder({
  amountInPaise,
  receipt,
  currency = "INR",
  notes,
}: RazorpayOrderInput) {
  const auth = Buffer.from(
    `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");

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

/** Verifies the checkout handler signature: HMAC_SHA256(order_id + "|" + payment_id). */
export function verifyPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}) {
  if (!env.RAZORPAY_KEY_SECRET) return false;
  const expected = createHmac(
    "sha256",
    env.RAZORPAY_KEY_SECRET,
  )
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(input.signature));
  } catch {
    return false;
  }
}

/** Verifies webhook payloads: HMAC_SHA256(rawBody) against X-Razorpay-Signature. */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
