import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getSupabaseConfigOrNull } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { VerifiedSession } from "./contracts";
import { verifySupabaseSession } from "./identity";

type CookieAccess = Parameters<typeof createSupabaseServerClient>[0];

export async function getVerifiedSupabaseContext(cookieAccess: CookieAccess = "read") {
  await connection();
  if (!getSupabaseConfigOrNull()) return null;

  const db = await createSupabaseServerClient(cookieAccess);
  const session = await verifySupabaseSession(db);
  return session ? { user: session.user, db } : null;
}

export async function requireSupabaseContext(cookieAccess: CookieAccess = "read") {
  const context = await getVerifiedSupabaseContext(cookieAccess);
  if (!context) redirect("/login");
  return context;
}

export async function getVerifiedSession(): Promise<VerifiedSession | null> {
  const context = await getVerifiedSupabaseContext();
  return context ? { user: context.user } : null;
}

export async function requireSession(): Promise<VerifiedSession> {
  const { user } = await requireSupabaseContext();
  return { user };
}
