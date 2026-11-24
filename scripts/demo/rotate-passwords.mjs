import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { createClient } from "@supabase/supabase-js";

const accounts = ["A", "B"];
const states = { A: "untouched", B: "untouched" };
let stage = "arguments";
let account;
let reason;

function readConfig(fixture) {
  const app = fixture ? {} : parseEnv(readFileSync(".env.local", "utf8"));
  const current = fixture ? process.env : parseEnv(readFileSync(".env.testing.local", "utf8"));
  const next = fixture ? process.env : parseEnv(readFileSync(".env.rotation.local", "utf8"));
  const url = new URL(fixture ? current.CRM_TEST_SUPABASE_URL : app.NEXT_PUBLIC_SUPABASE_URL);
  const key = fixture
    ? "sb_publishable_fixture"
    : app.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const validEndpoint = fixture
    ? url.protocol === "http:" && url.hostname === "127.0.0.1" && url.port !== ""
    : url.protocol === "https:" && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url.origin);
  if (!validEndpoint || url.href !== url.origin + "/" || !key?.startsWith("sb_publishable_")) {
    throw new Error();
  }
  const users = accounts.map((label) => {
    const email = current[`CRM_TEST_USER_${label}_EMAIL`]?.trim();
    const password = current[`CRM_TEST_USER_${label}_PASSWORD`];
    const newPassword = next[`CRM_TEST_USER_${label}_NEW_PASSWORD`];
    if (!email || !/^[^\s@]+@[^\s@]+$/.test(email) || !password || !strong(newPassword)) {
      throw new Error();
    }
    return { label, email, password, newPassword };
  });
  const [a, b] = users;
  if (a.email.toLowerCase() === b.email.toLowerCase() || a.newPassword === b.newPassword ||
      users.some((user) => users.some((other) => user.newPassword === other.password))) {
    throw new Error();
  }
  return { url, key, users };
}

function strong(value) {
  return typeof value === "string" && value.length >= 20 && Buffer.byteLength(value) <= 72 &&
    /^[!-~]+$/.test(value) && /[A-Z]/.test(value) && /[a-z]/.test(value) &&
    /[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value) && new Set(value).size >= 12;
}

function newClient({ url, key }) {
  return createClient(url.origin, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: async (input, init) => {
        if (new URL(input).origin !== url.origin) throw new Error();
        return fetch(input, {
          ...init,
          redirect: "error",
          signal: AbortSignal.timeout(15_000),
        });
      },
    },
  }).auth;
}

function signIn(auth, user, password) {
  return auth.signInWithPassword({ email: user.email, password });
}

function confirmedId({ data, error }) {
  const id = data?.user?.id;
  if (error || typeof id !== "string" || !id || !data.session?.access_token ||
      data.session.user?.id !== id) {
    throw new Error();
  }
  return id;
}

async function rotate(config) {
  const ids = new Map();
  stage = "preflight";
  for (const user of config.users) {
    account = user.label;
    ids.set(account, confirmedId(await signIn(newClient(config), user, user.password)));
  }
  account = undefined;
  if (ids.get("A") === ids.get("B")) throw new Error();

  for (const user of config.users) {
    account = user.label;
    const expectedId = ids.get(account);
    stage = "fresh-login";
    const auth = newClient(config);
    if (confirmedId(await signIn(auth, user, user.password)) !== expectedId) throw new Error();

    stage = "update";
    states[account] = "uncertain";
    const { data, error } = await auth.updateUser({
      password: user.newPassword,
      current_password: user.password,
    });
    if (["reauthentication_needed", "reauthentication_not_valid"].includes(error?.code)) {
      reason = "reauthentication-required";
    }
    if (error || data?.user?.id !== expectedId) throw new Error();

    stage = "verify-new";
    if (confirmedId(await signIn(newClient(config), user, user.newPassword)) !== expectedId) {
      throw new Error();
    }
    states[account] = "new-confirmed";
    stage = "verify-old";
    const old = await signIn(newClient(config), user, user.password);
    if (old.error?.status !== 400 || old.error?.code !== "invalid_credentials" ||
        old.data?.session || old.data?.user) {
      reason = "old-password-rejection-unconfirmed";
      throw new Error();
    }
    states[account] = "verified";
  }
}

async function main(args) {
  if (args.length === 0) {
    console.log(JSON.stringify({ status: "preview", states }));
    return;
  }
  const check = args.length === 1 && args[0] === "--check";
  const apply = args.includes("--apply") &&
    (args.length === 1 || (args.length === 2 && args.includes("--fixture")));
  if (!check && !apply) throw new Error();

  stage = "configuration";
  const config = readConfig(apply && args.includes("--fixture"));
  if (apply) await rotate(config);
  console.log(JSON.stringify({ status: apply ? "verified" : "checked", states }));
}

// The SDK can log internal errors. Only the CLI emits operational results.
console.debug = console.info = console.warn = console.error = () => {};

try {
  await main(process.argv.slice(2));
} catch {
  const status = states.A === "verified" ? "partial"
    : states.A === "untouched" ? "stopped" : "uncertain";
  const action = status === "partial" || status === "uncertain" ||
    Object.values(states).includes("new-confirmed")
    ? "Verify the password state of each account before retrying."
    : undefined;
  console.log(JSON.stringify({ status, stage, account, reason, states, action }));
  process.exitCode = 1;
}
