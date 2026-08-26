import { CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ijhzkrbxahlhpkcextwl.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_CcSxvC-OxEhrmP3FI37eXQ_NPGDnbt1";

export function createClient({
  cookieStore,
  isAdmin = false,
}: {
  cookieStore: ReturnType<typeof cookies>;
  isAdmin?: boolean;
}) {
  return createServerClient(
    SUPABASE_URL,
    isAdmin
      ? process.env.DATABASE_SERVICE_ROLE ?? SUPABASE_ANON_KEY
      : SUPABASE_ANON_KEY,
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
