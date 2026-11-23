export const opportunityStatuses = ["new", "qualified", "proposal", "won", "lost"] as const;
export type OpportunityStatus = (typeof opportunityStatuses)[number];

export const opportunityStatusLabel: Record<OpportunityStatus, string> = {
  new: "Nuevo contacto",
  qualified: "Cualificado",
  proposal: "Propuesta",
  won: "Ganado",
  lost: "Perdido",
};

export type ClientDraft = Readonly<{
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
}>;

export type OpportunityDraft = Readonly<{
  title: string;
  client_id: string;
  description: string | null;
  amountCents: number;
  status: OpportunityStatus;
  expected_close_date: string | null;
}>;

type OwnedRecord = Readonly<{
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}>;

export type Client = ClientDraft & OwnedRecord;
export type Opportunity = OpportunityDraft & OwnedRecord;
export type ClientOption = Pick<Client, "id" | "name" | "company">;
