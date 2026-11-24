import type { SupabaseClient } from "@supabase/supabase-js";
import type { VerifiedSession } from "./contracts";

export async function verifySupabaseSession(
  { auth }: Pick<SupabaseClient, "auth">,
): Promise<VerifiedSession | null> {
  try {
    const { data, error } = await auth.getClaims();
    const claims = data?.claims;
    if (error || !claims || claims.role !== "authenticated" || claims.is_anonymous ||
        typeof claims.sub !== "string" || !claims.sub ||
        typeof claims.email !== "string" || !claims.email) {
      return null;
    }

    const metadata = claims.user_metadata;
    const displayName = metadata?.display_name ?? metadata?.full_name ?? metadata?.name;
    return {
      user: {
        id: claims.sub,
        email: claims.email,
        displayName: typeof displayName === "string" ? displayName.trim() || undefined : undefined,
      },
    };
  } catch {
    return null;
  }
}
