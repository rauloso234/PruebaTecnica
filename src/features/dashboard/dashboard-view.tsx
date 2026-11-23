import { ChartNoAxesCombined, CircleDollarSign, Goal, Plus, TrendingUp, Trophy, UsersRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/page-heading";
import { ResourceFeedback, StatePanel } from "@/components/ui/state-panel";
import { StatusTag } from "@/components/ui/status-tag";
import type { DashboardSnapshot, Resource } from "@/lib/data/contracts";
import { calculateDashboard, recentOpportunities } from "@/lib/domain/crm";
import { formatEuro, formatPercent } from "@/lib/domain/format";
import type { OpportunityStatus } from "@/lib/domain/models";

const bars: Record<OpportunityStatus, string> = {
  new: "#64748b", qualified: "#0e7490", proposal: "#2563eb", won: "#0f766e", lost: "#be123c",
};

export function DashboardView({ resource, displayName }: { resource: Resource<DashboardSnapshot>; displayName?: string }) {
  const data = resource.state === "ready" ? resource.data : null;
  const summary = data ? calculateDashboard(data.clientCount, data.opportunities) : null;
  const recent = data ? recentOpportunities(data.opportunities) : [];
  const clientNames = new Map((data?.clients ?? []).map(({ id, name }) => [id, name]));
  const metrics = [
    { label: "Total de clientes", value: summary?.clientCount, icon: UsersRound },
    { label: "Oportunidades abiertas", value: summary?.openCount, icon: TrendingUp },
    { label: "Valor del pipeline", value: summary ? formatEuro(summary.pipelineCents) : undefined, icon: CircleDollarSign },
    { label: "Ventas ganadas", value: summary ? formatEuro(summary.wonCents) : undefined, icon: Trophy },
    { label: "Tasa de conversión", value: summary ? formatPercent(summary.conversion) : undefined, icon: Goal },
  ];
  const peak = Math.max(1, ...(summary?.distribution ?? []).map(({ count }) => count));

  return (
    <div className="space-y-6">
      <PageHeading title={displayName ? `Te damos la bienvenida, ${displayName}` : "Te damos la bienvenida"}
        eyebrow="Panel comercial" description="Consulta el estado de tus ventas y las negociaciones que necesitan seguimiento."
        action={<Button asChild><Link href="/oportunidades"><Plus aria-hidden="true" /> Gestionar oportunidades</Link></Button>} />

      <section aria-label="Resumen comercial" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="min-w-0 p-4 sm:p-5">
            <span className="mb-2 grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-700"><Icon aria-hidden="true" className="size-4" /></span>
            <dl>
              <dt className="text-sm leading-tight font-semibold text-muted-foreground">{label}</dt>
              <dd className="mt-2 font-display text-xl font-extrabold wrap-anywhere text-navy tabular-nums sm:text-2xl">{value ?? "—"}</dd>
            </dl>
          </Card>
        ))}
      </section>

      {resource.state === "ready" && summary ? (
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <Card className="min-w-0 p-5 sm:p-6">
            <div className="flex gap-3">
              <ChartNoAxesCombined className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h2 className="font-display text-lg font-extrabold text-navy">Distribución por etapa</h2>
                <p className="mt-1 text-sm text-muted-foreground">Número de oportunidades en cada etapa.</p>
              </div>
            </div>
            <ul className="mt-5 space-y-3.5">
              {summary.distribution.map(({ status, label, count }) => (
                <li key={status}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-navy">{label}</span><span className="font-semibold tabular-nums">{count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <div className="h-full rounded-full" style={{ width: `${count / peak * 100}%`, backgroundColor: bars[status] }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="min-w-0 p-5 sm:p-6">
            <h2 className="font-display text-lg font-extrabold text-navy">Últimas oportunidades</h2>
            <p className="mt-1 text-sm text-muted-foreground">Negociaciones añadidas recientemente.</p>
            {recent.length ? (
              <ul className="mt-3 divide-y divide-border">
                {recent.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div className="min-w-0"><p className="font-semibold wrap-anywhere text-navy">{item.title}</p><p className="text-sm wrap-anywhere text-muted-foreground">{clientNames.get(item.client_id) ?? "Cliente no disponible"}</p></div>
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold tabular-nums"><StatusTag status={item.status} />{formatEuro(item.amountCents)}</div>
                  </li>
                ))}
              </ul>
            ) : <div className="mt-4"><StatePanel title="Sin oportunidades recientes" description="Cuando crees una oportunidad, aparecerá aquí." /></div>}
          </Card>
        </div>
      ) : resource.state !== "ready" ? <ResourceFeedback resource={resource} /> : null}

      <section aria-labelledby="quick-links" className="space-y-3">
        <h2 id="quick-links" className="font-display text-lg font-extrabold text-navy">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link href="/clientes">Ver clientes</Link></Button>
          <Button asChild variant="outline"><Link href="/oportunidades">Ver oportunidades</Link></Button>
          <Button asChild variant="outline"><Link href="/pipeline">Ver pipeline</Link></Button>
        </div>
      </section>
    </div>
  );
}
