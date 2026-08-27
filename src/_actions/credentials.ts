"use server";

import { createHash, timingSafeEqual } from "crypto";
import db from "@/lib/supabase/db";
import { paymentCredentials } from "@/lib/supabase/schema";
import { encrypt, decrypt } from "@/lib/encryption";
import { eq } from "drizzle-orm";

export type DecryptedCredentials = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
};

/** Read and decrypt stored credentials for a provider. Returns null if not found. */
export async function getCredentials(
  provider: string,
): Promise<DecryptedCredentials | null> {
  const [row] = await db
    .select()
    .from(paymentCredentials)
    .where(eq(paymentCredentials.provider, provider))
    .limit(1);

  if (!row) return null;

  try {
    return {
      keyId: row.keyIdEncrypted ? decrypt(row.keyIdEncrypted) : "",
      keySecret: row.keySecretEncrypted ? decrypt(row.keySecretEncrypted) : "",
      webhookSecret: row.webhookSecretEncrypted
        ? decrypt(row.webhookSecretEncrypted)
        : "",
    };
  } catch {
    return null;
  }
}

/** Get the Razorpay key ID for the cart button (publishable, not secret). */
export async function getRazorpayKeyId(): Promise<string> {
  const creds = await getCredentials("razorpay");
  return creds?.keyId ?? process.env.RAZORPAY_KEY_ID ?? "";
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (!expected || typeof password !== "string" || !password) return false;
  const a = Buffer.from(hashToken(password));
  const b = Buffer.from(hashToken(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Save credentials (encrypted). Requires admin password. */
export async function saveCredentials(
  provider: string,
  data: { keyId?: string; keySecret?: string; webhookSecret?: string },
  adminPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!verifyAdminPassword(adminPassword)) {
    return { ok: false, error: "Incorrect admin password." };
  }

  const existing = await getCredentials(provider);

  await db
    .insert(paymentCredentials)
    .values({
      provider,
      keyIdEncrypted: data.keyId ? encrypt(data.keyId) : existing?.keyId ?? "",
      keySecretEncrypted: data.keySecret
        ? encrypt(data.keySecret)
        : existing?.keySecret ?? "",
      webhookSecretEncrypted: data.webhookSecret
        ? encrypt(data.webhookSecret)
        : existing?.webhookSecret ?? "",
    })
    .onConflictDoUpdate({
      target: paymentCredentials.provider,
      set: {
        keyIdEncrypted: data.keyId
          ? encrypt(data.keyId)
          : existing?.keyId ?? "",
        keySecretEncrypted: data.keySecret
          ? encrypt(data.keySecret)
          : existing?.keySecret ?? "",
        webhookSecretEncrypted: data.webhookSecret
          ? encrypt(data.webhookSecret)
          : existing?.webhookSecret ?? "",
        updatedAt: new Date(),
      },
    });

  return { ok: true };
}
