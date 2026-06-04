import { getCurrentUser } from "@/features/users/actions";
import { Icons } from "@/components/layouts/icons";
import { Shell } from "@/components/layouts/Shell";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  CollectionCardFragment,
  CollectionsCard,
  CollectionsCardSkeleton,
} from "@/features/collections";
import {
  ProductCard,
  ProductCardFragment,
  ProductCardSkeleton,
} from "@/features/products";
import { DocumentType, gql } from "@/gql";
import { getClient } from "@/lib/urql";
import { cn, keytoUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import RozneLogo from "@/components/layouts/RozneLogo";

const LandingRouteQuery = gql(/* GraphQL */ `
  query LandingRouteQuery($user_id: UUID) {
    products: productsCollection(
      filter: { featured: { eq: true } }
      first: 4
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          ...ProductCardFragment
        }
      }
    }

    wishlistCollection(filter: { user_id: { eq: $user_id } }) {
      edges {
        node {
          product_id
        }
      }
    }

    cartsCollection(filter: { user_id: { eq: $user_id } }) {
      edges {
        node {
          product_id
          quantity
        }
      }
    }

    collectionScrollCards: collectionsCollection(
      first: 6
      orderBy: [{ order: DescNullsLast }]
    ) {
      edges {
        node {
          id
          ...CollectionCardFragment
        }
      }
    }
  }
`);

export default async function Home() {
  const currentUser = await getCurrentUser();

  const { data, error } = await getClient().query(LandingRouteQuery, {
    user_id: currentUser?.id,
  });

  if (error) {
    console.error("GraphQL Error:", error);
  }

  const productsEdges = data?.products?.edges || [];
  const collectionEdges = data?.collectionScrollCards?.edges || [];

  return (
    <main>
      <HeroSection />

      <Shell>
        {collectionEdges.length > 0 ? (
          <ProductSubCollectionsCircles collections={collectionEdges} />
        ) : null}

        {productsEdges.length > 0 ? (
          <FeaturedProductsCards products={productsEdges} />
        ) : null}

        <CollectionGrid />

        <DifferentFeatureCards />

        <LessIsMoreCard />
      </Shell>
    </main>
  );
}

function HeroSection() {
  return (
    <section className="w-full h-screen md:h-[800px] mx-auto flex justify-center bg-zinc-900 overflow-hidden">
      {/* Full-bleed background */}
      <div className="absolute inset-0 h-screen md:h-[800px]">
        <Image
          alt="ROZNE Knitwear Collection"
          src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=1920"
          width={1920}
          height={1200}
          priority={true}
          className="h-full w-full object-cover opacity-55"
        />
        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/30 via-transparent to-zinc-900/70" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-8 h-screen md:h-[800px] w-full">
        <div className="flex flex-col justify-center h-full gap-y-6">

          {/* Large hero logo — the brand mark front and center */}
          <div className="text-white">
            <RozneLogo className="text-5xl md:text-8xl" />
          </div>

          {/* Tagline */}
          <p className="text-white/75 text-sm md:text-base max-w-xs leading-relaxed tracking-wide font-light">
            Sweaters, cardigans &amp; hosiery
            <br />
            crafted for real warmth.
          </p>

          {/* CTA */}
          <div className="flex items-center gap-x-4">
            <Link
              href="/shop"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border border-white/70 text-white rounded-none px-8 py-3 text-xs tracking-widest uppercase",
                "md:px-14 md:py-5",
                "hover:text-zinc-900 hover:bg-white hover:border-white transition-all",
              )}
            >
              Shop Collection
            </Link>
            <Link
              href="/collections"
              className="text-white/60 text-xs tracking-widest uppercase hover:text-white transition-colors"
            >
              View all →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FeaturedProductsCardsProps {
  products: { node: DocumentType<typeof ProductCardFragment> }[];
}

interface CollectionsCardsProps {
  collections: { node: DocumentType<typeof CollectionCardFragment> }[];
}

function ProductSubCollectionsCircles({ collections }: CollectionsCardsProps) {
  return (
    <section className="flex justify-start items-center gap-x-10 overflow-auto py-12">
      {collections.map(({ node }) => (
        <Link
          href={`/collections/${node.slug}`}
          key={`collection_circle_${node.id}`}
        >
          <div
            className={cn(
              "relative bg-secondary rounded-full flex justify-center items-center",
              "w-[280px] h-[280px]",
            )}
          >
            <Image
              src={keytoUrl(node.featuredImage.key)}
              alt={node.featuredImage.alt}
              width={320}
              height={320}
              className={cn(
                "object-center object-cover hover:scale-105 transition-all duration-500",
                "w-[240px] h-[240px]",
              )}
            />
          </div>
          <p className="text-black text-center mt-3 font-semibold">
            {node.label}
          </p>
        </Link>
      ))}
    </section>
  );
}

function FeaturedProductsCards({ products }: FeaturedProductsCardsProps) {
  return (
    <section className="container mt-12">
      <div className="">
        <h2 className="font-semibold text-2xl md:text-3xl mb-1 md:mb-3">
          New Arrivals
        </h2>
        <p className="max-w-4xl text-sm md:text-md leading-[1.5] tracking-[-2%] mb-2">
          Fresh pieces from our latest knitwear collection — merino sweaters,
          textured cardigans and fine hosiery to carry you through the season.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12 py-5 overflow-auto">
        <Suspense
          fallback={[...Array(4)].map((_, index) => (
            <ProductCardSkeleton key={`Product-Skeleton-${index}`} />
          ))}
        >
          {products.map(({ node }) => (
            <ProductCard key={`product-card-${node.id}`} product={node} />
          ))}
        </Suspense>
      </div>
    </section>
  );
}

function CollectionGrid() {
  return (
    <section className="relative lg:space-x-5 space-y-5 lg:space-y-0 grid grid-cols-1 lg:grid-cols-3 max-h-[840px]">
      <div className="relative col-span-2 w-full h-[840px]">
        <Image
          src="https://images.unsplash.com/photo-1614251055880-ee96e4803393?auto=format&fit=crop&q=80&w=1920"
          width={1080}
          height={1080}
          className="object-cover w-full h-full"
          alt="Sweater Collection"
        />
        <div className="bg-zinc-800/20 flex justify-center items-center flex-col absolute w-full h-full top-0 left-0 text-white">
          <p className="text-5xl mb-3">Sweaters</p>
          <p className="font-light mb-8">Designed for every temperature</p>
          <Link
            className={cn(buttonVariants({ size: "lg" }), "text-xl py-8 px-10")}
            href={"/collections/sweaters"}
          >
            Discover Now
          </Link>
        </div>
      </div>

      <div className="flex flex-col w-full space-y-5 h-[840px]">
        <div className="relative w-full h-[415px]">
          <Image
            src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800"
            width={800}
            height={900}
            className="object-cover w-full h-full"
            alt="Cardigans Collection"
          />
          <div className="bg-zinc-800/10 flex justify-center items-center flex-col absolute w-full h-full top-0 left-0 text-white">
            <p className="text-3xl mb-2">Cardigans</p>
            <Link
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-white text-white hover:text-zinc-900")}
              href={"/collections/cardigans"}
            >
              Shop Now
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden flex-1">
          <Image
            src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&q=80&w=800"
            width={800}
            height={900}
            className="object-cover w-full h-full"
            alt="Hosiery Collection"
          />
          <div className="bg-zinc-800/10 flex justify-center items-center flex-col absolute w-full h-full top-0 left-0 text-white">
            <p className="text-3xl mb-2">Hosiery</p>
            <Link
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-white text-white hover:text-zinc-900")}
              href={"/collections/hosiery"}
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function DifferentFeatureCards() {
  const features = [
    {
      Icon: Icons.cart,
      title: "Natural Fibres",
      description:
        "We use only premium merino wool, cashmere, and fine cotton in every piece we make.",
    },
    {
      Icon: Icons.tag,
      title: "Transparent Pricing",
      description:
        "No inflated markups. We price fairly so quality knitwear is accessible to everyone.",
    },
    {
      Icon: Icons.package,
      title: "Responsible Sourcing",
      description:
        "Every yarn is traceable. We partner only with farms and mills that meet strict ethical standards.",
    },
    {
      Icon: Icons.award,
      title: "Built to Last",
      description:
        "Each garment is designed to be worn season after season, not discarded after one.",
    },
  ];
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 pt-5 gap-y-8 gap-x-5 md:gap-x-12 mx-auto">
      {features.map(({ Icon, title, description }, index) => (
        <div
          className="text-center max-w-[18rem]"
          key={`FeatureCards_${index}`}
        >
          <div className="flex justify-center items-center p-5">
            <Icon
              width={45}
              height={45}
              className="mb-5 text-zinc-400 font-light"
            />
          </div>

          <h4 className="text-xl font-serif font-extralight mb-3">{title}</h4>
          <p className="text-lg text-muted-foreground">{description}</p>
        </div>
      ))}
    </section>
  );
}

function LessIsMoreCard() {
  return (
    <section className="max-w-[1920px] mx-auto h-[620px] md:h-[580px] bg-[#FFF8EE] grid grid-cols-12 my-16">
      <div className="relative w-full h-[340px] md:h-[580px] col-span-12 md:col-span-8 overflow-hidden">
        <Image
          src={"/assets/cutingcardImage.jpg"}
          alt="ROZNE Knitwear Detail"
          fill
          className="object-cover object-center"
        />
      </div>

      <div className="col-span-12 md:col-span-4 pb-6 md:py-20 px-6 md:px-16">
        <h2 className="text-xl md:text-3xl font-semibold mb-3">
          Slow Fashion. Real Craft.
        </h2>
        <p className="text-xs leading-[1.5] md:text-lg tracking-tight mb-5 md:mb-12 text-left max-w-md">
          We believe you should never have to choose between quality and
          conscience. Every sweater, cardigan and knit we make is built to
          outlast trends — because the most sustainable garment is the one
          you keep wearing.
        </p>
        <Link
          href="/shop"
          className={cn(buttonVariants(), "rounded-full text-xs md:text-md")}
        >
          Shop the Collection
        </Link>
      </div>
    </section>
  );
}
