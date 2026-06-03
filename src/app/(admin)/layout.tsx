export const dynamic = "force-dynamic";

import { getCurrentUser, isAdmin } from "@/features/users/actions";
import MainFooter from "@/components/layouts/MainFooter";
import Navbar from "@/components/layouts/MainNavbar";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { cookies } from "next/headers";

type Props = { children: ReactNode };

async function AdminLayout({ children }: Props) {
  // Bypass: check for admin-bypass cookie set by /api/admin-auth
  const cookieStore = cookies();
  const secret = process.env.SESSION_SECRET ?? process.env.ADMIN_TOKEN;
  const bypassCookie = cookieStore.get("admin-bypass")?.value;
  const hasBypass = secret && bypassCookie === secret;

  if (!hasBypass) {
    const currentUser = await getCurrentUser();
    if (!(await isAdmin(currentUser))) {
      redirect(`/sign-in?error=Only authenticated users can access`);
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
