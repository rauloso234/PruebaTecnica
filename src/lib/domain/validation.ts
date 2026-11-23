import { z } from "zod";
import { parseEuroCents } from "./format";
import { opportunityStatuses } from "./models";

function normalizeInline(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function requiredText(label: string, max: number) {
  return z.string().transform(normalizeInline).pipe(z.string()
    .min(1, `Introduce ${label}.`)
    .max(max, `Usa hasta ${max} caracteres.`));
}

function optionalText(max: number, normalize = (value: string) => value.trim()) {
  return z.string().transform(normalize).pipe(z.string()
    .max(max, `Usa hasta ${max} caracteres.`))
    .transform((value) => value || null);
}

const email = z.string().trim().max(254, "Usa hasta 254 caracteres.")
  .pipe(z.union([z.literal(""), z.email("Introduce un correo electrónico válido.")], {
    error: "Introduce un correo electrónico válido.",
  }))
  .transform((value) => value || null);

export const clientSchema = z.object({
  name: requiredText("un nombre", 120),
  company: optionalText(120, normalizeInline),
  email,
  phone: optionalText(30, normalizeInline),
  notes: optionalText(2000),
});

const amountInput = z.string().transform((input, context) => {
  const cents = parseEuroCents(input);
  if (cents === null) {
    context.addIssue({ code: "custom", message: "Introduce un importe entre 0 y 999.999.999,99 €, con hasta dos decimales." });
    return z.NEVER;
  }
  return cents;
});

export const statusSchema = z.enum(opportunityStatuses, { error: "Selecciona una etapa válida." });

export const opportunitySchema = z.object({
  title: requiredText("un título", 160),
  client_id: z.uuid("Selecciona un cliente."),
  description: optionalText(2000),
  amount: amountInput,
  status: statusSchema,
  expected_close_date: z.string().trim().pipe(z.union(
    [z.literal(""), z.iso.date("Introduce una fecha válida.")],
    { error: "Introduce una fecha válida." },
  )).transform((value) => value || null),
}).transform(({ amount, ...draft }) => ({ ...draft, amountCents: amount }));

export type ClientFields = z.input<typeof clientSchema>;
export type OpportunityFields = z.input<typeof opportunitySchema>;
