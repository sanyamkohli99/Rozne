"use server";

import db from "@/lib/supabase/db";
import { InsertProducts, productMedias, products } from "@/lib/supabase/schema";
import { eq, inArray } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

type SearchProductsActionProps = {
  query: string;
  limit?: number;
  collections?: string;
  sort?: string;
};

export const createProductAction = async (product: InsertProducts) => {
  try {
    createInsertSchema(products).parse(product);
    const data = await db.insert(products).values(product).returning();
    return { data };
  } catch (err) {
    console.error("Error in createProductAction:", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
};

export const updateProductAction = async (
  productId: string,
  product: InsertProducts,
) => {
  try {
    createInsertSchema(products).parse(product);
    const data = await db
      .update(products)
      .set(product)
      .where(eq(products.id, productId))
      .returning();
    return { data };
  } catch (err) {
    console.error("Error in updateProductAction:", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
};

export const getProductsByIds = async (productIds: string[]) => {
  return await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));
};

export const upsertProductMediasAction = async (
  productId: string,
  mediaIds: string[],
) => {
  await db.delete(productMedias).where(eq(productMedias.productId, productId));
  if (mediaIds.length > 0) {
    await db.insert(productMedias).values(
      mediaIds.map((mediaId, index) => ({
        productId,
        mediaId,
        priority: mediaIds.length - index,
      })),
    );
  }
};

export const getProductGalleryMediaIds = async (
  productId: string,
): Promise<string[]> => {
  const rows = await db
    .select({ mediaId: productMedias.mediaId })
    .from(productMedias)
    .where(eq(productMedias.productId, productId));
  return rows.map((r) => r.mediaId);
};
