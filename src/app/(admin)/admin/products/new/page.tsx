import React, { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { ProductForm } from "@/features/products";

async function NewProjectPage() {
  return (
    <AdminShell
      heading="Add Product"
      description="Fill in the details below — including sizes and gallery images — then press Create Product."
    >
      <Suspense>
        <ProductForm />
      </Suspense>
    </AdminShell>
  );
}

export default NewProjectPage;
