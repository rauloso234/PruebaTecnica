import { createClient } from "@supabase/supabase-js";

export function requireOptIn(name) {
  if (process.env[name] !== "1") throw new Error(`Set ${name}=1 to opt in.`);
}

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}.`);
  return value;
}

export function createPublicClient() {
  const url = env("CRM_TEST_SUPABASE_URL");
  const key = env("CRM_TEST_SUPABASE_PUBLISHABLE_KEY");
  if (!key.startsWith("sb_publishable_")) throw new Error("Use a Supabase publishable key.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function signIn(account) {
  const db = createPublicClient();
  const { data, error } = await db.auth.signInWithPassword({
    email: env(`CRM_TEST_USER_${account}_EMAIL`),
    password: env(`CRM_TEST_USER_${account}_PASSWORD`),
  });
  if (error || !data.user) throw new Error(`Could not sign in to test account ${account}.`);
  return { db, userId: data.user.id };
}
