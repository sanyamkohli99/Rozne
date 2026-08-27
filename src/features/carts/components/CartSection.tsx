"use client";
import { useAuth } from "@/providers/AuthProvider";
import UserCartSection from "./UserCartSection";
import GuestCartSection from "./GuestCartSection";
import type { PaymentGatewayFlags } from "@/lib/supabase/schema";

type Props = {
  gateways?: PaymentGatewayFlags;
  stripePublishableKey?: string;
  razorpayKeyId?: string;
};

function CartSection({ gateways, stripePublishableKey, razorpayKeyId }: Props) {
  const { user } = useAuth();

  return <>{user
    ? <UserCartSection user={user} gateways={gateways} stripePublishableKey={stripePublishableKey} razorpayKeyId={razorpayKeyId} />
    : <GuestCartSection gateways={gateways} stripePublishableKey={stripePublishableKey} razorpayKeyId={razorpayKeyId} />
  }</>;
}

export default CartSection;
