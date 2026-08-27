import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { DocumentType, gql } from "@/gql";
import { cn, keytoUrl, isVideoUrl } from "@/lib/utils";
import AddToCartButton from "@/features/carts/components/AddToCartButton";
import { AddToWishListButton } from "@/features/wishlists";
import { Rating } from "@/components/ui/rating";
import { BadgeType } from "@/lib/supabase/schema";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/layouts/icons";

type CardProps = React.ComponentProps<"div">;

const LOW_STOCK_THRESHOLD = 5;

export type ProductCardProps = CardProps & {
  product: DocumentType<typeof ProductCardFragment>;
};

export const ProductCardFragment = gql(/* GraphQL */ `
  fragment ProductCardFragment on products {
    id
    name
    description
    rating
    slug
    badge
    price
    stock
    featuredImage: medias {
      id
      key
      alt
    }
    collections {
      id
      label
      slug
    }
  }
`);

export function ProductCard({
  className,
  product,
  ...props
}: ProductCardProps) {
  const { id, name, slug, featuredImage, badge, price } = product;
  const isVideo = isVideoUrl(featuredImage?.key);
  const outOfStock =
    product.stock !== null && product.stock !== undefined && (product.stock as number) <= 0;
  const lowStock =
    !outOfStock &&
    product.stock !== null &&
    product.stock !== undefined &&
    (product.stock as number) > 0 &&
    (product.stock as number) <= LOW_STOCK_THRESHOLD;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:border-border",
        className,
      )}
      {...props}
    >
      {/* Image section */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link href={`/shop/${slug}`} className="block h-full">
          {isVideo ? (
            <>
              <video
                src={keytoUrl(featuredImage.key)}
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                muted
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Icons.video className="text-zinc-800 ml-0.5" size={18} />
                </div>
              </div>
            </>
          ) : (
            <Image
              src={keytoUrl(featuredImage.key)}
              alt={featuredImage.alt}
              width={400}
              height={500}
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          )}
        </Link>

        {/* Gradient overlay at bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {badge && (
            <Badge
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase shadow-sm"
              variant={badge as BadgeType}
            >
              {badge.replace("_", " ")}
            </Badge>
          )}
          {outOfStock && (
            <span className="inline-block rounded-full bg-zinc-900/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase text-white shadow-sm">
              Sold Out
            </span>
          )}
          {lowStock && (
            <span className="inline-block rounded-full bg-amber-400/95 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase text-zinc-900 shadow-sm">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Wishlist — top right, appears on hover */}
        <div className="absolute top-3 right-3 opacity-0 translate-y-[-4px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <Suspense fallback={null}>
            <AddToWishListButton productId={product.id} />
          </Suspense>
        </div>

        {/* Add to Cart — bottom, appears on hover */}
        {!outOfStock && (
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <Suspense fallback={null}>
              <AddToCartButton productId={id} />
            </Suspense>
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="flex flex-col gap-1.5 p-4">
        <Link
          href={`/shop/${slug}`}
          className="text-sm font-semibold leading-tight tracking-tight text-foreground hover:underline underline-offset-2 line-clamp-1"
        >
          {name}
        </Link>

        <p className="text-xs text-muted-foreground line-clamp-1 hidden md:block">
          {product.description}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <p className="text-base font-bold tracking-tight">₹{price}</p>
          <div className="hidden md:block ml-auto">
            <Rating value={product.rating} precision={0.5} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
