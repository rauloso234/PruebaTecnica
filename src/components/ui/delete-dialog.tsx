"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Mutation } from "@/lib/data/contracts";
import { Button } from "./button";
import { dialogClass } from "./record-dialog";

export function DeleteDialog({ name, recordType, onDelete, restriction }: {
  name: string;
  recordType: "cliente" | "oportunidad";
  onDelete?: () => Promise<Mutation>;
  restriction?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const description = restriction ?? (onDelete
    ? `Se eliminará «${name}» de forma permanente.`
    : "La eliminación estará disponible cuando se conecte la base de datos.");

  async function confirm() {
    if (!onDelete || restriction || pending) return;
    setPending(true);
    setError(undefined);
    try {
      const result = await onDelete();
      if (result.ok) {
        toast.success(recordType === "cliente" ? "Cliente eliminado." : "Oportunidad eliminada.");
        setOpen(false);
      } else {
        setError(result.message);
      }
    } catch {
      setError("No se pudo eliminar el registro. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => {
      if (pending) return;
      if (next) setError(undefined);
      setOpen(next);
    }}>
      <AlertDialog.Trigger asChild>
        <Button type="button" variant="ghost" size="sm" aria-label={`Eliminar ${name}`} className="text-red-700 hover:bg-red-50">
          <Trash2 aria-hidden="true" /> Eliminar
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 bg-navy/55" />
        <AlertDialog.Content className={dialogClass} aria-busy={pending}>
          <AlertDialog.Title className="font-display text-xl font-extrabold text-navy">Eliminar {recordType}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</AlertDialog.Description>
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <AlertDialog.Cancel asChild><Button type="button" variant="outline" disabled={pending}>{restriction || !onDelete ? "Cerrar" : "Cancelar"}</Button></AlertDialog.Cancel>
            {!restriction && onDelete && (
              <Button type="button" variant="destructive" disabled={pending} onClick={() => { void confirm(); }}>
                {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
                {pending ? "Eliminando…" : "Confirmar eliminación"}
              </Button>
            )}
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
