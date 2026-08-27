"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ...props
}: AddToCartButtonProps) {
  const { user } = useAuth();
  const { addProductToCart } = useCartActions(user, productId);
  const router = useRouter();
  const cart = useCartStore((s) => s.cart);
  const isInCart = !!cart[productId];

  const handleAddToCart = () => {
    addProductToCart(quantity);
  };

  const handleBuyNow = async () => {
    addProductToCart(quantity);
    router.push("/cart");
  };

  return (
    <div className={cn("flex gap-2", props.className)}>
      {isInCart ? (
        <Button
          asChild
          className="h-11 flex-1 rounded-full bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-colors"
        >
          <Link href="/cart">
            <Icons.cart className="mr-2 h-4 w-4" />
            View Cart
          </Link>
        </Button>
      ) : (
        <>
          <Button
            onClick={handleAddToCart}
            disabled={disabled}
            className="h-11 flex-1 rounded-full bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-colors"
            aria-label={disabled ? "Out of stock" : "Add to cart"}
            {...props}
          >
            <Icons.basket className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={disabled}
            variant="outline"
            className="h-11 rounded-full border-border font-semibold text-sm hover:bg-accent transition-colors"
            aria-label={disabled ? "Out of stock" : "Buy now"}
          >
            Buy Now
          </Button>
        </>
      )}
    </div>
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
