import { handleApiError } from "@/lib/api/handleError";
import { calculateShipping } from "@/lib/shipping";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  weight: z.coerce.number().positive().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode."),
  cartValue: z.coerce.number().nonnegative().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const parsed = querySchema.safeParse({
      weight: params.get("weight") ?? undefined,
      pincode: params.get("pincode") ?? "",
      cartValue: params.get("cartValue") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const quote = calculateShipping(
      parsed.data.weight ?? 0,
      parsed.data.pincode,
      parsed.data.cartValue ?? 0,
    );

    if ("error" in quote) {
      return NextResponse.json({ error: quote.error }, { status: 400 });
    }

    return NextResponse.json(quote);
  } catch (err) {
    return handleApiError(err);
  }
}
