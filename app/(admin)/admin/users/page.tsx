import {
  getCurrentUser,
  listUsers,
  UsersColumns,
  AdminUserNav,
} from "@/features/users";
import AdminShell from "@/components/admin/AdminShell";
import { DataTable } from "@/features/cms";
import ErrorToaster from "@/components/layouts/ErrorToaster";

type AdminUsersPageProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

async function UsersPage({ searchParams }: AdminUsersPageProps) {
  const currentUser = await getCurrentUser();

  const users = await listUsers({});

  return (
    <AdminShell heading="Users" description="View and manage customer accounts.">
      <AdminUserNav />
      <DataTable columns={UsersColumns} data={users || []} />
      <ErrorToaster />
    </AdminShell>
  );
}

export default UsersPage;
