"use client";

import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { RecordDialog } from "@/components/ui/record-dialog";
import type { ClientActions } from "@/lib/data/contracts";
import type { Client } from "@/lib/domain/models";
import { ClientForm } from "./client-form";

export const linkedClientMessage = "Este cliente tiene oportunidades vinculadas. Elimínalas o reasígnalas antes de borrar el cliente.";

export function NewClient({ actions }: { actions?: Partial<ClientActions> }) {
  return (
    <RecordDialog
      trigger={<Button type="button"><Plus aria-hidden="true" /> Nuevo cliente</Button>}
      title="Nuevo cliente"
      description="Añade la información de contacto. Solo el nombre es obligatorio."
    >
      {({ close, setPending }) => <ClientForm onSave={actions?.createClient} onClose={close} onPending={setPending} />}
    </RecordDialog>
  );
}

export function ClientRecordActions({ client, linked, actions }: { client: Client; linked: boolean; actions?: Partial<ClientActions> }) {
  const { updateClient, deleteClient } = actions ?? {};
  return (
    <div className="flex flex-wrap items-center gap-1">
      <RecordDialog
        trigger={<Button type="button" variant="ghost" size="sm" aria-label={`Editar ${client.name}`}><Pencil aria-hidden="true" /> Editar</Button>}
        title="Editar cliente"
        description="Actualiza la ficha de contacto."
      >
        {({ close, setPending }) => (
          <ClientForm client={client} onSave={updateClient && ((draft) => updateClient(client.id, draft))}
            onClose={close} onPending={setPending} />
        )}
      </RecordDialog>
      <DeleteDialog name={client.name} recordType="cliente" onDelete={deleteClient && (() => deleteClient(client.id))}
        restriction={linked ? linkedClientMessage : undefined} />
    </div>
  );
}
