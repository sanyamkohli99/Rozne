import { getProductsByIds } from "@/_actions/products";
import { validatePromoCode, incrementPromoCodeUsage } from "@/_actions/promo-codes";
import type { CartItems } from "@/features/carts";
import { handleApiError } from "@/lib/api/handleError";
import { orderProductsSchema } from "@/lib/schemas/checkout";
import { stripe } from "@/lib/stripe";
import db from "@/lib/supabase/db";
import { SelectProducts, orders } from "@/lib/supabase/schema";
import { getURL } from "@/lib/utils";
import { orderLines } from "./../../../lib/supabase/schema";

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type OrderProducts = CartItems;

export async function POST(request: Request) {
  const data = await request.json();

  const validation = orderProductsSchema.safeParse(data);
  const supabase = createRouteHandlerClient({ cookies });

  if (!validation.success)
    return NextResponse.json({ error: "Invalid data format." }, { status: 400 });

  try {
    const productsQuantity = await mergeProductDetailsWithQuantities(
      validation.data.orderProducts as unknown as OrderProducts,
    );

    let amount = calcSubtotal(productsQuantity);
    let discount = 0;

    if (data.promoCode) {
      const promoResult = await validatePromoCode(data.promoCode, amount);
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
        user_id: !data.guest
          ? (await supabase.auth.getUser()).data.user.id
          : null,
        currency: "inr",
        amount: `${amount}`,
        order_status: "pending",
        payment_status: "unpaid",
        payment_method: "card",
      })
      .returning();

    await db.insert(orderLines).values(
      productsQuantity.map(({ id, quantity, price }) => ({
        productId: id,
        quantity,
        price: `${price}`,
        orderId: insertedOrder[0].id,
      })),
    );

    const lineItems = productsQuantity.map(({ name, price, quantity }) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: name,
        },
        unit_amount: Math.round((parseFloat(price) * 100) / quantity),
      },
      quantity: quantity,
    }));

    if (discount > 0) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: `Promo: ${data.promoCode!.toUpperCase()} (-₹${discount.toFixed(0)})`,
          },
          unit_amount: -Math.round(discount * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      client_reference_id: insertedOrder[0].id,
      line_items: lineItems,
      mode: "payment",
      allow_promotion_codes: true,
      success_url: `${getURL()}/orders/${insertedOrder[0].id}`,
      cancel_url: `${getURL()}/cart`,
    });

    if (data.promoCode) {
      await incrementPromoCodeUsage(data.promoCode);
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    return handleApiError(err);
  }
}

const calcSubtotal = (
  productsQuantity: (SelectProducts & { quantity: number })[],
) =>
  productsQuantity.reduce((acc, cur) => {
    return acc + cur.quantity * parseFloat(cur.price);
  }, 0);

const mergeProductDetailsWithQuantities = async (
  orderProducts: OrderProducts,
): Promise<(SelectProducts & { quantity: number })[]> => {
  const productIds = Object.keys(orderProducts);
  const products = await getProductsByIds(productIds);

  const orderDetails = products.map((product) => {
    const quantity = orderProducts[product.id].quantity;
    return { ...product, quantity };
  });

  return orderDetails;
};
