import "server-only";

import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";
import { createSupabaseRequestClient } from "./request-client";

export async function createSupabaseServerClient(
  cookieAccess: "read" | "write" = "read",
) {
  const config = getSupabaseConfig();
  const cookieStore = await cookies();

  return createSupabaseRequestClient(config, {
    getAll: () => cookieStore.getAll(),
    setAll(pendingCookies) {
      // Proxy persists refreshes before Server Components render.
      if (cookieAccess === "read") return;

      for (const { name, value, options } of pendingCookies) {
        cookieStore.set(name, value, options);
      }
    },
  });
}
