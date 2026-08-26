import React, { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { ProductForm } from "@/features/products";

async function NewProjectPage() {
  return (
    <AdminShell
      heading="Add New Product"
      description="Fill in the details below. Fields marked above are required. You can always edit this product later."
    >
      <Suspense>
        <ProductForm />
      </Suspense>
    </AdminShell>
  );
}

export default NewProjectPage;
