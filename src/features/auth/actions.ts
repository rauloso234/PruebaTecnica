"use server";

import { authUnavailableMessage, type SignInResult } from "@/lib/auth/contracts";
import { getPrivateDestination } from "@/lib/auth/redirects";
import { getVerifiedSupabaseContext } from "@/lib/auth/session";
import type { Mutation } from "@/lib/data/contracts";
import { getSupabaseConfigOrNull } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "./login-schema";

const signInFailed = "No hemos podido completar el acceso. Inténtalo de nuevo.";
const invalidCredentials = "El correo electrónico o la contraseña no son correctos.";

export async function signIn(destination: unknown, credentials: unknown): Promise<SignInResult> {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!getSupabaseConfigOrNull()) return { error: authUnavailableMessage };

  try {
    const db = await createSupabaseServerClient("write");
    const { data, error } = await db.auth.signInWithPassword(parsed.data);
    if (error?.code === "invalid_credentials" || error?.code === "email_not_confirmed") {
      return { error: invalidCredentials };
    }
    if (error || !data.session) return { error: signInFailed };
  } catch {
    return { error: signInFailed };
  }

  return { redirectTo: getPrivateDestination(destination) };
}

export async function signOut(): Promise<Mutation> {
  try {
    if (!getSupabaseConfigOrNull()) return { ok: true };
    const context = await getVerifiedSupabaseContext("write");
    // Clear this browser's cookies even when its access token can no longer be verified.
    const db = context?.db ?? await createSupabaseServerClient("write");
    await db.auth.signOut({ scope: "local" });
    return { ok: true };
  } catch {
    return { ok: false, message: "No se pudo cerrar la sesión. Inténtalo de nuevo." };
  }
}
