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
import ShipReturns from "@/features/products/components/ShipReturns";
import { AddToWishListButton } from "@/features/wishlists";
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

async function ProductDetailPage({ params }: Props) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
    {
      method: "POST",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `query ProductDetailPageQuery($productSlug: String) {
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
                size_chart
                stock
                totalComments
                featuredImage: medias { id key alt }
                images: product_mediasCollection(orderBy: [{ priority: DescNullsLast }]) {
                  edges { node { media { id key alt } } }
                }
                commentsCollection(first: 5) {
                  edges { node { id comment profile { name } } }
                }
                collections { id label slug }
              }
            }
          }
          recommendations: productsCollection(first: 4) {
            edges {
              node {
                id
                name
                description
                rating
                slug
                badge
                price
                featuredImage: medias { id key alt }
                collections { id label slug }
              }
            }
          }
        }`,
        variables: { productSlug: params.slug as string },
      }),
      cache: "no-store",
    },
  );

  const json = await res.json();
  const data = json.data;

  if (!data || !data.productsCollection || !data.productsCollection.edges)
    return notFound();

  const { id, name, description, price, sizes, size_chart: sizeChart, commentsCollection, totalComments } =
    data.productsCollection.edges[0].node;

  const stock = data.productsCollection.edges[0].node.stock;
  const outOfStock = stock !== null && stock !== undefined && stock <= 0;

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
              {outOfStock && (
                <p className="mt-2 inline-block bg-zinc-900/85 text-white text-[10px] tracking-widest uppercase px-3 py-1.5">
                  Out of Stock
                </p>
              )}
            </div>
            <AddToWishListButton productId={id} />
          </section>

          <section className="mb-6 max-w-lg space-y-4">
            <Suspense>
              <AddProductToCartForm
                productId={id}
                disabled={outOfStock}
                availableSizes={
                  (() => {
                    const raw = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
                    return Array.isArray(raw) ? raw : [];
                  })()
                }
              />
            </Suspense>

            <div className="flex items-center gap-x-3">
              <SizeChartDialog sizeChart={sizeChart} />
            </div>

            <BuyNowButton productId={id} disabled={outOfStock} />
          </section>

          <section className="max-w-lg">
            {description && (
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 mb-4">
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
                <AccordionContent>
                  <ShipReturns />
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
