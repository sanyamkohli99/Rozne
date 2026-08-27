import { getProductsByIds } from "@/_actions/products";
import {
  incrementPromoCodeUsage,
  validatePromoCode,
} from "@/_actions/promo-codes";
import type { CartItems } from "@/features/carts";
import { handleApiError } from "@/lib/api/handleError";
import { orderProductsSchema } from "@/lib/schemas/checkout";
import {
  createRazorpayOrder,
  isRazorpayConfigured,
} from "@/lib/razorpay";
import { getRazorpayKeyId } from "@/_actions/credentials";
import db from "@/lib/supabase/db";
import { orderLines, orders } from "@/lib/supabase/schema";
import { getURL } from "@/lib/utils";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();

  const validation = orderProductsSchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid data format." }, { status: 400 });
  }

  if (!(await isRazorpayConfigured())) {
    return NextResponse.json(
      { error: "Online payments are not configured yet." },
      { status: 503 },
    );
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const productsQuantity = await mergeProductDetailsWithQuantities(
      validation.data.orderProducts as unknown as CartItems,
    );

    let amount = calcSubtotal(productsQuantity);
    let discount = 0;

    if (validation.data.promoCode) {
      const promoResult = await validatePromoCode(
        validation.data.promoCode,
        amount,
      );
      if (!promoResult.valid) {
        return NextResponse.json(
          { error: promoResult.message },
          { status: 400 },
        );
      }
      discount = promoResult.discount || 0;
      amount = Math.max(0, amount - discount);
    }

    const insertedOrder = await db
      .insert(orders)
      .values({
        user_id:
          !validation.data.guest
            ? (await supabase.auth.getUser()).data.user.id
            : null,
        currency: "inr",
        amount: `${amount}`,
        order_status: "pending",
        payment_status: "unpaid",
        payment_method: "razorpay",
      })
      .returning();

    const orderId = insertedOrder[0].id;

    await db.insert(orderLines).values(
      productsQuantity.map(({ id, quantity, price }) => ({
        productId: id,
        quantity,
        price: `${price}`,
        orderId,
      })),
    );

    // Razorpay expects the amount in paise (1 INR = 100 paise).
    const razorpayOrder = await createRazorpayOrder({
      amountInPaise: Math.round(amount * 100),
      receipt: orderId,
      notes: validation.data.promoCode
        ? { promoCode: validation.data.promoCode }
        : undefined,
    });

    await db
      .update(orders)
      .set({ razorpay_order_id: razorpayOrder.id })
      .where(eq(orders.id, orderId));

    if (validation.data.promoCode) {
      await incrementPromoCodeUsage(validation.data.promoCode);
    }

    return NextResponse.json({
      dbOrderId: orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: await getRazorpayKeyId(),
      successUrl: `${getURL()}/orders/${orderId}`,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

const calcSubtotal = (
  productsQuantity: (SelectLike & { quantity: number })[],
) =>
  productsQuantity.reduce((acc, cur) => {
    return acc + cur.quantity * parseFloat(cur.price);
  }, 0);

type SelectLike = { id: string; price: string; name: string };

const mergeProductDetailsWithQuantities = async (
  orderProducts: CartItems,
): Promise<(SelectLike & { quantity: number })[]> => {
  const productIds = Object.keys(orderProducts);
  const products = await getProductsByIds(productIds);

  return products.map((product) => ({
    ...product,
    quantity: orderProducts[product.id].quantity,
  }));
};
