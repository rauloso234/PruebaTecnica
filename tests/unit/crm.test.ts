import { describe, expect, it } from "vitest";
import { calculateDashboard, filterClients, filterOpportunities, groupPipeline, hasLinkedOpportunities, recentOpportunities } from "@/lib/domain/crm";
import { euroInput, formatDate, formatEuro, formatPercent } from "@/lib/domain/format";
import { opportunityStatuses } from "@/lib/domain/models";
import { clients, linkedClient, opportunities, unlinkedClient } from "../fixtures/crm";

describe("Operaciones del CRM", () => {
  it("calcula cinco métricas y excluye las perdidas de los totales monetarios", () => {
    const summary = calculateDashboard(2, opportunities);
    expect(summary).toMatchObject({ clientCount: 2, openCount: 3, pipelineCents: 1030n, wonCents: 7000n });
    expect(summary.conversion).toBeCloseTo(66.6667);
    expect(summary.distribution.map(({ count }) => count)).toEqual([1, 1, 1, 2, 1]);
    expect(summary.distribution.reduce((sum, { count }) => sum + count, 0)).toBe(opportunities.length);
  });

  it("devuelve 0 % sin cierres, en el panel vacío y cuando todas son perdidas", () => {
    expect(calculateDashboard(0, []).conversion).toBe(0);
    expect(calculateDashboard(1, opportunities.slice(0, 3)).conversion).toBe(0);
    expect(calculateDashboard(1, opportunities.filter(({ status }) => status === "lost")).conversion).toBe(0);
  });

  it("mantiene los céntimos exactos y los formatos de España", () => {
    expect(formatEuro(1030n)).toMatch(/^10,30\s€$/);
    expect(formatEuro(9_007_199_254_740_993n)).toMatch(/^90\.071\.992\.547\.409,93\s€$/);
    expect(formatPercent(66.6667)).toBe("66,67 %");
    expect(formatPercent(0)).toBe("0 %");
    expect(euroInput(10)).toBe("0,10");
    expect(formatDate("2032-02-29")).toMatch(/29 feb 2032/);
  });

  it("busca sin distinguir acentos, filtra por etapa y detecta vínculos", () => {
    expect(filterClients(clients, " agata ")).toEqual([linkedClient]);
    expect(filterClients(clients, "OFICINA")).toEqual([unlinkedClient]);
    expect(filterOpportunities(opportunities, clients, "estudio", "won").map(({ title }) => title)).toEqual(["Proyecto ganado", "Renovación ganada"]);
    expect(filterOpportunities(opportunities, clients, "producto inexistente", "all")).toEqual([]);
    expect(hasLinkedOpportunities(linkedClient.id, opportunities)).toBe(true);
    expect(hasLinkedOpportunities(unlinkedClient.id, opportunities)).toBe(false);
  });

  it("ordena las cinco columnas, agrupa sin duplicados y calcula sus importes", () => {
    const groups = groupPipeline(opportunities);
    expect(groups.map(({ status }) => status)).toEqual(opportunityStatuses);
    expect(groups.map(({ totalCents }) => totalCents)).toEqual([10n, 20n, 1000n, 7000n, 99900n]);
    expect(new Set(groups.flatMap(({ items }) => items.map(({ id }) => id))).size).toBe(opportunities.length);
    expect(recentOpportunities(opportunities, 2).map(({ status }) => status)).toEqual(["lost", "won"]);
  });
});
