"use client";

import { Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/ui/page-heading";
import { ResourceFeedback, StatePanel } from "@/components/ui/state-panel";
import type { ClientActions, ClientCollection, Resource } from "@/lib/data/contracts";
import { filterClients } from "@/lib/domain/crm";
import { formatDate } from "@/lib/domain/format";
import { ClientRecordActions, NewClient } from "./client-actions";

export function ClientsView({ resource, actions, onRetry }: {
  resource: Resource<ClientCollection>;
  actions?: Partial<ClientActions>;
  onRetry?: () => void;
}) {
  const [search, setSearch] = useState("");
  const searchId = useId();
  const ready = resource.state === "ready";
  const clients = ready ? filterClients(resource.data.clients, search) : [];
  const linkedIds = new Set(ready ? resource.data.linkedClientIds : []);

  return (
    <div className="space-y-6">
      <PageHeading title="Clientes" description="Organiza tus contactos y consulta la actividad de cada relación comercial."
        action={ready && <NewClient actions={actions} />} />
      {!ready ? <ResourceFeedback resource={resource} onRetry={onRetry} /> : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="w-full max-w-md">
              <label htmlFor={searchId} className="mb-1.5 block text-sm font-semibold text-navy">Buscar clientes</label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-4 left-3.5 size-4 text-muted-foreground" aria-hidden="true" />
                <Input id={searchId} type="search" placeholder="Nombre o empresa" value={search}
                  onChange={(event) => setSearch(event.target.value)} className="pl-10" />
              </div>
            </div>
            <p className="pb-3 text-sm text-muted-foreground" aria-live="polite">
              {clients.length} {clients.length === 1 ? "cliente" : "clientes"}
            </p>
          </div>
          {!clients.length ? (
            resource.data.clients.length
              ? <StatePanel title="No encontramos coincidencias" description="Prueba con otro nombre o empresa.">
                  <Button type="button" variant="outline" onClick={() => setSearch("")}>Limpiar búsqueda</Button>
                </StatePanel>
              : <StatePanel title="Aún no tienes clientes" description="Añade tu primer contacto para empezar a organizar el seguimiento comercial." />
          ) : (
            <Card className="overflow-hidden">
              <table className="hidden w-full table-fixed border-collapse text-left text-sm md:table">
                <caption className="sr-only">Listado de clientes</caption>
                <thead className="border-b border-border bg-slate-50 text-navy">
                  <tr>
                    <th scope="col" className="w-[17%] px-3 py-3 lg:px-4">Nombre</th>
                    <th scope="col" className="w-[15%] px-3 py-3 lg:px-4">Empresa</th>
                    <th scope="col" className="w-[21%] px-3 py-3 lg:px-4">Correo</th>
                    <th scope="col" className="w-[12%] px-3 py-3 lg:px-4">Teléfono</th>
                    <th scope="col" className="w-[15%] px-3 py-3 lg:px-4">Alta</th>
                    <th scope="col" className="w-[20%] px-3 py-3 lg:px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/80">
                      <th scope="row" className="px-3 py-3 font-semibold [overflow-wrap:anywhere] lg:px-4">
                        <Link href={`/clientes/${client.id}`} className="rounded text-blue-700 hover:underline">{client.name}</Link>
                      </th>
                      <td className="px-3 py-3 [overflow-wrap:anywhere] lg:px-4">{client.company ?? "—"}</td>
                      <td className="px-3 py-3 [overflow-wrap:anywhere] lg:px-4">{client.email ?? "—"}</td>
                      <td className="px-3 py-3 [overflow-wrap:anywhere] lg:px-4">{client.phone ?? "—"}</td>
                      <td className="px-3 py-3 lg:px-4">{formatDate(client.created_at)}</td>
                      <td className="px-2 py-2 lg:px-3">
                        <ClientRecordActions client={client} linked={linkedIds.has(client.id)} actions={actions} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul aria-label="Listado de clientes" className="divide-y divide-border md:hidden">
                {clients.map((client) => (
                  <li key={client.id} className="space-y-3 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><UserRound className="size-4" aria-hidden="true" /></span>
                      <div className="min-w-0">
                        <Link href={`/clientes/${client.id}`} className="rounded font-semibold wrap-anywhere text-blue-700 hover:underline">{client.name}</Link>
                        <p className="text-sm wrap-anywhere text-muted-foreground">{client.company ?? "Sin empresa"}</p>
                      </div>
                    </div>
                    <dl className="grid gap-2 text-sm sm:grid-cols-3">
                      <div><dt className="text-muted-foreground">Correo</dt><dd className="wrap-anywhere">{client.email ?? "—"}</dd></div>
                      <div><dt className="text-muted-foreground">Teléfono</dt><dd>{client.phone ?? "—"}</dd></div>
                      <div><dt className="text-muted-foreground">Alta</dt><dd>{formatDate(client.created_at)}</dd></div>
                    </dl>
                    <ClientRecordActions client={client} linked={linkedIds.has(client.id)} actions={actions} />
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
