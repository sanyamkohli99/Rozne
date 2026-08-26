import { getCurrentUser } from "@/features/users/actions";
import Hero from "@/components/Hero";

import { Icons } from "@/components/layouts/icons";
import { Shell } from "@/components/layouts/Shell";
import {
  ProductCard,
  ProductCardFragment,
  ProductCardSkeleton,
} from "@/features/products";
import { DocumentType, gql } from "@/gql";
import { getClient } from "@/lib/urql";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import RozneLogo from "@/components/layouts/RozneLogo";
import { getPromoCards } from "@/_actions/promo-cards";
import { SelectPromoCards } from "@/lib/supabase/schema";

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
  const promoCards = await getPromoCards();

  return (
    <main className="pt-5 bg-[#FAF7F2]">
      <Hero />
      <Shell>
        {productsEdges.length > 0 && (
          <FeaturedProductsCards products={productsEdges} />
        )}
        <PromoCards cards={promoCards} />
        <DifferentFeatureCards />
        <LessIsMoreCard />
      </Shell>
    </main>
  );
}

// HeroSection removed – using new premium Hero component from components/Hero.tsx

interface FeaturedProductsCardsProps {
  products: { node: DocumentType<typeof ProductCardFragment> }[];
}

function FeaturedProductsCards({ products }: FeaturedProductsCardsProps) {
  return (
    <section className="container mt-16">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h2 className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-2">New Arrivals</h2>
          <p className="max-w-4xl text-sm md:text-base leading-relaxed text-stone-600">
            Fresh pieces from our latest knitwear collection.
          </p>
        </div>
        <Link href="/shop" className="text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900 transition-colors duration-150 hidden md:block">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <Suspense fallback={[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}>
          {products.map(({ node }) => (
            <ProductCard key={`product-card-${node.id}`} product={node} />
          ))}
        </Suspense>
      </div>
    </section>
  );
}

function DifferentFeatureCards() {
  const features = [
    { Icon: Icons.cart,    title: "Natural Fibres",        description: "We use only premium merino wool, cashmere, and fine cotton in every piece we make." },
    { Icon: Icons.tag,     title: "Transparent Pricing",   description: "No inflated markups. We price fairly so quality knitwear is accessible to everyone." },
    { Icon: Icons.package, title: "Responsible Sourcing",  description: "Every yarn is traceable. We partner only with farms and mills that meet strict ethical standards." },
    { Icon: Icons.award,   title: "Built to Last",         description: "Each garment is designed to be worn season after season, not discarded after one." },
  ];
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 my-20">
      {features.map(({ Icon, title, description }, index) => (
        <div className="bg-white/40 backdrop-blur-sm border border-stone-200/60 rounded-xl p-8 text-center hover:bg-white/60 hover:border-stone-300/80 transition-all duration-200" key={`FeatureCards_${index}`}>
          <div className="flex justify-center items-center mb-5">
            <Icon width={28} height={28} className="text-stone-400" />
          </div>
          <h4 className="text-xs font-medium tracking-[0.15em] uppercase text-stone-700 mb-3">{title}</h4>
          <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
        </div>
      ))}
    </section>
  );
}

function LessIsMoreCard() {
  return (
    <section className="max-w-[1920px] mx-auto bg-stone-100/80 grid grid-cols-12 my-20">
      <div className="relative w-full h-[340px] md:h-[520px] col-span-12 md:col-span-8 overflow-hidden">
        <Image
          src="/assets/lessismore.jpg"
          alt="ROZNE Knitwear Detail"
          fill
          quality={85}
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover object-center"
        />
      </div>
      <div className="col-span-12 md:col-span-4 flex flex-col justify-center px-8 md:px-14 py-12 md:py-0">
        <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-4">Our Philosophy</p>
        <h2 className="text-2xl md:text-3xl font-light mb-4 leading-snug text-stone-800">Slow Fashion.<br />Real Craft.</h2>
        <p className="text-sm leading-relaxed text-stone-500 mb-8 max-w-sm">
          We believe you should never have to choose between quality and conscience.
          Every sweater, cardigan and knit we make is built to outlast trends —
          because the most sustainable garment is the one you keep wearing.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-stone-900/70 backdrop-blur-sm text-white px-6 py-3 text-xs tracking-widest uppercase font-medium hover:bg-stone-800/80 transition-all duration-200 w-fit"
        >
          Shop the Collection
        </Link>
      </div>
    </section>
  );
}

function PromoCards({ cards }: { cards: SelectPromoCards[] }) {
  const objectPositions: Record<number, string> = {
    3: "object-[center_35%]",
  };

  return (
    <section className="my-20">
      {cards.map((card, i) => {
        const reverse = i % 2 !== 0;
        const catchphraseLeft = i % 2 === 0;
        const pos = objectPositions[card.position] || "object-center";
        return (
          <div key={card.id}>
            <Link
              href="/shop"
              className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} bg-stone-100/60 overflow-hidden group`}
            >
              <div className="relative w-full h-[320px] md:h-[480px] md:w-1/2 overflow-hidden">
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  fill
                  quality={85}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover ${pos} transition-transform duration-300 group-hover:scale-105`}
                />
              </div>
              <div className="flex flex-col justify-center px-8 md:px-14 py-12 md:w-1/2">
                <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3">ROZNE</p>
                <h3 className="text-2xl md:text-3xl font-light mb-4 leading-snug text-stone-800">{card.title}</h3>
                <p className="text-sm leading-relaxed text-stone-500 mb-8 max-w-md">{card.description}</p>
                <span className="inline-block text-xs tracking-widest uppercase bg-stone-900/70 backdrop-blur-sm text-white px-6 py-3 w-fit hover:bg-stone-800/80 transition-all duration-200">
                  Shop Now
                </span>
              </div>
            </Link>
            {card.catchphrase && (
              <div className={`py-16 md:py-24 flex flex-col ${catchphraseLeft ? "items-start text-left pl-4 md:pl-16" : "items-end text-right pr-4 md:pr-16"}`}>
                <p className="text-xl md:text-3xl font-light text-stone-700 italic mb-4 max-w-lg">
                  {card.catchphrase}
                </p>
                {card.catchphraseDesc && (
                  <p className="text-sm md:text-base text-stone-500 max-w-md leading-relaxed">
                    {card.catchphraseDesc}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
