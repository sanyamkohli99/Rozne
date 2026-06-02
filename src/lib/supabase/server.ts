import { CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient({
  cookieStore,
  isAdmin = false,
}: {
  cookieStore: ReturnType<typeof cookies>;
  isAdmin?: boolean;
}) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    isAdmin
      ? process.env.DATABASE_SERVICE_ROLE!
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    },
  );
}

export default createClient;
