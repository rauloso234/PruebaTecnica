import { opportunityStatusLabel, opportunityStatuses, type Client, type ClientOption, type Opportunity, type OpportunityStatus } from "./models";

function comparable(value: string) {
  return value.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es-ES");
}

export function filterClients(clients: readonly Client[], search: string): Client[] {
  const query = comparable(search);
  return clients.filter(({ name, company }) => [name, company ?? ""].some((value) => comparable(value).includes(query)));
}

export function filterOpportunities(
  opportunities: readonly Opportunity[],
  clients: readonly ClientOption[],
  search: string,
  status: OpportunityStatus | "all",
): Opportunity[] {
  const query = comparable(search);
  const byId = new Map(clients.map((client) => [client.id, client]));
  return opportunities.filter((opportunity) => {
    if (status !== "all" && opportunity.status !== status) return false;
    const client = byId.get(opportunity.client_id);
    return [opportunity.title, client?.name ?? "", client?.company ?? ""].some((value) => comparable(value).includes(query));
  });
}

export function hasLinkedOpportunities(clientId: string, opportunities: readonly Pick<Opportunity, "client_id">[]): boolean {
  return opportunities.some(({ client_id }) => client_id === clientId);
}

export function groupPipeline(opportunities: readonly Opportunity[]) {
  const groups = new Map<OpportunityStatus, Opportunity[]>(opportunityStatuses.map((status) => [status, []]));
  for (const opportunity of opportunities) groups.get(opportunity.status)?.push(opportunity);
  return opportunityStatuses.map((status) => {
    const items = groups.get(status) ?? [];
    return { status, label: opportunityStatusLabel[status], items, totalCents: items.reduce((sum, item) => sum + BigInt(item.amountCents), 0n) };
  });
}

export function calculateDashboard(clientCount: number, opportunities: readonly Opportunity[]) {
  let openCount = 0;
  let pipelineCents = 0n;
  let wonCount = 0;
  let wonCents = 0n;
  let lostCount = 0;
  for (const opportunity of opportunities) {
    if (opportunity.status === "won") {
      wonCount++;
      wonCents += BigInt(opportunity.amountCents);
    } else if (opportunity.status === "lost") {
      lostCount++;
    } else {
      openCount++;
      pipelineCents += BigInt(opportunity.amountCents);
    }
  }
  const closedCount = wonCount + lostCount;
  return {
    clientCount, openCount, pipelineCents, wonCents,
    conversion: closedCount ? wonCount / closedCount * 100 : 0,
    distribution: groupPipeline(opportunities).map(({ status, label, items }) => ({ status, label, count: items.length })),
  };
}

export function recentOpportunities(opportunities: readonly Opportunity[], limit = 5): Opportunity[] {
  return [...opportunities].sort(byNewest).slice(0, limit);
}

export function byNewest(a: Pick<Opportunity, "id" | "created_at">, b: typeof a) {
  return Date.parse(b.created_at) - Date.parse(a.created_at)
    || b.created_at.localeCompare(a.created_at)
    || b.id.localeCompare(a.id);
}
