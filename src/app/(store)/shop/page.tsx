import Header from "@/components/layouts/Header";
import { Shell } from "@/components/layouts/Shell";
import { SearchProductsGridSkeleton } from "@/features/products";
import { SearchProductsInifiteScroll } from "@/features/search";
import { Suspense } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface ProductsPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const categories = [
  { label: "All", href: "/shop" },
  { label: "Sweaters", href: "/collections/sweaters" },
  { label: "Cardigans", href: "/collections/cardigans" },
  { label: "Hosiery", href: "/collections/hosiery" },
];

async function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Shell>
      <Header heading="Shop Now" />

      {/* Category filter pills */}
      <nav aria-label="Product categories" className="flex flex-wrap gap-2 mb-8 -mt-2">
        {categories.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full text-xs tracking-widest uppercase hover:bg-zinc-900 hover:text-white transition-colors"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      <Suspense fallback={<SearchProductsGridSkeleton />}>
        <SearchProductsInifiteScroll />
      </Suspense>
    </Shell>
  );
}

export default ProductsPage;
