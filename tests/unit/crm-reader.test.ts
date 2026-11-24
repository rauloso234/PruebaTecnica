import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { readDashboard } from "@/lib/data/crm-reader";
import { calculateDashboard, recentOpportunities } from "@/lib/domain/crm";

const { requireSupabaseContext } = vi.hoisted(() => ({ requireSupabaseContext: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/session", () => ({ requireSupabaseContext }));

describe("F3-E dashboard reader", () => {
  it("counts all pages under the owner filter and keeps exact cents and the latest five", async () => {
    const opportunities = [
      ["0.10", "new"], ["0.20", "qualified"], ["10", "proposal"],
      ["30", "won"], ["40", "won"], ["999", "lost"],
      ...Array.from({ length: 1_001 }, () => ["0", "new"]),
    ].map(([amount, status], index) => ({
      id: String(index + 1).padStart(4, "0"), client_id: "0001", user_id: "A",
      amount, status, title: "Opportunity", description: null, expected_close_date: null,
      created_at: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(),
      updated_at: "2026-02-01T00:00:00Z",
    }));
    const clients = ["A", "A", "B"].map((user_id, index) => ({
      id: String(index + 1).padStart(4, "0"), user_id, name: "Client", company: null,
    }));
    const db = createClient("http://example.invalid", "public", {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: async (input) => {
        const url = new URL(String(input));
        const rows = url.pathname.endsWith("/opportunities") ? opportunities : clients;
        const owner = url.searchParams.get("user_id")?.slice(3);
        const after = url.searchParams.get("id")?.slice(3) ?? "";
        expect(url.searchParams.get("order")).toBe("id.asc");
        return Response.json(rows.filter((row) => row.user_id === owner && row.id > after).slice(0, 137));
      } },
    });
    requireSupabaseContext.mockResolvedValue({ db, user: { id: "A" } });
    const { resource } = await readDashboard();
    if (resource.state !== "ready") throw new Error("Expected dashboard data");
    const { clientCount, opportunities: items } = resource.data;
    const summary = calculateDashboard(clientCount, items);
    expect(summary).toMatchObject({ clientCount: 2, openCount: 1_004, pipelineCents: 1030n, wonCents: 7000n });
    expect(summary.conversion).toBeCloseTo(66.67, 2);
    expect(summary.distribution.map(({ count }) => count)).toEqual([1002, 1, 1, 2, 1]);
    expect(recentOpportunities(items).map(({ id }) => id)).toEqual(["1007", "1006", "1005", "1004", "1003"]);

    requireSupabaseContext.mockResolvedValue({ db, user: { id: "B" } });
    const other = await readDashboard();
    expect(other.resource).toMatchObject({ state: "ready", data: { clientCount: 1, opportunities: [] } });
  });

  it("reports a database failure without returning partial data", async () => {
    const db = createClient("http://example.invalid", "public", {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: async () => Response.json({ message: "internal detail" }, { status: 400 }) },
    });
    requireSupabaseContext.mockResolvedValue({ db, user: { id: "A" } });
    const { resource } = await readDashboard();
    expect(resource).toEqual({ state: "error", message: "No pudimos cargar esta información. Inténtalo de nuevo más tarde." });
  });
});
