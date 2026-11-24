import "server-only";

import { requireSupabaseContext } from "@/lib/auth/session";

export type CrmContext = Awaited<ReturnType<typeof requireSupabaseContext>>;

// Continue until an empty page, including when PostgREST caps the requested limit.
export async function readAll<T extends { id: string }>(
  fetchPage: (after: string | undefined) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  let after: string | undefined;
  for (;;) {
    const { data, error } = await fetchPage(after);
    if (error || !data) throw new Error("CRM read failed");
    const last = data.at(-1);
    if (!last) return rows;
    rows.push(...data);
    after = last.id;
  }
}
