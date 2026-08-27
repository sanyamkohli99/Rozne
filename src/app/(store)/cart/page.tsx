import CartSection from "@/features/carts/components/CartSection";
import CartSectionSkeleton from "@/features/carts/components/CartSectionSkeleton";
import { Shell } from "@/components/layouts/Shell";
import {
  RecommendationProducts,
  RecommendationProductsSkeleton,
} from "@/features/products";
import { getEnabledGateways } from "@/_actions/settings";
import { getStripePublishableKey } from "@/lib/stripe";
import { getRazorpayKeyId } from "@/_actions/credentials";

import Link from "next/link";
import { Suspense } from "react";

async function CartPage() {
  const [gateways, stripeKey, razorpayKey] = await Promise.all([
    getEnabledGateways(),
    getStripePublishableKey(),
    getRazorpayKeyId(),
  ]);

  return (
    <Shell>
      <section className="flex justify-between items-center py-8">
        <h1 className="text-3xl">Your Cart</h1>
        <Link href="/shop">Continue shopping</Link>
      </section>

      <Suspense fallback={<CartSectionSkeleton />}>
        <CartSection
          gateways={gateways}
          stripePublishableKey={stripeKey}
          razorpayKeyId={razorpayKey}
        />
      </Suspense>

      <Suspense fallback={<RecommendationProductsSkeleton />}>
        <RecommendationProducts />
      </Suspense>
    </Shell>
  );
}

export default CartPage;
