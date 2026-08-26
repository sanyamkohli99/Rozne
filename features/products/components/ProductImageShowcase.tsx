"use client";
import React, { useState } from "react";
import { gql, DocumentType } from "@/gql";

import Image from "next/image";
import { Icons } from "../../../components/layouts/icons";
import { keytoUrl, isVideoUrl } from "@/lib/utils";

type ProductImageShowcaseProps = React.HTMLAttributes<HTMLDivElement> & {
  data: DocumentType<typeof ProductImageShowcaseFragment>;
};

const ProductImageShowcaseFragment = gql(/* GraphQL */ `
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
  const featuredId = data.featuredImage?.id;

  const allImages = [
    ...(data.featuredImage ? [data.featuredImage] : []),
    ...(data.images?.edges
      .map(({ node }) => node.media)
      .filter((img): img is NonNullable<typeof img> => !!img && img.id !== featuredId) || []),
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const nextImage = () => {
    if (activeImageIndex < allImages.length - 1) {
      setActiveImageIndex((prevIndex) => prevIndex + 1);
    }
  };

  const prevImage = () => {
    if (activeImageIndex > 0) {
      setActiveImageIndex((prevIndex) => prevIndex - 1);
    }
  };

  const activeImage = allImages[activeImageIndex];
  const activeIsVideo = activeImage ? isVideoUrl(activeImage.key) : false;

  return (
    <section className="flex md:flex-row flex-col items-center gap-x-8 gap-y-5">
      {/* Active Image/Video Display */}
      <div className="w-full max-w-2xl order-1 md:order-3 grow">
        {activeImage && (
          activeIsVideo ? (
            <video
              src={keytoUrl(activeImage.key)}
              className="w-full h-auto object-cover aspect-square mb-5 cursor-pointer bg-black"
              controls
              preload="metadata"
              onClick={() => setZoomOpen(true)}
            />
          ) : (
            <Image
              src={keytoUrl(activeImage.key)}
              alt={activeImage.alt || "Product image"}
              className="w-full h-auto object-cover aspect-square mb-5 cursor-zoom-in"
              width={1024}
              height={1024}
              onClick={() => setZoomOpen(true)}
            />
          )
        )}
      </div>

      {/* Thumbnails */}
      <div className="relative order-2 overflow-x-auto w-full md:w-[100px] h-full">
        <div className="flex overflow-x-auto gap-x-5 gapy-y-5 order-2 justify-center flex-row md:flex-col">
          {allImages
            .filter((image): image is NonNullable<typeof image> => !!image)
            .map((image, index) => {
              const thumbIsVideo = isVideoUrl(image.key);
              return (
                <div
                  key={image.id}
                  className={`relative aspect-[1/1] cursor-pointer p-1 ${activeImageIndex === index ? "border-2 border-blue-500" : ""}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  {thumbIsVideo ? (
                    <>
                      <video
                        src={keytoUrl(image.key)}
                        className="w-[100px] h-[100px] object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                          <Icons.video className="text-zinc-800" size={10} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <Image
                      src={keytoUrl(image.key)}
                      alt={image.alt || "Product image thumbnail"}
                      width={100}
                      height={100}
                      className="w-[100px] h-[100px] object-cover"
                    />
                  )}
                </div>
              );
            })}
        </div>

        <div className="md:hidden block">
          <button
            onClick={prevImage}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2"
          >
            <Icons.chevronLeft />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-0 top-1/2  md:top-unset transform -translate-y-1/2 bg-gray-800 text-white p-2"
          >
            <Icons.chevronRight />
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setZoomOpen(false)}
        >
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white z-50"
          >
            <Icons.close size={32} />
          </button>

          {activeImageIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-50"
            >
              <Icons.chevronLeft size={40} />
            </button>
          )}

          {activeIsVideo ? (
            <video
              src={keytoUrl(activeImage.key)}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Image
              src={keytoUrl(activeImage.key)}
              alt={activeImage.alt || "Product image zoomed"}
              width={1920}
              height={1920}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {activeImageIndex < allImages.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-50"
            >
              <Icons.chevronRight size={40} />
            </button>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {allImages.map((img, i) => (
              <button
                key={img?.id}
                className={`w-2 h-2 rounded-full ${i === activeImageIndex ? "bg-white" : "bg-white/40"}`}
                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i); }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductImageShowcase;
