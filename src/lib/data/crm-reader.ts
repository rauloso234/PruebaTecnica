import "server-only";
import type { VerifiedSession } from "@/lib/auth/contracts";
import { requireSession } from "@/lib/auth/session";
import type { ClientCollection, ClientRecord, DashboardSnapshot, OpportunityCollection, Resource } from "./contracts";

type CrmReader = {
  dashboard: (session: VerifiedSession) => Promise<Resource<DashboardSnapshot>>;
  clients: (session: VerifiedSession) => Promise<Resource<ClientCollection>>;
  client: (session: VerifiedSession, id: string) => Promise<Resource<ClientRecord>>;
  opportunities: (session: VerifiedSession) => Promise<Resource<OpportunityCollection>>;
};

const reader: CrmReader = {
  dashboard: async () => ({ state: "unavailable" }),
  clients: async () => ({ state: "unavailable" }),
  client: async () => ({ state: "unavailable" }),
  opportunities: async () => ({ state: "unavailable" }),
};

async function load<T>(read: (session: VerifiedSession) => Promise<Resource<T>>) {
  const session = await requireSession();
  const resource = await read(session).catch((): Resource<T> => ({
    state: "error", message: "No pudimos cargar esta información. Inténtalo de nuevo más tarde.",
  }));
  return { user: session.user, resource };
}

export const readDashboard = () => load(reader.dashboard);
export const readClients = () => load(reader.clients);
export const readClient = (id: string) => load((session) => reader.client(session, id));
export const readOpportunities = () => load(reader.opportunities);
