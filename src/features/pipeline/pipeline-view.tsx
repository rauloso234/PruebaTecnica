"use client";

import { CalendarDays, LoaderCircle, Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/form-controls";
import { PageHeading } from "@/components/ui/page-heading";
import { ResourceFeedback } from "@/components/ui/state-panel";
import { stageColors } from "@/components/ui/status-tag";
import { EditOpportunity } from "@/features/opportunities/opportunity-actions";
import type { OpportunityActions, OpportunityCollection, Resource } from "@/lib/data/contracts";
import { groupPipeline } from "@/lib/domain/crm";
import { formatDate, formatEuro } from "@/lib/domain/format";
import { opportunityStatusLabel, opportunityStatuses, type ClientOption, type Opportunity, type OpportunityStatus } from "@/lib/domain/models";
import { statusSchema } from "@/lib/domain/validation";
import { cn } from "@/lib/utils";

function PipelineCard({ item, clients, onChangeStatus, onSave }: {
  item: Opportunity;
  clients: readonly ClientOption[];
  onChangeStatus?: OpportunityActions["changeStatus"];
  onSave?: OpportunityActions["updateOpportunity"];
}) {
  const id = useId();
  const [draft, setDraft] = useState<OpportunityStatus | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const selected = draft ?? item.status;
  const client = clients.find(({ id }) => id === item.client_id);

  async function saveStage() {
    if (!onChangeStatus || selected === item.status || pending) return;
    setPending(true);
    setError(undefined);
    try {
      const result = await onChangeStatus(item.id, selected);
      if (result.ok) toast.success("Etapa actualizada.");
      else setError(result.message);
    } catch {
      setError("No se pudo cambiar la etapa. Inténtalo de nuevo.");
    } finally {
      setDraft(null);
      setPending(false);
    }
  }

  return (
    <Card className="space-y-2.5 px-3 py-3.5" aria-busy={pending}>
      <h3 className="font-display font-extrabold wrap-anywhere text-navy">{item.title}</h3>
      <p className="flex items-start gap-1.5 text-sm wrap-anywhere text-muted-foreground">
        <UserRound className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span className="min-w-0">{client?.name ?? "Cliente no disponible"}</span>
      </p>
      <p className="text-base font-bold wrap-anywhere text-navy tabular-nums">{formatEuro(item.amountCents)}</p>
      {item.expected_close_date && (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />{formatDate(item.expected_close_date)}</p>
      )}
      <div className="space-y-1.5 border-t border-border pt-2.5">
        <label htmlFor={id} className="block text-sm font-semibold text-navy">Cambiar etapa<span className="sr-only"> de {item.title}</span></label>
        <Select id={id} value={selected} compact disabled={!onChangeStatus || pending}
          aria-describedby={error || !onChangeStatus ? id + "-result" : undefined}
          onChange={(event) => {
            const parsed = statusSchema.safeParse(event.target.value);
            if (parsed.success) setDraft(parsed.data);
            setError(undefined);
          }}>
          {opportunityStatuses.map((status) => <option key={status} value={status}>{opportunityStatusLabel[status]}</option>)}
        </Select>
        {!onChangeStatus && <p id={id + "-result"} className="text-xs text-muted-foreground">Requiere conexión a la base de datos.</p>}
        {error && <p id={id + "-result"} role="alert" className="text-sm text-red-700">{error}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <EditOpportunity opportunity={item} clients={clients} onSave={onSave} />
        {onChangeStatus && (selected !== item.status || pending) && (
          <Button type="button" size="sm" disabled={pending} onClick={() => { void saveStage(); }}>
            {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            {pending ? "Guardando…" : "Aplicar etapa"}
          </Button>
        )}
      </div>
    </Card>
  );
}

export function PipelineView({ resource, actions, onRetry }: {
  resource: Resource<OpportunityCollection>;
  actions?: Partial<OpportunityActions>;
  onRetry?: () => void;
}) {
  const groups = groupPipeline(resource.state === "ready" ? resource.data.opportunities : []);
  return (
    <div className="space-y-6">
      <PageHeading title="Pipeline comercial" description="Sigue cada oportunidad desde el primer contacto hasta su cierre."
        action={<Button asChild><Link href="/oportunidades"><Plus aria-hidden="true" /> Gestionar oportunidades</Link></Button>} />
      {resource.state !== "ready" && <ResourceFeedback resource={resource} onRetry={onRetry} />}
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" aria-label="Etapas del pipeline">
        {groups.map(({ status, label, items, totalCents }) => (
          <section key={status} aria-labelledby={`stage-${status}`} className="min-w-0 rounded-xl border border-border bg-slate-100/70 p-2.5">
            <div className="p-1.5 pb-3">
              <div className="flex items-start justify-between gap-2">
                <h2 id={`stage-${status}`} className="font-display text-sm font-extrabold text-navy">{label}</h2>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", stageColors[status])}>
                  {resource.state === "ready" ? items.length : "—"}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold wrap-anywhere text-muted-foreground tabular-nums">{resource.state === "ready" ? formatEuro(totalCents) : "Importe pendiente"}</p>
            </div>
            {resource.state === "ready" && (items.length
              ? <ul className="space-y-2.5">{items.map((item) => (
                <li key={item.id}><PipelineCard item={item} clients={resource.data.clients} onChangeStatus={actions?.changeStatus} onSave={actions?.updateOpportunity} /></li>
              ))}</ul>
              : <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-muted-foreground">Sin oportunidades en esta etapa.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
