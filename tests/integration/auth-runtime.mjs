import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { generateKeyPairSync, randomUUID, sign } from "node:crypto";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);
for (const file of [".env", ".env.local", ".env.production", ".env.production.local"]) {
  if (existsSync(file)) throw new Error("Run the Auth fixture from an isolated production build without environment files.");
}

const bindAddress = "127.0.0.1";
const appOrigin = `http://${bindAddress}:3168`;
const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
const kid = randomUUID();
const jwk = { ...publicKey.export({ format: "jwk" }), kid, alg: "ES256", use: "sig" };
const accounts = [
  { id: randomUUID(), email: "cuenta-a@example.invalid", name: "Cuenta A" },
  { id: randomUUID(), email: "cuenta-b@example.invalid", name: "Cuenta B" },
];
const password = "entrada-sintetica";
const logoutCalls = [];
const validRefreshTokens = new Map();

function tokenFor(account, issuer, { expired = false, tampered = false } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const metadata = { display_name: account.name };
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const claims = {
    sub: account.id, email: account.email, iat: now - 120, exp: now + (expired ? -60 : 3600), iss: issuer,
    aud: "authenticated", role: "authenticated", user_metadata: metadata, is_anonymous: false,
  };
  const data = `${encode({ alg: "ES256", typ: "JWT", kid })}.${encode(claims)}`;
  const signature = sign("sha256", Buffer.from(data), { key: privateKey, dsaEncoding: "ieee-p1363" });
  if (tampered) signature[0] ^= 1;
  const refreshToken = randomUUID();
  validRefreshTokens.set(refreshToken, account);
  return {
    access_token: `${data}.${signature.toString("base64url")}`,
    expires_at: claims.exp,
    expires_in: 3600,
    refresh_token: refreshToken,
    token_type: "bearer",
    user: { id: account.id, email: account.email, user_metadata: metadata, aud: claims.aud, role: claims.role },
  };
}

const fixture = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const send = (status, body) => {
    response.writeHead(status, { "content-type": "application/json" });
    response.end(JSON.stringify(body));
  };
  if (request.method === "POST" && url.pathname === "/auth/v1/token") {
    const chunks = [];
    for await (const data of request) chunks.push(data);
    const body = JSON.parse(Buffer.concat(chunks).toString());
    const grant = url.searchParams.get("grant_type");
    const issuer = `${url.origin}/auth/v1`;
    if (grant === "refresh_token") {
      const account = validRefreshTokens.get(body.refresh_token);
      if (!account) return send(400, { message: "Refresh token not found", error_code: "refresh_token_not_found" });
      validRefreshTokens.delete(body.refresh_token);
      return send(200, tokenFor(account, issuer));
    }
    const account = accounts.find(({ email }) => email === body.email);
    if (grant === "password" && account && body.password === password) return send(200, tokenFor(account, issuer));
    return send(400, { message: "Invalid login credentials", error_code: "invalid_credentials" });
  }
  if (url.pathname === "/auth/v1/.well-known/jwks.json") return send(200, { keys: [jwk] });
  if (url.pathname === "/auth/v1/logout" && url.searchParams.get("scope") === "local") {
    logoutCalls.push(request.method);
    response.writeHead(204).end();
    return;
  }
  if (request.method === "GET" && url.pathname.startsWith("/rest/v1/")) return send(200, []);
  return send(404, { message: "Unknown fixture route" });
});

async function waitForApp(child) {
  for (let attempt = 0; attempt < 80; attempt++) {
    if (child.exitCode !== null) throw new Error(`Next exited with code ${child.exitCode}`);
    try {
      if ((await fetch(appOrigin)).ok) return;
    } catch {
      // The loopback port may still be opening.
    }
    await delay(250);
  }
  throw new Error("Next did not start on the fixture port");
}

async function enterCredentials(page, email, secret) {
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(secret);
  await page.getByRole("button", { name: "Acceder", exact: true }).click();
}

async function expectAccount(page, account, other) {
  await page.getByText(account.email, { exact: true }).waitFor();
  assert.equal(await page.getByText(other.email, { exact: true }).count(), 0);
}

