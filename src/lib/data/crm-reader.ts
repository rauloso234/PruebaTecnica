import "server-only";

import { requireSupabaseContext } from "@/lib/auth/session";
import type { CrmContext } from "./crm-context";
import { loadClient, loadClients, loadOpportunities } from "./crm-queries";
import type { DashboardSnapshot, OpportunityCollection, Resource } from "./contracts";

async function load<T>(read: (context: CrmContext) => Promise<Resource<T>>) {
  const context = await requireSupabaseContext("read");
  const resource = await read(context).catch((): Resource<T> => ({
    state: "error", message: "No pudimos cargar esta información. Inténtalo de nuevo más tarde.",
  }));
  return { user: context.user, resource };
}

export const readClients = () => load(async (context) => ({ state: "ready", data: await loadClients(context) }));
export const readClient = (id: string) => load(async (context) => ({ state: "ready", data: await loadClient(context, id) }));
export const readDashboard = () => load<DashboardSnapshot>(async (context) => {
  const data = await loadOpportunities(context);
  return { state: "ready", data: { ...data, clientCount: data.clients.length } };
});
export const readOpportunities = () => load<OpportunityCollection>(async (context) => ({ state: "ready", data: await loadOpportunities(context) }));
