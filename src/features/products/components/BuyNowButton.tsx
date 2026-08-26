"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

type BuyNowButtonProps = {
  productId: string;
  disabled?: boolean;
};

function BuyNowButton({ productId, disabled = false }: BuyNowButtonProps) {
  return (
    <Link
      href="/cart"
      aria-disabled={disabled}
      onClick={(e) => disabled && e.preventDefault()}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "w-full justify-center",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {disabled ? "Out of Stock" : "Buy Now — View Cart"}
    </Link>
  );
}

export default BuyNowButton;
