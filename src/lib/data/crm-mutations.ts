import "server-only";

import { revalidatePath } from "next/cache";
import type { Mutation } from "./contracts";

export const missingClient = "La ficha no existe o no está disponible para tu cuenta.";
export const restrictedClient = "No puedes eliminar un cliente con oportunidades asociadas.";
export const saveError = "No se pudo guardar el cambio. Inténtalo de nuevo.";

export async function commitMutation(
  write: () => PromiseLike<{ data: { id: string } | null; error: { code: string } | null }>,
  errors: { missing: string; failed: string; foreignKey?: string },
): Promise<Mutation> {
  try {
    const { data, error } = await write();
    if (error) {
      const foreignKey = error.code === "23503" || error.code === "23001";
      return { ok: false, message: (foreignKey && errors.foreignKey) || errors.failed };
    }
    if (!data) return { ok: false, message: errors.missing };
  } catch {
    return { ok: false, message: errors.failed };
  }

  revalidatePath("/clientes");
  revalidatePath("/clientes/[id]", "page");
  revalidatePath("/oportunidades");
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  return { ok: true };
}
