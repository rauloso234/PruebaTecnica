"use client";

import { Search } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/form-controls";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/ui/page-heading";
import { ResourceFeedback, StatePanel } from "@/components/ui/state-panel";
import { StatusTag } from "@/components/ui/status-tag";
import type { OpportunityActions, OpportunityCollection, Resource } from "@/lib/data/contracts";
import { filterOpportunities } from "@/lib/domain/crm";
import { formatDate, formatEuro } from "@/lib/domain/format";
import { opportunityStatusLabel, opportunityStatuses, type OpportunityStatus } from "@/lib/domain/models";
import { statusSchema } from "@/lib/domain/validation";
import { NewOpportunity, OpportunityRecordActions } from "./opportunity-actions";

export function OpportunitiesView({ resource, actions, onRetry }: {
  resource: Resource<OpportunityCollection>;
  actions?: Partial<OpportunityActions>;
  onRetry?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OpportunityStatus | "all">("all");
  const prefix = useId();
  const ready = resource.state === "ready";
  const clients = ready ? resource.data.clients : [];
  const items = ready ? filterOpportunities(resource.data.opportunities, clients, query, status) : [];
  const clientNames = new Map(clients.map(({ id, name }) => [id, name]));

  return (
    <div className="space-y-6">
      <PageHeading title="Oportunidades" description="Registra negociaciones y consulta el valor, la etapa y el cierre estimado de cada una."
        action={ready && <NewOpportunity clients={clients} actions={actions} />} />
      {!ready ? <ResourceFeedback resource={resource} onRetry={onRetry ?? (() => window.location.reload())} /> : (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full max-w-md sm:flex-1">
              <label htmlFor={prefix + "-search"} className="mb-1.5 block text-sm font-semibold text-navy">Buscar oportunidades</label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-4 left-3.5 size-4 text-muted-foreground" aria-hidden="true" />
                <Input id={prefix + "-search"} type="search" value={query} placeholder="Título, cliente o empresa" onChange={(event) => setQuery(event.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <label htmlFor={prefix + "-stage"} className="mb-1.5 block text-sm font-semibold text-navy">Filtrar por etapa</label>
              <Select id={prefix + "-stage"} value={status} className="min-h-12"
                onChange={(event) => {
                  const parsed = statusSchema.safeParse(event.target.value);
                  setStatus(parsed.success ? parsed.data : "all");
                }}>
                <option value="all">Todas las etapas</option>
                {opportunityStatuses.map((phase) => <option key={phase} value={phase}>{opportunityStatusLabel[phase]}</option>)}
              </Select>
            </div>
            <p className="py-3 text-sm text-muted-foreground" aria-live="polite">
              {items.length} {items.length === 1 ? "oportunidad" : "oportunidades"}
            </p>
          </div>
          {!items.length ? (
            resource.data.opportunities.length
              ? <StatePanel title="No encontramos coincidencias" description="Ajusta la búsqueda o elige otra etapa.">
                  <Button type="button" variant="outline" onClick={() => { setQuery(""); setStatus("all"); }}>Limpiar filtros</Button>
                </StatePanel>
              : <StatePanel title="Aún no tienes oportunidades" description="Crea una oportunidad vinculada a uno de tus clientes." />
          ) : (
            <Card className="overflow-hidden">
              <table className="hidden w-full table-fixed border-collapse text-left text-sm md:table">
                <caption className="sr-only">Listado de oportunidades</caption>
                <thead className="border-b border-border bg-slate-50 text-navy">
                  <tr>
                    <th scope="col" className="w-[21%] px-3 py-3">Oportunidad</th>
                    <th scope="col" className="w-[16%] px-3 py-3">Cliente</th>
                    <th scope="col" className="w-[16%] px-3 py-3">Etapa</th>
                    <th scope="col" className="w-[14%] px-3 py-3">Importe</th>
                    <th scope="col" className="w-[14%] px-3 py-3">Cierre</th>
                    <th scope="col" className="w-[19%] px-3 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <th scope="row" className="px-3 py-3 font-semibold wrap-anywhere">{item.title}</th>
                      <td className="px-3 py-3 wrap-anywhere">{clientNames.get(item.client_id) ?? "Cliente no disponible"}</td>
                      <td className="px-3 py-3"><StatusTag status={item.status} /></td>
                      <td className="px-3 py-3 font-semibold wrap-anywhere tabular-nums">{formatEuro(item.amountCents)}</td>
                      <td className="px-3 py-3">{item.expected_close_date ? formatDate(item.expected_close_date) : "—"}</td>
                      <td className="p-2"><OpportunityRecordActions opportunity={item} clients={clients} actions={actions} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul aria-label="Listado de oportunidades" className="divide-y divide-border md:hidden">
                {items.map((item) => (
                  <li key={item.id} className="space-y-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold wrap-anywhere text-navy">{item.title}</p>
                        <p className="text-sm wrap-anywhere text-muted-foreground">{clientNames.get(item.client_id) ?? "Cliente no disponible"}</p>
                      </div>
                      <StatusTag status={item.status} />
                    </div>
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      <div><dt className="text-muted-foreground">Importe</dt><dd className="font-semibold tabular-nums">{formatEuro(item.amountCents)}</dd></div>
                      <div><dt className="text-muted-foreground">Cierre</dt><dd>{item.expected_close_date ? formatDate(item.expected_close_date) : "Sin estimar"}</dd></div>
                    </dl>
                    <OpportunityRecordActions opportunity={item} clients={clients} actions={actions} />
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
