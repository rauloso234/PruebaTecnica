import { afterEach, describe, expect, it, vi } from "vitest";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

vi.mock("server-only", () => ({}));
vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const url = "https://crm.example.test/";
const key = "sb_publishable_test";
const getAll = vi.fn();
const set = vi.fn();

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

describe("Supabase configuration", () => {
  it.each([
    [undefined, key],
    [url, undefined],
    [url, "sb_secret_test"],
    [url, "sb_publishable_example"],
    ["http://crm.example.test", key],
    ["https://user:password@crm.example.test", key],
  ])("rejects unusable configuration (%#)", (endpoint, publishableKey) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", endpoint);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", publishableKey);
    expect(getSupabaseConfig).toThrow("Configuración pública de Supabase");
  });

  it.each([url, "http://127.0.0.1:54321/"])("accepts %s", (endpoint) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", endpoint);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key);
    expect(getSupabaseConfig()).toEqual({ url: endpoint, key });
  });
});

it("binds server clients to their request cookies and disables fetch caching", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key);
  const firstCookies = [{ name: "session", value: "first" }];
  const secondCookies = [{ name: "session", value: "second" }];
  const secondGetAll = vi.fn().mockReturnValue(secondCookies);
  getAll.mockReturnValue(firstCookies);
  vi.mocked(cookies)
    .mockResolvedValueOnce({ getAll, set } as unknown as Awaited<ReturnType<typeof cookies>>)
    .mockResolvedValueOnce({ getAll: secondGetAll, set } as unknown as Awaited<ReturnType<typeof cookies>>);

  await createSupabaseServerClient("write");
  await createSupabaseServerClient();
  const [first, second] = vi.mocked(createServerClient).mock.calls;
  expect(first.slice(0, 2)).toEqual([url, key]);
  expect(first[2].cookies.getAll()).toEqual(firstCookies);
  expect(second[2].cookies.getAll()).toEqual(secondCookies);

  const changes = [{ name: "session", value: "", options: { maxAge: 0 } }];
  second[2].cookies.setAll?.(changes, {});
  expect(set).not.toHaveBeenCalled();
  first[2].cookies.setAll?.(changes, {});
  expect(set).toHaveBeenCalledWith("session", "", { maxAge: 0 });

  const fetchMock = vi.fn().mockResolvedValue(new Response());
  vi.stubGlobal("fetch", fetchMock);
  try {
    await first[2].global?.fetch?.(url, { cache: "force-cache" });
    expect(fetchMock).toHaveBeenCalledWith(url, { cache: "no-store" });
  } finally {
    vi.unstubAllGlobals();
  }
});
