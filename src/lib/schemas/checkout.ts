import { z } from "zod";

export const orderProductsSchema = z.object({
  orderProducts: z.record(
    z.string(),
    z.object({
      quantity: z.number().min(1),
    }),
  ),
  guest: z.boolean(),
  promoCode: z.string().optional(),
});

export type OrderProductsPayload = z.infer<typeof orderProductsSchema>;

export type ValidatedOrderProducts = OrderProductsPayload["orderProducts"];
