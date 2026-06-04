import AdminShell from "@/components/admin/AdminShell";
import { ProductForm } from "@/features/products";
import db from "@/lib/supabase/db";
import { productMedias, products } from "@/lib/supabase/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type EditProjectPageProps = {
  params: {
    productId: string;
  };
};

async function EditProjectPage({
  params: { productId },
}: EditProjectPageProps) {
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });
  if (!product) return notFound();

  let galleryImageIds: string[] = [];
  try {
    const rows = await db
      .select({ mediaId: productMedias.mediaId })
      .from(productMedias)
      .where(eq(productMedias.productId, productId));
    galleryImageIds = rows.map((r) => r.mediaId);
  } catch {
    galleryImageIds = [];
  }

  return (
    <AdminShell
      heading="Edit Product"
      description="Update product details, images, sizes and gallery below."
    >
      <Suspense>
        <ProductForm
          product={product}
          defaultGalleryImageIds={galleryImageIds}
        />
      </Suspense>
    </AdminShell>
  );
}

export default EditProjectPage;
