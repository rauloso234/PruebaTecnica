import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import type { getSupabaseConfig } from "./config";

export function createSupabaseRequestClient(
  { url, key }: ReturnType<typeof getSupabaseConfig>,
  cookies: CookieMethodsServer,
) {
  return createServerClient(url, key, {
    cookieOptions: { secure: process.env.NODE_ENV === "production" },
    cookies,
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
