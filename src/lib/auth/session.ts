import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { VerifiedSession } from "./contracts";

export async function getVerifiedSession(): Promise<VerifiedSession | null> {
  await connection();
  return null;
}

export async function requireSession(): Promise<VerifiedSession> {
  const session = await getVerifiedSession();
  if (!session) redirect("/login");
  return session;
}
