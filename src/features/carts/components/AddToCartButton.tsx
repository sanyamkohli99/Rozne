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
        className={cn(
          "h-9 w-full rounded-full bg-foreground text-background font-semibold text-xs hover:bg-foreground/90 transition-colors",
          className,
        )}
      >
        <Link href="/cart">
          <Icons.cart className="mr-2 h-4 w-4" />
          View Cart
        </Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={() => addProductToCart(quantity)}
      disabled={disabled}
          className={cn(
            "h-9 w-full rounded-full bg-foreground text-background font-semibold text-xs hover:bg-foreground/90 transition-colors",
            className,
          )}
      aria-label={disabled ? "Out of stock" : "Add to cart"}
      {...props}
    >
      <Icons.basket className="mr-2 h-4 w-4" />
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
