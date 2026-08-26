import AdminShell from "@/components/admin/AdminShell";
import { gql } from "@/gql";
import { getClient } from "@/lib/urql";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionsColumns } from "@/features/collections";
import { DataTable } from "@/features/cms";

type AdminCollectionsPageProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

const AdminCollectionsPageQuery = gql(/* GraphQL */ `
  query AdminCollectionsPageQuery {
    collectionsCollection(orderBy: [{ title: AscNullsLast }]) {
      edges {
        node {
          __typename
          id
          ...CollectionColumnsFragment
        }
      }
    }
  }
`);

async function collectionsPage({ searchParams }: AdminCollectionsPageProps) {
  const { data } = await getClient().query(AdminCollectionsPageQuery, {});

  if (!data) return notFound();

  return (
    <AdminShell
      heading="Collections"
      description={"Edit collections from the dashboard. "}
    >
      <section className="flex justify-end items-center pb-5 w-full">
        <Link href="/admin/collections/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 py-2">
          New Collection
        </Link>
      </section>

      <DataTable
        columns={CollectionsColumns}
        data={data.collectionsCollection?.edges || []}
      />
    </AdminShell>
  );
}

export default collectionsPage;
