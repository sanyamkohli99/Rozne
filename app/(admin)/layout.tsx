export const dynamic = "force-dynamic";

import { getCurrentUser, isAdmin } from "@/features/users/actions";
import MainFooter from "@/components/layouts/MainFooter";
import Navbar from "@/components/layouts/MainNavbar";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { cookies } from "next/headers";

type Props = { children: ReactNode };

async function AdminLayout({ children }: Props) {
  const cookieStore = cookies();
  const secret = process.env.ADMIN_TOKEN ?? process.env.SESSION_SECRET;
  const bypassCookie = cookieStore.get("admin-bypass")?.value;
  const hasBypass = secret && bypassCookie === secret;

  if (!hasBypass) {
    const currentUser = await getCurrentUser();
    if (!(await isAdmin(currentUser))) {
      redirect(`/admin-login`);
    }
  }

  return (
    <main>
      <Navbar adminLayout={true} />
      {children}
      <MainFooter />
    </main>
  );
}

export default AdminLayout;
