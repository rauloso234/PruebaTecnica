"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Field, fieldErrorProps, FormFooter, Select, Textarea } from "@/components/ui/form-controls";
import { Input } from "@/components/ui/input";
import type { Mutation } from "@/lib/data/contracts";
import { euroInput } from "@/lib/domain/format";
import { opportunityStatusLabel, opportunityStatuses, type ClientOption, type Opportunity, type OpportunityDraft } from "@/lib/domain/models";
import { opportunitySchema, type OpportunityFields } from "@/lib/domain/validation";

export function OpportunityForm({ opportunity, clients, onSave, onClose, onPending }: {
  opportunity?: Opportunity;
  clients: readonly ClientOption[];
  onSave?: (draft: OpportunityDraft) => Promise<Mutation>;
  onClose: () => void;
  onPending: (pending: boolean) => void;
}) {
  const prefix = useId();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<OpportunityFields, unknown, OpportunityDraft>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: opportunity?.title ?? "",
      client_id: opportunity?.client_id ?? "",
      description: opportunity?.description ?? "",
      amount: opportunity ? euroInput(opportunity.amountCents) : "0",
      status: opportunity?.status ?? "new",
      expected_close_date: opportunity?.expected_close_date ?? "",
    },
  });

  const submit = handleSubmit(async (draft) => {
    if (!clients.some((client) => client.id === draft.client_id)) {
      setError("client_id", { message: "Selecciona un cliente disponible." }, { shouldFocus: true });
      return;
    }
    if (!onSave) {
      setError("root", { message: "El guardado estará disponible cuando se conecte la base de datos." });
      return;
    }
    onPending(true);
    try {
      const result = await onSave(draft);
      if (!result.ok) {
        setError("root", { message: result.message });
        return;
      }
      toast.success(opportunity ? "Oportunidad actualizada." : "Oportunidad creada.");
      onClose();
    } catch {
      setError("root", { message: "No se pudo guardar la oportunidad. Inténtalo de nuevo." });
    } finally {
      onPending(false);
    }
  });

  const id = (field: keyof OpportunityFields) => `${prefix}-${field}`;

  return (
    <form method="post" onSubmit={submit} noValidate aria-busy={isSubmitting} className="space-y-5">
      {!clients.length && <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">Necesitas un cliente disponible para asociar la oportunidad.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Field id={id("title")} label="Título" error={errors.title?.message}>
            <Input id={id("title")} required {...fieldErrorProps(id("title"), errors.title?.message)} {...register("title")} />
          </Field>
        </div>
        <Field id={id("client_id")} label="Cliente" error={errors.client_id?.message}>
          <Select id={id("client_id")} required {...fieldErrorProps(id("client_id"), errors.client_id?.message)} {...register("client_id")}>
            <option value="">Selecciona un cliente</option>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.name}{client.company ? ` · ${client.company}` : ""}</option>)}
          </Select>
        </Field>
        <Field id={id("status")} label="Etapa" error={errors.status?.message}>
          <Select id={id("status")} required {...fieldErrorProps(id("status"), errors.status?.message)} {...register("status")}>
            {opportunityStatuses.map((status) => <option key={status} value={status}>{opportunityStatusLabel[status]}</option>)}
          </Select>
        </Field>
        <Field id={id("amount")} label="Importe (€)" error={errors.amount?.message}>
          <Input id={id("amount")} inputMode="decimal" required {...fieldErrorProps(id("amount"), errors.amount?.message)} {...register("amount")} />
        </Field>
        <Field id={id("expected_close_date")} label="Cierre estimado" error={errors.expected_close_date?.message}>
          <Input id={id("expected_close_date")} type="date" {...fieldErrorProps(id("expected_close_date"), errors.expected_close_date?.message)} {...register("expected_close_date")} />
        </Field>
        <div className="md:col-span-2">
          <Field id={id("description")} label="Descripción" error={errors.description?.message}>
            <Textarea id={id("description")} {...fieldErrorProps(id("description"), errors.description?.message)} {...register("description")} />
          </Field>
        </div>
      </div>
      <FormFooter pending={isSubmitting} error={errors.root?.message} label={opportunity ? "Guardar cambios" : "Crear oportunidad"} onCancel={onClose} />
    </form>
  );
}
