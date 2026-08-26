"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

type BuyNowButtonProps = {
  productId: string;
};

function BuyNowButton({ productId }: BuyNowButtonProps) {
  return (
    <Link
      href="/cart"
      className={cn(
        buttonVariants({ variant: "outline" }),
        "w-full justify-center"
      )}
    >
      Buy Now — View Cart
    </Link>
  );
}

export default BuyNowButton;
