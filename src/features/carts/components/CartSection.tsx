"use client";
import { useAuth } from "@/providers/AuthProvider";
import UserCartSection from "./UserCartSection";
import GuestCartSection from "./GuestCartSection";
import type { PaymentGatewayFlags } from "@/lib/supabase/schema";

type Props = {
  gateways?: PaymentGatewayFlags;
  stripePublishableKey?: string;
};

function CartSection({ gateways, stripePublishableKey }: Props) {
  const { user } = useAuth();

  return <>{user
    ? <UserCartSection user={user} gateways={gateways} stripePublishableKey={stripePublishableKey} />
    : <GuestCartSection gateways={gateways} stripePublishableKey={stripePublishableKey} />
  }</>;
}

export default CartSection;
