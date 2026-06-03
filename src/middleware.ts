import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://ijhzkrbxahlhpkcextwl.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin bypass ──────────────────────────────────────────────────────────
  // If the request is for any /admin* route (but not /admin-login itself or
  // its API), check for the bypass cookie set by /api/admin-auth.
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin-login") &&
    !pathname.startsWith("/api/admin-auth")
  ) {
    const adminSecret = process.env.ADMIN_TOKEN ?? process.env.SESSION_SECRET;
    const bypassCookie = request.cookies.get("admin-bypass")?.value;

    if (adminSecret && bypassCookie === adminSecret) {
      // Valid bypass cookie — let the request through without Supabase check
      return NextResponse.next({ request: { headers: request.headers } });
    }

    // No valid bypass — redirect to the admin login page
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin-login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }
  // ─────────────────────────────────────────────────────────────────────────

  // For all other routes, refresh the Supabase session if possible
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    });

    await supabase.auth.getUser();
  } catch {
    // Supabase session refresh failed — not fatal, continue
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/cart/:path*",
  ],
};
