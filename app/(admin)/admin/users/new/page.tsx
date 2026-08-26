import AdminShell from "@/components/admin/AdminShell";
import { AdminUserForm } from "@/features/users";
import React from "react";

type Props = {};

function NewUserPage({}: Props) {
  return (
    <AdminShell
      heading="Add New User"
      description="Create a new user account. You can set their role and profile details after creation."
      showBackButton={true}
    >
      <AdminUserForm />
    </AdminShell>
  );
}

export default NewUserPage;
