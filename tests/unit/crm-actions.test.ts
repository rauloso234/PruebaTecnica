import { beforeEach, describe, expect, it, vi } from "vitest";
import { changeStatus, createOpportunity, deleteOpportunity, updateOpportunity } from "@/features/opportunities/actions";
import { createClient, deleteClient, updateClient } from "@/features/clients/actions";

const { from, revalidatePath } = vi.hoisted(() => ({ from: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/auth/session", () => ({
  requireSupabaseContext: async () => ({ db: { from }, user: { id: "owner" } }),
}));

const id = "b6c926c1-5bf9-40d3-bda4-d3f93086b72a";
const draft = { name: "  Nombre   Comercial ", company: null, email: null, phone: null, notes: null };

function write(result: { data: { id: string } | null; error: { code: string } | null }) {
  const query = {
    insert: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue(result),
  };
  from.mockReturnValue(query);
  return query;
}

beforeEach(() => vi.clearAllMocks());

describe("F3-C server actions", () => {
  it("validates and writes only editable normalized fields", async () => {
    const query = write({ data: { id }, error: null });
    expect(await createClient({ ...draft, name: "  " })).toMatchObject({ ok: false });
    expect(from).not.toHaveBeenCalled();
    expect(await createClient({ ...draft, user_id: "other", created_at: "fake" })).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("clients");
    expect(query.insert).toHaveBeenCalledWith({ ...draft, name: "Nombre Comercial" });
    expect(revalidatePath).toHaveBeenCalledWith("/clientes/[id]", "page");
  });

  it("treats an invisible row as unavailable and never invalidates on failure", async () => {
    const query = write({ data: null, error: null });
    const missing = await updateClient(id, draft);
    expect(missing).toMatchObject({ ok: false });
    expect(await updateClient("invalid id", draft)).toEqual(missing);
    expect(await deleteClient(id)).toEqual(missing);
    expect(query.eq.mock.calls).toEqual([["user_id", "owner"], ["id", id], ["user_id", "owner"], ["id", id]]);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("reports linked opportunity restriction from the database", async () => {
    write({ data: null, error: { code: "23503" } });
    expect(await deleteClient(id)).toEqual({ ok: false, message: "No puedes eliminar un cliente con oportunidades asociadas." });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("F3-D server actions", () => {
  const opportunity = {
    title: "  Propuesta   nueva ", client_id: id, description: null,
    amountCents: 1, status: "new", expected_close_date: "2028-02-29",
  };

  it("validates integer cents, real dates, and serializes exact decimal with editable fields only", async () => {
    const query = write({ data: { id }, error: null });
    for (const invalid of [{ amountCents: 1.1 }, { amountCents: 100_000_000_000 }, { expected_close_date: "2027-02-29" }]) {
      expect(await createOpportunity({ ...opportunity, ...invalid })).toMatchObject({ ok: false });
    }
    expect(from).not.toHaveBeenCalled();
    expect(await createOpportunity({ ...opportunity, user_id: "other", updated_at: "fake" })).toEqual({ ok: true });
    expect(query.insert).toHaveBeenCalledWith({
      title: "Propuesta nueva", client_id: id, description: null,
      amount: "0.01", status: "new", expected_close_date: "2028-02-29",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("reports foreign or missing client as unavailable", async () => {
    write({ data: null, error: { code: "23503" } });
    expect(await updateOpportunity(id, opportunity)).toEqual({ ok: false, message: "Selecciona un cliente disponible." });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("changes only the stage and reports zero rows as failure", async () => {
    const query = write({ data: null, error: null });
    expect(await changeStatus(id, "invalid")).toMatchObject({ ok: false });
    expect(from).not.toHaveBeenCalled();
    const result = await changeStatus(id, "won");
    expect(result).toMatchObject({ ok: false });
    expect(await deleteOpportunity(id)).toEqual(result);
    expect(query.update).toHaveBeenCalledWith({ status: "won" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
