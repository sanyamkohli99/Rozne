import AdminShell from "@/components/admin/AdminShell";
import { CollectionForm } from "@/features/collections";

type Props = {};

async function NewProjectPage({}: Props) {
  return (
    <AdminShell
      heading="Add Collection"
      description="Create a new collection to group related products together."
    >
      <CollectionForm />
    </AdminShell>
  );
}

export default NewProjectPage;
