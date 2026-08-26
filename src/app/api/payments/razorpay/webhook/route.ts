import { verifyWebhookSignature } from "@/lib/razorpay";
import db from "@/lib/supabase/db";
import { orders } from "@/lib/supabase/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * Razorpay webhook handler.
 * Configure the webhook in the Razorpay dashboard with:
 *   URL: https://www.rozne.in/api/payments/razorpay/webhook
 *   Secret: same value as RAZORPAY_WEBHOOK_SECRET env var
 *   Events: payment.captured, order.paid
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      order?: { entity?: { id?: string; receipt?: string } };
      payment?: { entity?: { id?: string; order_id?: string; status?: string } };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payment = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;
      const razorpayOrderId =
        payment?.order_id ?? orderEntity?.id ?? undefined;

      if (razorpayOrderId) {
        await db
          .update(orders)
          .set({
            payment_status: "paid",
            order_status: "PREPARING",
            ...(payment?.id ? { razorpay_payment_id: payment.id } : {}),
          })
          .where(eq(orders.razorpay_order_id, razorpayOrderId));
      }
    }
  } catch (err) {
    console.error("[razorpay:webhook]", err);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
