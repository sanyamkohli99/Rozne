import { z } from "zod";

export const AddProductToCartSchema = z.object({
  quantity: z.number().min(0).max(8),
  size: z.string().optional(),
});

export type AddProductCartData = z.infer<typeof AddProductToCartSchema>;
