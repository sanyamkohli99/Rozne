"use client";
import React, { useState } from "react";
import { gql, DocumentType } from "@/gql";
import Image from "next/image";
import { cn, keytoUrl } from "@/lib/utils";
import { Icons } from "../../../components/layouts/icons";

type ProductImageShowcaseProps = React.HTMLAttributes<HTMLDivElement> & {
  data: DocumentType<typeof ProductImageShowcaseFragment>;
};

export const ProductImageShowcaseFragment = gql(/* GraphQL */ `
  fragment ProductImageShowcaseFragment on products {
    id
    featuredImage: medias {
      id
      key
      alt
    }
    images: product_mediasCollection(orderBy: [{ priority: DescNullsLast }]) {
      edges {
        node {
          media {
            id
            key
            alt
          }
        }
      }
    }
  }
`);

function ProductImageShowcase({ data }: ProductImageShowcaseProps) {
  const allImages = [
    data.featuredImage,
    ...(data.images?.edges.map(({ node }) => node.media) || []),
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const goToImage = (index: number) => { if (index !== activeImageIndex) setActiveImageIndex(index); };
  const nextImage = () => { if (activeImageIndex < allImages.length - 1) goToImage(activeImageIndex + 1); };
  const prevImage = () => { if (activeImageIndex > 0) goToImage(activeImageIndex - 1); };

  return (
    <section className="flex md:flex-row flex-col items-start gap-x-4 gap-y-5">
      <div className="w-full order-1 md:order-3 grow">
        {allImages[activeImageIndex] && (
          <div className="relative w-full aspect-square overflow-hidden bg-zinc-50">
            <Image
              key={allImages[activeImageIndex].id}
              src={keytoUrl(allImages[activeImageIndex].key)}
              alt={allImages[activeImageIndex].alt || "Product image"}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover object-center transition-opacity duration-300"
              priority={activeImageIndex === 0}
            />
            {allImages.length > 1 && (
              <>
                <button onClick={prevImage} disabled={activeImageIndex === 0}
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-1.5 shadow transition-all disabled:opacity-0"
                  aria-label="Previous image">
                  <Icons.chevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextImage} disabled={activeImageIndex === allImages.length - 1}
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-1.5 shadow transition-all disabled:opacity-0"
                  aria-label="Next image">
                  <Icons.chevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {allImages.map((_, i) => (
                    <button key={i} onClick={() => goToImage(i)}
                      className={cn("w-1.5 h-1.5 rounded-full transition-all duration-200",
                        i === activeImageIndex ? "bg-zinc-800 scale-125" : "bg-zinc-400 hover:bg-zinc-600")}
                      aria-label={`Go to image ${i + 1}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="relative order-2 w-full md:w-[88px] flex-shrink-0">
        <div className="flex flex-row overflow-x-auto gap-2 md:flex-col md:gap-y-2">
          {allImages.map((image, index) => (
            <button key={image.id} type="button" onClick={() => goToImage(index)}
              aria-label={`View image ${index + 1}`}
              className={cn("relative flex-shrink-0 w-16 h-16 md:w-full md:h-[84px] overflow-hidden border-2 transition-all duration-200",
                index === activeImageIndex ? "border-zinc-900" : "border-transparent opacity-55 hover:opacity-85 hover:border-zinc-300")}>
              <Image src={keytoUrl(image.key)} alt={image.alt || `Thumbnail ${index + 1}`} fill className="object-cover object-center" />
            </button>
          ))}
        </div>
        {allImages.length > 1 && (
          <div className="md:hidden flex justify-between items-center mt-3">
            <button onClick={prevImage} disabled={activeImageIndex === 0}
              className="bg-zinc-800 text-white p-2 disabled:opacity-30 transition-opacity" aria-label="Previous">
              <Icons.chevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-zinc-500">{activeImageIndex + 1} / {allImages.length}</span>
            <button onClick={nextImage} disabled={activeImageIndex === allImages.length - 1}
              className="bg-zinc-800 text-white p-2 disabled:opacity-30 transition-opacity" aria-label="Next">
              <Icons.chevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductImageShowcase;
