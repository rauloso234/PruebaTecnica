"use server";

import { requireSupabaseContext } from "@/lib/auth/session";
import { commitMutation, saveError } from "@/lib/data/crm-mutations";
import { recordId } from "@/lib/data/crm-queries";
import type { Mutation } from "@/lib/data/contracts";
import { euroInput } from "@/lib/domain/format";
import type { OpportunityDraft } from "@/lib/domain/models";
import { opportunityDraftSchema, statusSchema } from "@/lib/domain/validation";

const missing = "La oportunidad no existe o no está disponible para tu cuenta.";
const saveErrors = { missing, failed: saveError, foreignKey: "Selecciona un cliente disponible." };

function editableFields({ amountCents, ...fields }: OpportunityDraft) {
  return { ...fields, amount: euroInput(amountCents).replace(",", ".") };
}

export async function createOpportunity(draft: unknown): Promise<Mutation> {
  const { db } = await requireSupabaseContext("write");
  const parsed = opportunityDraftSchema.safeParse(draft);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return commitMutation(
    () => db.from("opportunities").insert(editableFields(parsed.data)).select("id").maybeSingle(),
    saveErrors,
  );
}

export async function updateOpportunity(id: string, draft: unknown): Promise<Mutation> {
  const { db, user } = await requireSupabaseContext("write");
  if (!recordId.safeParse(id).success) return { ok: false, message: missing };
  const parsed = opportunityDraftSchema.safeParse(draft);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return commitMutation(
    () => db.from("opportunities").update(editableFields(parsed.data))
      .eq("user_id", user.id).eq("id", id).select("id").maybeSingle(),
    saveErrors,
  );
}

export async function deleteOpportunity(id: string): Promise<Mutation> {
  const { db, user } = await requireSupabaseContext("write");
  if (!recordId.safeParse(id).success) return { ok: false, message: missing };
  return commitMutation(
    () => db.from("opportunities").delete().eq("user_id", user.id).eq("id", id).select("id").maybeSingle(),
    { missing, failed: "No se pudo eliminar la oportunidad. Inténtalo de nuevo." },
  );
}

export async function changeStatus(id: string, status: unknown): Promise<Mutation> {
  const { db, user } = await requireSupabaseContext("write");
  if (!recordId.safeParse(id).success) return { ok: false, message: missing };
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return commitMutation(
    () => db.from("opportunities").update({ status: parsed.data })
      .eq("user_id", user.id).eq("id", id).select("id").maybeSingle(),
    { missing, failed: "No se pudo cambiar la etapa. Inténtalo de nuevo." },
  );
}
