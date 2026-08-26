import AdminShell from "@/components/admin/AdminShell";
import { DataTableSkeleton } from "@/features/cms";
import { ProductsColumns, ProductsDataTable } from "@/features/products";
import { gql } from "@/gql";
import { getClient } from "@/lib/urql";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type AdminProjectsPageProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

async function ProductsPage({ searchParams }: AdminProjectsPageProps) {
  const AdminProductsPageQuery = gql(/* GraphQL */ `
    query AdminProductsPageQuery {
      productsCollection(orderBy: [{ created_at: DescNullsLast }]) {
        edges {
          node {
            id
            ...ProductColumnFragment
          }
        }
      }
    }
  `);

  const { data } = await getClient().query(AdminProductsPageQuery, {});

  if (!data) return notFound();

  return (
    <AdminShell
      heading="Products"
      description={"All products listed on your shop. Click any product to edit its details, images, or pricing."}
    >
      <section className="flex justify-end items-center pb-5 w-full">
        <Link href="/admin/products/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 py-2">
          New Product
        </Link>
      </section>

      <Suspense fallback={<DataTableSkeleton />}>
        <ProductsDataTable
          columns={ProductsColumns}
          data={data.productsCollection?.edges || []}
        />
      </Suspense>
    </AdminShell>
  );
}

export default ProductsPage;
