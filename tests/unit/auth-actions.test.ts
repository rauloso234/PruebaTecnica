import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signIn, signOut } from "@/features/auth/actions";
import { authUnavailableMessage } from "@/lib/auth/contracts";
import { requireSupabaseContext } from "@/lib/auth/session";

const { createClient, getClaims, signInWithPassword, signOutLocal, redirect } = vi.hoisted(() => ({
  createClient: vi.fn(), getClaims: vi.fn(), signInWithPassword: vi.fn(), signOutLocal: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`redirect:${path}`); }),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: createClient }));

const db = { auth: { getClaims, signInWithPassword, signOut: signOutLocal } };
const credentials = { email: "f3b@example.invalid", password: "  contraseña-sintética  " };
const accountId = "00000000-0000-4000-8000-000000000001";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://f3b.example.invalid");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fixture");
  createClient.mockResolvedValue(db);
  getClaims.mockResolvedValue({
    data: { claims: { sub: accountId, email: credentials.email, role: "authenticated", user_metadata: { name: "  Cuenta A  " } } },
    error: null,
  });
});

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe("Acciones de autenticación", () => {
  it("valida un envío directo antes de crear un cliente Supabase", async () => {
    expect(await signIn("/dashboard", { email: "incorrecto", password: "" })).toEqual({
      error: "Introduce un correo electrónico válido.",
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("normaliza el correo, preserva la contraseña y devuelve el destino privado", async () => {
    signInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });
    expect(await signIn("/clientes?buscar=Acme", { ...credentials, email: `  ${credentials.email}  ` }))
      .toEqual({ redirectTo: "/clientes?buscar=Acme" });
    expect(createClient).toHaveBeenCalledWith("write");
    expect(signInWithPassword).toHaveBeenCalledWith(credentials);
  });

  it.each(["invalid_credentials", "email_not_confirmed"])("protege el detalle del error %s", async (code) => {
    signInWithPassword.mockResolvedValue({ data: { session: null }, error: { code, message: "Detalle interno" } });
    expect(await signIn("/dashboard", credentials)).toEqual({
      error: "El correo electrónico o la contraseña no son correctos.",
    });
  });

  it("preserva el aviso público y protege el contexto privado sin configuración", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
    expect(await signIn(null, credentials)).toEqual({ error: authUnavailableMessage });
    await expect(requireSupabaseContext()).rejects.toThrow("redirect:/login");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("entrega el cliente que verificó la identidad al consumidor", async () => {
    const context = await requireSupabaseContext("write");
    expect(context.db).toBe(db);
    expect(context.user).toEqual({ id: accountId, email: credentials.email, displayName: "Cuenta A" });
    expect(getClaims).toHaveBeenCalledOnce();
  });

  it("cierra la sesión de este navegador usando el cliente de escritura", async () => {
    expect(await signOut()).toEqual({ ok: true });
    expect(createClient).toHaveBeenCalledExactlyOnceWith("write");
    expect(signOutLocal).toHaveBeenCalledExactlyOnceWith({ scope: "local" });
  });
});
