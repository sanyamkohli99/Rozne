import { Suspense } from "react";
import Header from "@/components/layouts/Header";
import { Shell } from "@/components/layouts/Shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AddProductToCartForm } from "@/features/carts";
import { ProductCommentsSection } from "@/features/comments";
import {
  BuyNowButton,
  ProductCard,
  ProductImageShowcase,
  SizeChartDialog,
} from "@/features/products";
import { AddToWishListButton } from "@/features/wishlists";
import { gql } from "@/gql";
import { getClient } from "@/lib/urql";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: {
    slug: string;
  };
};

export const metadata: Metadata = {
  title: `ROZNE | Premium Knitwear & Hosiery`,
  description: "Discover handcrafted sweaters, cardigans and hosiery at ROZNE.",
};

const ProductDetailPageQuery = gql(/* GraphQL */ `
  query ProductDetailPageQuery($productSlug: String) {
    productsCollection(filter: { slug: { eq: $productSlug } }) {
      edges {
        node {
          id
          name
          description
          rating
          price
          tags
          sizes
          totalComments
          ...ProductImageShowcaseFragment
          commentsCollection(first: 5) {
            edges {
              node {
                ...ProductCommentsSectionFragment
              }
            }
          }
          collections {
            id
            label
            slug
          }
        }
      }
    }
    recommendations: productsCollection(first: 4) {
      edges {
        node {
          id
          ...ProductCardFragment
        }
      }
    }
  }
`);

async function ProductDetailPage({ params }: Props) {
  const { data, error } = await getClient().query(
    ProductDetailPageQuery,
    {
      productSlug: params.slug as string,
    },
    { requestPolicy: "network-only" }
  );

  if (!data || !data.productsCollection || !data.productsCollection.edges)
    return notFound();

  const { id, name, description, price, sizes, commentsCollection, totalComments } =
    data.productsCollection.edges[0].node;

  console.log("DEBUG: Sizes from GraphQL:", sizes);

  return (
    <Shell>
      <div className="grid grid-cols-12 gap-x-8">
        <div className="space-y-8 relative col-span-12 md:col-span-7">
          <ProductImageShowcase data={data.productsCollection.edges[0].node} />
        </div>

        <div className="col-span-12 md:col-span-5">
          <section className="flex justify-between items-start max-w-lg mb-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-wide mb-2">
                {name}
              </h1>
              <p className="text-2xl font-semibold mb-1">{`₹${price}`}</p>
              <p className="text-xs text-muted-foreground">
                Tax included. Shipping calculated at checkout.
              </p>
            </div>
            <AddToWishListButton productId={id} />
          </section>

          <section className="mb-6 max-w-lg space-y-4">
            <Suspense>
              <AddProductToCartForm
                productId={id}
                availableSizes={
                  typeof sizes === "string" 
                    ? JSON.parse(sizes as string) 
                    : (sizes as string[])
                }
              />
            </Suspense>

            <div className="flex items-center gap-x-3">
              <SizeChartDialog />
            </div>

            <BuyNowButton productId={id} />
          </section>

          <section className="max-w-lg">
            {description && (
              <p className="text-sm leading-relaxed text-zinc-700 mb-4">
                {description}
              </p>
            )}

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="material">
                <AccordionTrigger className="text-sm font-medium">
                  Material &amp; Care
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Crafted from premium natural fibres selected for softness,
                    warmth, and longevity. Each piece is knitted with care to
                    ensure lasting quality.
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Hand wash cold or dry clean recommended</li>
                    <li>Do not tumble dry — lay flat to dry</li>
                    <li>Cool iron if needed; do not iron ribbing</li>
                    <li>Store folded, not hung, to retain shape</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fit">
                <AccordionTrigger className="text-sm font-medium">
                  Fit &amp; Sizing
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Our knitwear is designed with a relaxed, easy fit. If you
                    prefer a slimmer silhouette, we recommend sizing down one
                    size.
                  </p>
                  <p>
                    Model is 5′8″ and wears size S. Garment measurements vary
                    by style — refer to the Size Guide for exact measurements.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping">
                <AccordionTrigger className="text-sm font-medium">
                  Shipping &amp; Returns
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Free standard shipping on orders over ₹80. Express and
                    overnight options available at checkout.
                  </p>
                  <p>
                    Returns and exchanges accepted within 30 days of delivery
                    for unworn, unwashed items with tags attached. Innerwear and
                    personalised items are final sale.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </div>

      <Header heading="You May Also Like" />

      <div className="container grid grid-cols-2 lg:grid-cols-4 gap-x-8">
        {data.recommendations &&
          data.recommendations.edges.map(({ node }) => (
            <ProductCard key={node.id} product={node} />
          ))}
      </div>

      <ProductCommentsSection
        comments={
          commentsCollection
            ? commentsCollection.edges.map(({ node }) => node)
            : []
        }
        totalComments={totalComments}
      />
    </Shell>
  );
}

export default ProductDetailPage;
