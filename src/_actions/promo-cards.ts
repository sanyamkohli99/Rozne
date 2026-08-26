"use server";

import db from "@/lib/supabase/db";
import { InsertPromoCards, promoCards } from "@/lib/supabase/schema";
import { eq } from "drizzle-orm";

export const getPromoCards = async () => {
  return await db
    .select()
    .from(promoCards)
    .orderBy(promoCards.position);
};

export const getPromoCardById = async (id: string) => {
  const rows = await db
    .select()
    .from(promoCards)
    .where(eq(promoCards.id, id));
  return rows[0] ?? null;
};

export const upsertPromoCard = async (
  id: string,
  data: InsertPromoCards,
) => {
  try {
    const existing = await db
      .select()
      .from(promoCards)
      .where(eq(promoCards.id, id));

    if (existing.length > 0) {
      const result = await db
        .update(promoCards)
        .set(data)
        .where(eq(promoCards.id, id))
        .returning();
      return { data: result };
    } else {
      const result = await db
        .insert(promoCards)
        .values({ ...data, id })
        .returning();
      return { data: result };
    }
  } catch (err) {
    console.error("Error in upsertPromoCard:", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
};
