import type { Client, Opportunity, OpportunityStatus } from "@/lib/domain/models";

const owner_id = "10000000-0000-4000-8000-000000000000";
const timestamps = { created_at: "2026-11-20T14:00:00Z", updated_at: "2026-11-20T14:00:00Z" };

export const clients: readonly Client[] = [
  {
    id: "20000000-0000-4000-8000-000000000001", owner_id, ...timestamps, name: "Ágata de prueba",
    company: "Estudio de prueba", email: "agata@example.invalid", phone: null, notes: "Nota de prueba de la ficha.",
  },
  {
    id: "20000000-0000-4000-8000-000000000002", owner_id, ...timestamps, name: "Contacto sin vínculos",
    company: "Oficina de prueba", email: null, phone: null, notes: null,
  },
];

export const [
  linkedClient,
  unlinkedClient,
] = [clients[0], clients[1]];

function opportunity(number: number, title: string, status: OpportunityStatus, amountCents: number): Opportunity {
  return {
    id: `30000000-0000-4000-8000-${String(number).padStart(12, "0")}`,
    owner_id,
    client_id: linkedClient.id,
    title,
    status,
    amountCents,
    description: null,
    expected_close_date: number === 1 ? "2026-12-21" : null,
    created_at: `2026-11-2${number}T14:00:00Z`,
    updated_at: timestamps.updated_at,
  };
}

export const opportunities: readonly Opportunity[] = [
  opportunity(1, "Primera consulta", "new", 10),
  opportunity(2, "Acuerdo piloto", "qualified", 20),
  opportunity(3, "Propuesta trimestral", "proposal", 1000),
  opportunity(4, "Proyecto ganado", "won", 3000),
  opportunity(5, "Renovación ganada", "won", 4000),
  opportunity(6, "Gestión no adjudicada", "lost", 99900),
];

export const opportunityCollection = { clients, opportunities };
export const dashboardSnapshot = { ...opportunityCollection, clientCount: clients.length };
export const clientCollection = { clients, linkedClientIds: [linkedClient.id] };
