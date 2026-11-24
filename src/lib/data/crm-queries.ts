import "server-only";

import { z } from "zod";
import { byNewest } from "@/lib/domain/crm";
import { parseEuroCents } from "@/lib/domain/format";
import type { Client, Opportunity } from "@/lib/domain/models";
import { statusSchema } from "@/lib/domain/validation";
import { readAll, type CrmContext } from "./crm-context";

const clientsFields = "id,user_id,name,company,email,phone,notes,created_at,updated_at";
const opportunitiesFields = "id,user_id,client_id,title,description,amount,status,expected_close_date,created_at,updated_at";
export const recordId = z.uuid();

function mapClient({ user_id, ...row }: Omit<Client, "owner_id"> & { user_id: string }): Client {
  return { ...row, owner_id: user_id };
}

function mapOpportunity({ user_id, amount, status, ...row }: Omit<Opportunity, "owner_id" | "amountCents" | "status"> & {
  user_id: string;
  amount: number | string;
  status: string;
}): Opportunity {
  const amountCents = parseEuroCents(String(amount));
  if (amountCents === null) throw new Error("Invalid stored amount");
  return { ...row, owner_id: user_id, amountCents, status: statusSchema.parse(status) };
}

export async function loadOwnedOpportunities({ db, user }: CrmContext, clientId?: string) {
  const rows = await readAll((after) => {
    const query = db.from("opportunities").select(opportunitiesFields)
      .eq("user_id", user.id).order("id").limit(500);
    if (clientId) query.eq("client_id", clientId);
    return after ? query.gt("id", after) : query;
  });
  return rows.map(mapOpportunity).sort(byNewest);
}

export async function loadClients({ db, user }: CrmContext) {
  const [clients, linked] = await Promise.all([
    readAll((after) => {
      const query = db.from("clients").select(clientsFields).eq("user_id", user.id).order("id").limit(500);
      return after ? query.gt("id", after) : query;
    }),
    readAll((after) => {
      const query = db.from("opportunities").select("id,client_id").eq("user_id", user.id).order("id").limit(500);
      return after ? query.gt("id", after) : query;
    }),
  ]);
  return {
    clients: clients.map(mapClient).sort(byNewest),
    linkedClientIds: [...new Set(linked.map(({ client_id }) => client_id))],
  };
}

export async function loadClient(context: CrmContext, id: string) {
  if (!recordId.safeParse(id).success) return { client: null, opportunities: [] };
  const { db, user } = context;
  const { data, error } = await db.from("clients").select(clientsFields)
    .eq("user_id", user.id).eq("id", id).maybeSingle();
  if (error) throw new Error("CRM read failed");
  if (!data) return { client: null, opportunities: [] };
  return { client: mapClient(data), opportunities: await loadOwnedOpportunities(context, id) };
}

export async function loadClientOptions({ db, user }: CrmContext) {
  const clients = await readAll((after) => {
    const query = db.from("clients").select("id,name,company").eq("user_id", user.id).order("id").limit(500);
    return after ? query.gt("id", after) : query;
  });
  return clients.sort((a, b) => a.name.localeCompare(b.name, "es") || a.id.localeCompare(b.id));
}

export async function loadOpportunities(context: CrmContext) {
  const [opportunities, clients] = await Promise.all([loadOwnedOpportunities(context), loadClientOptions(context)]);
  return { opportunities, clients };
}
