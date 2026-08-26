import Header from "@/components/layouts/Header";
import { Shell } from "@/components/layouts/Shell";
import { SearchProductsGridSkeleton } from "@/features/products";
import { SearchProductsInifiteScroll } from "@/features/search";
import { Suspense } from "react";

interface ProductsPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

async function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Shell>
      <Header heading="Shop Now" />
      <Suspense fallback={<SearchProductsGridSkeleton />}>
        <SearchProductsInifiteScroll />
      </Suspense>
    </Shell>
  );
}

export default ProductsPage;
