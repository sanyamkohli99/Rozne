"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Icons } from "@/components/layouts/icons";
import { Button, ButtonProps } from "@/components/ui/button";
import useCartStore from "../useCartStore";
import useCartActions from "../hooks/useCartActions";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps extends ButtonProps {
  productId: string;
  quantity?: number;
}

const btnClass =
  "h-7 px-4 rounded-full bg-primary text-primary-foreground font-medium text-[11px] leading-none hover:bg-primary/90 transition-colors";

function AddToCartButtonInner({
  productId,
  quantity = 1,
  disabled,
  className,
  ...props
}: AddToCartButtonProps) {
  const { user } = useAuth();
  const { addProductToCart } = useCartActions(user, productId);
  const cart = useCartStore((s) => s.cart);
  const isInCart = !!cart[productId];

  if (isInCart) {
    return (
      <Button
        asChild
        className={cn(btnClass, className)}
      >
        <Link href="/cart" className="flex items-center gap-1.5">
          <Icons.cart className="h-3 w-3" />
          View Cart
        </Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={() => addProductToCart(quantity)}
      disabled={disabled}
      className={cn(btnClass, className)}
      aria-label={disabled ? "Out of stock" : "Add to cart"}
      {...props}
    >
      <Icons.basket className="h-3 w-3" />
      Add to Cart
    </Button>
  );
}

function AddToCartButton(props: AddToCartButtonProps) {
  return (
    <Suspense fallback={null}>
      <AddToCartButtonInner {...props} />
    </Suspense>
  );
}

export default AddToCartButton;
