"use client";

import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { RecordDialog } from "@/components/ui/record-dialog";
import type { OpportunityActions } from "@/lib/data/contracts";
import type { ClientOption, Opportunity } from "@/lib/domain/models";
import { OpportunityForm } from "./opportunity-form";

export function NewOpportunity({ clients, actions }: { clients: readonly ClientOption[]; actions?: Partial<OpportunityActions> }) {
  return (
    <RecordDialog
      trigger={<Button type="button"><Plus aria-hidden="true" /> Nueva oportunidad</Button>}
      title="Nueva oportunidad"
      description="Registra el importe, la etapa y el cliente de esta negociación."
    >
      {({ close, setPending }) => <OpportunityForm clients={clients} onSave={actions?.createOpportunity} onClose={close} onPending={setPending} />}
    </RecordDialog>
  );
}

export function EditOpportunity({ opportunity, clients, onSave }: {
  opportunity: Opportunity;
  clients: readonly ClientOption[];
  onSave?: OpportunityActions["updateOpportunity"];
}) {
  return (
    <RecordDialog
      trigger={<Button type="button" variant="ghost" size="sm" aria-label={`Editar ${opportunity.title}`}><Pencil aria-hidden="true" /> Editar</Button>}
      title="Editar oportunidad"
      description="Actualiza la información de esta negociación."
    >
      {({ close, setPending }) => (
        <OpportunityForm opportunity={opportunity} clients={clients}
          onSave={onSave && ((draft) => onSave(opportunity.id, draft))}
          onClose={close} onPending={setPending} />
      )}
    </RecordDialog>
  );
}

export function OpportunityRecordActions({ opportunity, clients, actions }: {
  opportunity: Opportunity;
  clients: readonly ClientOption[];
  actions?: Partial<OpportunityActions>;
}) {
  const { updateOpportunity, deleteOpportunity } = actions ?? {};
  return (
    <div className="flex flex-wrap items-center gap-1">
      <EditOpportunity opportunity={opportunity} clients={clients} onSave={updateOpportunity} />
      <DeleteDialog name={opportunity.title} recordType="oportunidad" onDelete={deleteOpportunity && (() => deleteOpportunity(opportunity.id))} />
    </div>
  );
}
