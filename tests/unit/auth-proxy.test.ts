import { generateKeyPairSync, sign } from "node:crypto";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPrivateDestination } from "@/lib/auth/redirects";
import { proxy } from "@/proxy";

const origin = "https://clientflow.example.invalid";
const supabaseOrigin = "https://auth-f3b.example.invalid";
const cookieName = "sb-auth-f3b-auth-token";
const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
const kid = "f3b-synthetic-key";
const jwk = { ...publicKey.export({ format: "jwk" }), kid, alg: "ES256", use: "sig" };
const accountId = "00000000-0000-4000-8000-000000000001";

function session(expiresAt: number, refreshToken: string, tamper = false) {
  const email = "f3b@example.invalid";
  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid, typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    sub: accountId, email, exp: expiresAt, iat: expiresAt - 3600, role: "authenticated",
    aud: "authenticated", iss: `${supabaseOrigin}/auth/v1`, is_anonymous: false,
  })).toString("base64url");
  const signature = sign("sha256", Buffer.from(`${header}.${payload}`), { key: privateKey, dsaEncoding: "ieee-p1363" });
  if (tamper) signature[0] ^= 1;

  return {
    access_token: `${header}.${payload}.${signature.toString("base64url")}`,
    expires_at: expiresAt,
    expires_in: 3600,
    refresh_token: refreshToken,
    token_type: "bearer",
    user: { id: accountId, email, role: "authenticated", aud: "authenticated" },
  };
}

function requestWithSession(path: string, current: ReturnType<typeof session>) {
  const value = Buffer.from(JSON.stringify(current)).toString("base64url");
  return new NextRequest(`${origin}${path}`, { headers: { cookie: `${cookieName}=base64-${value}` } });
}

const now = () => Math.floor(Date.now() / 1000);
const fetchFixture = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(String(input));
  if (url.origin !== supabaseOrigin) throw new Error("Unexpected fixture endpoint");
  if (url.pathname === "/auth/v1/.well-known/jwks.json") return Response.json({ keys: [jwk] });
  if (url.pathname === "/auth/v1/token" && url.searchParams.get("grant_type") === "refresh_token") {
    const body = JSON.parse(String(init?.body));
    if (body.refresh_token === "refresh-before") {
      return Response.json(session(now() + 3600, "refresh-after"));
    }
    return Response.json({ message: "Refresh token not found", error_code: "refresh_token_not_found" }, { status: 400 });
  }
  throw new Error(`Unexpected fixture path: ${url.pathname}`);
});

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseOrigin);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fixture");
  vi.stubGlobal("fetch", fetchFixture);
});

afterEach(() => {
  fetchFixture.mockClear();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function expectPrivateHeaders(headers: Headers) {
  expect(headers.get("cache-control")).toContain("private");
  expect(headers.get("cache-control")).toContain("no-store");
  expect(headers.get("expires")).toBe("0");
  expect(headers.get("pragma")).toBe("no-cache");
}

describe("Proxy de autenticación con Supabase SSR y fixtures sintéticos", () => {
  it("envía al servidor y al navegador la sesión renovada durante la misma solicitud", async () => {
    const request = requestWithSession("/dashboard", session(now() - 90, "refresh-before"));
    const previous = request.cookies.get(cookieName)?.value;
    const response = await proxy(request);

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expectPrivateHeaders(response.headers);
    const browserCookie = response.cookies.get(cookieName);
    expect(browserCookie?.value).not.toBe(previous);
    expect(browserCookie?.value).toBe(request.cookies.get(cookieName)?.value);
    expect(response.headers.get("x-middleware-request-cookie")).toContain(`${cookieName}=${browserCookie?.value}`);
    const renewed = JSON.parse(Buffer.from(browserCookie!.value.slice("base64-".length), "base64url").toString());
    expect(renewed.refresh_token).toBe("refresh-after");
  });

  it("mantiene la cookie renovada y las cabeceras en la redirección desde login", async () => {
    const response = await proxy(requestWithSession("/login?next=%2Fpipeline", session(now() - 90, "refresh-before")));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`${origin}/pipeline`);
    expect(response.cookies.has(cookieName)).toBe(true);
    expectPrivateHeaders(response.headers);
  });

  it("elimina una sesión vencida sin refresh válido y conserva el destino privado", async () => {
    const response = await proxy(requestWithSession("/clientes?buscar=A", session(now() - 90, "refresh-invalid")));
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/clientes?buscar=A");
    expect(response.cookies.get(cookieName)?.maxAge).toBe(0);
    expectPrivateHeaders(response.headers);
  });

  it("rechaza una firma alterada y permite visitar login sin bucle", async () => {
    const tampered = session(now() + 3600, "refresh-before", true);
    const privateResponse = await proxy(requestWithSession("/dashboard", tampered));
    expect(privateResponse.status).toBe(307);
    expect(new URL(privateResponse.headers.get("location")!).pathname).toBe("/login");
    const loginResponse = await proxy(requestWithSession("/login?next=%2Fdashboard", tampered));
    expect(loginResponse.headers.get("x-middleware-next")).toBe("1");
    expectPrivateHeaders(loginResponse.headers);
  });

  it.each(["https://external.invalid", "//external.invalid", "/\\external.invalid", "/login", "/clientes/%2fsecret"])(
    "limita el destino %s al panel seguro",
    (destination) => { expect(getPrivateDestination(destination)).toBe("/dashboard"); },
  );
});
