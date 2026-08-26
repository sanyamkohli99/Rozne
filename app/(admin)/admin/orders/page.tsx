import AdminShell from "@/components/admin/AdminShell";
import { DataTable } from "@/features/cms";
import { OrdersColumns } from "@/features/orders";
import { gql } from "@/gql";
import { getClient } from "@/lib/urql";
import { notFound } from "next/navigation";

type AdminOrdersPageProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

const AdminOrdersPageQuery = gql(/* GraphQL */ `
  query AdminOrdersPageQuery {
    ordersCollection(orderBy: [{ created_at: DescNullsLast }]) {
      edges {
        node {
          __typename
          id
          ...OrderColumnsFragment
        }
      }
    }
  }
`);

async function OrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { data } = await getClient().query(AdminOrdersPageQuery, {});

  if (!data) return notFound();

  return (
    <AdminShell
      heading="Orders"
      description={"View all customer orders. Orders are created automatically when customers checkout."}
    >

      <DataTable
        columns={OrdersColumns}
        data={data.ordersCollection.edges || []}
      />
    </AdminShell>
  );
}

export default OrdersPage;