async function expectRefresh(browser, issuer) {
  const context = await browser.newContext({ baseURL: appOrigin });
  const cookieName = `sb-${bindAddress.split(".")[0]}-auth-token`;
  async function setSession(options, revoke = false) {
    const session = tokenFor(accounts[0], issuer, options);
    if (revoke) validRefreshTokens.delete(session.refresh_token);
    const value = `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
    await context.addCookies([{ name: cookieName, value, url: appOrigin }]);
    return value;
  }

  try {
    const previous = await setSession({ expired: true });
    const page = await context.newPage();
    const refreshed = await page.goto("/dashboard");
    assert.equal(new URL(page.url()).pathname, "/dashboard");
    await expectAccount(page, accounts[0], accounts[1]);
    assert.match(refreshed.headers()["cache-control"], /private.*no-store/);
    const renewed = (await context.cookies()).find(({ name }) => name === cookieName);
    assert.ok(renewed && renewed.value !== previous);

    await setSession({ expired: true }, true);
    const rejected = await context.request.get("/dashboard", { maxRedirects: 0 });
    assert.equal(rejected.status(), 307);
    assert.match(rejected.headers()["set-cookie"], /Max-Age=0/i);
    assert.match(rejected.headers()["cache-control"], /private.*no-store/);
    assert.equal(new URL(rejected.headers().location, appOrigin).pathname, "/login");
    assert.equal((await context.cookies()).some(({ name }) => name === cookieName), false);

    await setSession({ tampered: true });
    const tampered = await context.request.get("/dashboard", { maxRedirects: 0 });
    assert.equal(tampered.status(), 307);
    assert.equal(new URL(tampered.headers().location, appOrigin).pathname, "/login");
  } finally {
    await context.close();
  }
}

await new Promise((resolve) => fixture.listen(0, bindAddress, resolve));
const supabaseOrigin = `http://${bindAddress}:${fixture.address().port}`;
process.env.NEXT_PUBLIC_SUPABASE_URL = supabaseOrigin;
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fixture";
const next = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", bindAddress, "--port", "3168"], {
  stdio: "inherit",
  windowsHide: true,
});

let browser;
try {
  await waitForApp(next);
  browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL === "msedge" ? { channel: "msedge" } : {});
  const contextA = await browser.newContext({ baseURL: appOrigin });
  const contextB = await browser.newContext({ baseURL: appOrigin });
  contextA.setDefaultTimeout(10_000);
  contextB.setDefaultTimeout(10_000);
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  await pageA.goto("/clientes?buscar=Acme");
  assert.equal(new URL(pageA.url()).searchParams.get("next"), "/clientes?buscar=Acme");
  await enterCredentials(pageA, accounts[0].email, "incorrecta");
  await pageA.getByRole("alert").getByText("El correo electrónico o la contraseña no son correctos.").waitFor();
  await enterCredentials(pageA, accounts[0].email, password);
  await pageA.waitForURL("**/clientes?buscar=Acme");

  await pageB.goto("/login?next=%2F%2Fexternal.invalid");
  await enterCredentials(pageB, accounts[1].email, password);
  await pageB.waitForURL("**/dashboard");
  for (const [page, own, other] of [[pageA, accounts[0], accounts[1]], [pageB, accounts[1], accounts[0]], [pageA, accounts[0], accounts[1]]]) {
    const response = await page.goto("/dashboard");
    assert.equal(response.status(), 200);
    const headers = response.headers();
    assert.match(headers["cache-control"], /private.*no-store/);
    assert.equal(headers.expires, "0");
    assert.equal(headers.pragma, "no-cache");
    await expectAccount(page, own, other);
  }

  const secondTabA = await contextA.newPage();
  await secondTabA.goto("/dashboard");
  await expectAccount(secondTabA, accounts[0], accounts[1]);
  await pageA.reload();
  await expectAccount(pageA, accounts[0], accounts[1]);
  await pageA.getByRole("button", { name: "Cerrar sesión" }).click();
  await pageA.waitForURL("**/login");
  assert.deepEqual(logoutCalls, ["POST"]);
  await secondTabA.reload();
  await secondTabA.waitForURL("**/login?next=*");
  await pageB.reload();
  await expectAccount(pageB, accounts[1], accounts[0]);
  await expectRefresh(browser, `${supabaseOrigin}/auth/v1`);

  console.log("Auth HTTP fixture: login, A/B/A isolation, reload, second tab, logout, refresh and tampered JWT verified.");
} finally {
  await browser?.close();
  next.kill();
  fixture.closeAllConnections();
  fixture.close();
}
