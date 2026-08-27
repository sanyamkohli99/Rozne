import { handleApiError } from "@/lib/api/handleError";
import { verifyPaymentSignature } from "@/lib/razorpay";
import db from "@/lib/supabase/db";
import { orders } from "@/lib/supabase/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const parsed = verifySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data format." }, { status: 400 });
    }

    const isValid = await verifyPaymentSignature({
      razorpayOrderId: parsed.data.razorpay_order_id,
      razorpayPaymentId: parsed.data.razorpay_payment_id,
      signature: parsed.data.razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed." },
        { status: 400 },
      );
    }

    const [order] = await db
      .update(orders)
      .set({
        payment_status: "paid",
        order_status: "PREPARING",
        razorpay_payment_id: parsed.data.razorpay_payment_id,
      })
      .where(eq(orders.razorpay_order_id, parsed.data.razorpay_order_id))
      .returning();

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({
      verified: true,
      orderId: order.id,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
