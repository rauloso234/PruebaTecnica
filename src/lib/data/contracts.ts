import type { Client, ClientDraft, ClientOption, Opportunity, OpportunityDraft, OpportunityStatus } from "@/lib/domain/models";

export type Resource<T> =
  | { state: "ready"; data: T }
  | { state: "unavailable" }
  | { state: "loading" }
  | { state: "error"; message: string };

export type Mutation = { ok: true } | { ok: false; message: string };

export type ClientCollection = Readonly<{
  clients: readonly Client[];
  // The adapter must supply all linked client IDs, including opportunities outside the visible page.
  linkedClientIds: readonly string[];
}>;

export type ClientRecord = Readonly<{ client: Client | null; opportunities: readonly Opportunity[] }>;
export type OpportunityCollection = Readonly<{ opportunities: readonly Opportunity[]; clients: readonly ClientOption[] }>;
export type DashboardSnapshot = OpportunityCollection & Readonly<{ clientCount: number }>;

export type ClientActions = {
  createClient: (draft: ClientDraft) => Promise<Mutation>;
  updateClient: (id: string, draft: ClientDraft) => Promise<Mutation>;
  deleteClient: (id: string) => Promise<Mutation>;
};

export type OpportunityActions = {
  createOpportunity: (draft: OpportunityDraft) => Promise<Mutation>;
  updateOpportunity: (id: string, draft: OpportunityDraft) => Promise<Mutation>;
  deleteOpportunity: (id: string) => Promise<Mutation>;
  changeStatus: (id: string, status: OpportunityStatus) => Promise<Mutation>;
};
