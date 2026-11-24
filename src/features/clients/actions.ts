"use server";

import { requireSupabaseContext } from "@/lib/auth/session";
import { commitMutation, missingClient, restrictedClient, saveError } from "@/lib/data/crm-mutations";
import { recordId } from "@/lib/data/crm-queries";
import type { Mutation } from "@/lib/data/contracts";
import { clientDraftSchema } from "@/lib/domain/validation";

const saveErrors = { missing: missingClient, failed: saveError };

export async function createClient(draft: unknown): Promise<Mutation> {
  const { db } = await requireSupabaseContext("write");
  const parsed = clientDraftSchema.safeParse(draft);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return commitMutation(() => db.from("clients").insert(parsed.data).select("id").maybeSingle(), saveErrors);
}

export async function updateClient(id: string, draft: unknown): Promise<Mutation> {
  const { db, user } = await requireSupabaseContext("write");
  if (!recordId.safeParse(id).success) return { ok: false, message: missingClient };
  const parsed = clientDraftSchema.safeParse(draft);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return commitMutation(
    () => db.from("clients").update(parsed.data).eq("user_id", user.id).eq("id", id).select("id").maybeSingle(),
    saveErrors,
  );
}

export async function deleteClient(id: string): Promise<Mutation> {
  const { db, user } = await requireSupabaseContext("write");
  if (!recordId.safeParse(id).success) return { ok: false, message: missingClient };
  return commitMutation(
    () => db.from("clients").delete().eq("user_id", user.id).eq("id", id).select("id").maybeSingle(),
    { missing: missingClient, failed: "No se pudo eliminar el cliente. Inténtalo de nuevo.", foreignKey: restrictedClient },
  );
}
