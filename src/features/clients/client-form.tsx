"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Field, fieldErrorProps, FormFooter, Textarea } from "@/components/ui/form-controls";
import { Input } from "@/components/ui/input";
import type { Mutation } from "@/lib/data/contracts";
import type { Client, ClientDraft } from "@/lib/domain/models";
import { clientSchema, type ClientFields } from "@/lib/domain/validation";

type ClientFormProps = {
  client?: Client;
  onSave?: (draft: ClientDraft) => Promise<Mutation>;
  onClose: () => void;
  onPending: (pending: boolean) => void;
};

export function ClientForm({ client, onSave, onClose, onPending }: ClientFormProps) {
  const prefix = useId();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ClientFields, unknown, ClientDraft>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: client?.name ?? "", company: client?.company ?? "", email: client?.email ?? "", phone: client?.phone ?? "", notes: client?.notes ?? "" },
  });

  const submit = handleSubmit(async (draft) => {
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
      toast.success(client ? "Cliente actualizado." : "Cliente creado.");
      onClose();
    } catch {
      setError("root", { message: "No se pudo guardar el cliente. Inténtalo de nuevo." });
    } finally {
      onPending(false);
    }
  });

  const id = (field: keyof ClientFields) => `${prefix}-${field}`;

  return (
    <form method="post" onSubmit={submit} noValidate aria-busy={isSubmitting} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field id={id("name")} label="Nombre" error={errors.name?.message}>
          <Input id={id("name")} required autoComplete="name" {...fieldErrorProps(id("name"), errors.name?.message)} {...register("name")} />
        </Field>
        <Field id={id("company")} label="Empresa" error={errors.company?.message}>
          <Input id={id("company")} autoComplete="organization" {...fieldErrorProps(id("company"), errors.company?.message)} {...register("company")} />
        </Field>
        <Field id={id("email")} label="Correo electrónico" error={errors.email?.message}>
          <Input id={id("email")} type="email" autoComplete="email" {...fieldErrorProps(id("email"), errors.email?.message)} {...register("email")} />
        </Field>
        <Field id={id("phone")} label="Teléfono" error={errors.phone?.message}>
          <Input id={id("phone")} type="tel" autoComplete="tel" {...fieldErrorProps(id("phone"), errors.phone?.message)} {...register("phone")} />
        </Field>
        <div className="md:col-span-2">
          <Field id={id("notes")} label="Notas" error={errors.notes?.message}>
            <Textarea id={id("notes")} {...fieldErrorProps(id("notes"), errors.notes?.message)} {...register("notes")} />
          </Field>
        </div>
      </div>
      <FormFooter pending={isSubmitting} error={errors.root?.message} label={client ? "Guardar cambios" : "Crear cliente"} onCancel={onClose} />
    </form>
  );
}
