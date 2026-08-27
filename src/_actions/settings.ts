"use server";

import { createHash, timingSafeEqual } from "crypto";
import db from "@/lib/supabase/db";
import {
  siteSettings,
  PaymentGatewayFlags,
} from "@/lib/supabase/schema";
import { eq } from "drizzle-orm";

const PAYMENT_GATEWAYS_KEY = "payment_gateways";

const DEFAULT_GATEWAYS: PaymentGatewayFlags = {
  razorpay: true,
  stripe: true,
};

/** Public read: which payment gateways are enabled. Safe to call anywhere. */
export async function getEnabledGateways(): Promise<PaymentGatewayFlags> {
  try {
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, PAYMENT_GATEWAYS_KEY))
      .limit(1);

    if (!row?.value) return DEFAULT_GATEWAYS;
    const value = row.value as Partial<PaymentGatewayFlags>;
    return {
      razorpay: value.razorpay ?? DEFAULT_GATEWAYS.razorpay,
      stripe: value.stripe ?? DEFAULT_GATEWAYS.stripe,
    };
  } catch {
    // Never break checkout because of a settings read failure.
    return DEFAULT_GATEWAYS;
  }
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Admin-only write. Protected by a "safe lock": requires the admin password
 * (ADMIN_TOKEN) to be re-entered on every change. The password is verified
 * by constant-time hash comparison and never stored or logged.
 */
export async function updatePaymentGateways(
  flags: PaymentGatewayFlags,
  adminPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  if (typeof adminPassword !== "string" || adminPassword.length === 0) {
    return { ok: false, error: "Admin password is required." };
  }

  const expected = process.env.ADMIN_TOKEN ?? "";
  if (!expected) {
    return { ok: false, error: "Server is not configured for admin changes." };
  }

  const a = Buffer.from(hashToken(adminPassword));
  const b = Buffer.from(hashToken(expected));
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, error: "Incorrect admin password." };
  }

  const value: PaymentGatewayFlags = {
    razorpay: Boolean(flags.razorpay),
    stripe: Boolean(flags.stripe),
  };

  await db
    .insert(siteSettings)
    .values({ key: PAYMENT_GATEWAYS_KEY, value })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: new Date() },
    });

  return { ok: true };
}
