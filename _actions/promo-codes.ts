"use server";

import db from "@/lib/supabase/db";
import { InsertPromoCodes, promoCodes } from "@/lib/supabase/schema";
import { eq, and, sql } from "drizzle-orm";

export const getPromoCodes = async () => {
  return await db
    .select()
    .from(promoCodes)
    .orderBy(promoCodes.createdAt);
};

export const getPromoCodeById = async (id: string) => {
  const rows = await db
    .select()
    .from(promoCodes)
    .where(eq(promoCodes.id, id));
  return rows[0] ?? null;
};

export const createPromoCode = async (data: InsertPromoCodes) => {
  try {
    const result = await db.insert(promoCodes).values(data).returning();
    return { data: result };
  } catch (err) {
    console.error("Error creating promo code:", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
};

export const updatePromoCode = async (
  id: string,
  data: Partial<InsertPromoCodes>,
) => {
  try {
    const result = await db
      .update(promoCodes)
      .set(data)
      .where(eq(promoCodes.id, id))
      .returning();
    return { data: result };
  } catch (err) {
    console.error("Error updating promo code:", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
};

export const deletePromoCode = async (id: string) => {
  try {
    await db.delete(promoCodes).where(eq(promoCodes.id, id));
    return { success: true };
  } catch (err) {
    console.error("Error deleting promo code:", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
};

export type PromoCodeValidation = {
  valid: boolean;
  discount?: number;
  type?: "percentage" | "fixed";
  message?: string;
};

export const validatePromoCode = async (
  code: string,
  subtotal: number,
): Promise<PromoCodeValidation> => {
  const rows = await db
    .select()
    .from(promoCodes)
    .where(
      and(
        eq(promoCodes.code, code.toUpperCase().trim()),
        eq(promoCodes.active, true),
      ),
    );

  const promo = rows[0];
  if (!promo) {
    return { valid: false, message: "Invalid promo code." };
  }

  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return { valid: false, message: "This promo code has expired." };
  }

  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return { valid: false, message: "This promo code has reached its usage limit." };
  }

  const minAmount = parseFloat(promo.minOrderAmount);
  if (subtotal < minAmount) {
    return {
      valid: false,
      message: `Minimum order amount is ₹${minAmount.toFixed(0)} for this code.`,
    };
  }

  let discount: number;
  if (promo.type === "percentage") {
    discount = (subtotal * parseFloat(promo.value)) / 100;
  } else {
    discount = parseFloat(promo.value);
  }

  if (discount > subtotal) {
    discount = subtotal;
  }

  return {
    valid: true,
    discount: Math.round(discount * 100) / 100,
    type: promo.type,
  };
};

export const incrementPromoCodeUsage = async (code: string) => {
  await db
    .update(promoCodes)
    .set({
      usedCount: sql`${promoCodes.usedCount} + 1`,
    })
    .where(eq(promoCodes.code, code.toUpperCase().trim()));
};
