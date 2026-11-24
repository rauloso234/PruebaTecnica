"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/page-heading";
import { ResourceFeedback, StatePanel } from "@/components/ui/state-panel";
import { StatusTag } from "@/components/ui/status-tag";
import type { ClientActions, ClientRecord, Resource } from "@/lib/data/contracts";
import { hasLinkedOpportunities } from "@/lib/domain/crm";
import { formatDate, formatEuro } from "@/lib/domain/format";
import { ClientRecordActions } from "./client-actions";

export function ClientDetail({ resource, actions, onRetry }: {
  resource: Resource<ClientRecord>;
  actions?: Partial<ClientActions>;
  onRetry?: () => void;
}) {
  if (resource.state !== "ready") {
    return <div className="space-y-6"><PageHeading title="Ficha de cliente" description="Información de contacto y actividad asociada." /><ResourceFeedback resource={resource} onRetry={onRetry ?? (() => window.location.reload())} /></div>;
  }
  const { client, opportunities } = resource.data;
  if (!client) {
    return (
      <div className="space-y-6">
        <PageHeading title="Ficha de cliente" description="Información de contacto y actividad asociada." />
        <StatePanel title="Cliente no disponible" description="La ficha no existe o no está disponible para tu cuenta.">
          <Button asChild variant="outline"><Link href="/clientes">Volver a clientes</Link></Button>
        </StatePanel>
      </div>
    );
  }
  const information = [
    ["Empresa", client.company ?? "Sin empresa"],
    ["Correo electrónico", client.email ?? "Sin correo electrónico"],
    ["Teléfono", client.phone ?? "Sin teléfono"],
    ["Fecha de creación", formatDate(client.created_at)],
  ];

  return (
    <div className="space-y-6">
      <Link href="/clientes" className="rounded text-sm font-semibold text-blue-700 hover:underline">Volver a clientes</Link>
      <PageHeading title={client.name} description="Información de contacto y actividad asociada."
        action={<ClientRecordActions client={client} linked={hasLinkedOpportunities(client.id, opportunities)} actions={actions} />} />
      <Card className="space-y-5 p-5 sm:p-6">
        <h2 className="font-display text-xl font-extrabold text-navy">Datos del cliente</h2>
        <dl className="grid gap-5 sm:grid-cols-2">
          {information.map(([label, value]) => (
            <div key={label} className="min-w-0"><dt className="text-sm font-semibold text-muted-foreground">{label}</dt><dd className="mt-1 wrap-anywhere">{value}</dd></div>
          ))}
        </dl>
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Notas</h3>
          <p className="mt-1 wrap-anywhere whitespace-pre-wrap">{client.notes ?? "Sin notas"}</p>
        </div>
      </Card>
      <section aria-labelledby="associated-heading" className="space-y-3">
        <h2 id="associated-heading" className="font-display text-xl font-extrabold text-navy">Oportunidades asociadas</h2>
        {opportunities.length ? (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-border">
              {opportunities.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <span className="min-w-0 font-semibold wrap-anywhere">{item.title}</span>
                  <div className="flex flex-wrap items-center gap-3 text-sm tabular-nums"><StatusTag status={item.status} />{formatEuro(item.amountCents)}</div>
                </li>
              ))}
            </ul>
          </Card>
        ) : <StatePanel title="Sin oportunidades asociadas" description="Las oportunidades vinculadas a este cliente aparecerán aquí." />}
      </section>
    </div>
  );
}
