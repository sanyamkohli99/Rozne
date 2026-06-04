import AdminShell from "@/components/admin/AdminShell";
import { ProductForm } from "@/features/products";
import type { SelectProducts } from "@/lib/supabase/schema";
import { gql } from "@/gql";
import { getClient } from "@/lib/urql";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type EditProjectPageProps = {
  params: {
    productId: string;
  };
};

const AdminEditProductQuery = gql(`
  query AdminEditProductQuery($productId: String!) {
    productsCollection(filter: { id: { eq: $productId } }) {
      edges {
        node {
          id
          name
          slug
          description
          featured
          badge
          rating
          price
          tags
          sizes
          images
          stock
          totalComments
          createdAt: created_at
          collection_id
          featured_image_id
          collections {
            id
            label
          }
        }
      }
    }
  }
`);

async function EditProjectPage({
  params: { productId },
}: EditProjectPageProps) {
  const { data, error } = await getClient().query(AdminEditProductQuery, {
    productId,
  });

  if (error || !data?.productsCollection?.edges?.length) {
    console.error("GQL error in admin product page:", error);
    return notFound();
  }

  const raw = data.productsCollection.edges[0].node;

  const product: SelectProducts = {
    ...raw,
    collectionId: (raw as any).collection_id ?? null,
    featuredImageId: (raw as any).featured_image_id,
  };

  return (
    <AdminShell
      heading="Edit Product"
      description="Update product details, images, sizes and gallery below."
    >
      <Suspense>
        <ProductForm product={product} />
      </Suspense>
    </AdminShell>
  );
}

export default EditProjectPage;
