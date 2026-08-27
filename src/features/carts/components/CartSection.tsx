"use client";
import { useAuth } from "@/providers/AuthProvider";
import UserCartSection from "./UserCartSection";
import GuestCartSection from "./GuestCartSection";
import type { PaymentGatewayFlags } from "@/lib/supabase/schema";

type Props = {
  gateways?: PaymentGatewayFlags;
};

function CartSection({ gateways }: Props) {
  const { user } = useAuth();

  return <>{user ? <UserCartSection user={user} gateways={gateways} /> : <GuestCartSection gateways={gateways} />}</>;
}

export default CartSection;
