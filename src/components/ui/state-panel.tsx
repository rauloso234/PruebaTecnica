import { CircleAlert, Inbox, Link2Off } from "lucide-react";
import type { ReactNode } from "react";
import type { Resource } from "@/lib/data/contracts";
import { Button } from "./button";
import { Card } from "./card";

export function StatePanel({ title, description, kind = "empty", children }: {
  title: string;
  description: string;
  kind?: "empty" | "unavailable" | "error";
  children?: ReactNode;
}) {
  const Icon = kind === "error" ? CircleAlert : kind === "unavailable" ? Link2Off : Inbox;
  return (
    <Card className="flex min-h-40 flex-col items-center justify-center p-6 text-center sm:p-9">
      <span className="mb-3 grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="font-display text-lg font-extrabold text-navy">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground" role={kind === "error" ? "alert" : undefined}>{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}

export function ResourceFeedback({ resource, onRetry }: {
  resource: Exclude<Resource<unknown>, { state: "ready" }>;
  onRetry?: () => void;
}) {
  if (resource.state === "loading") {
    return (
      <Card className="space-y-4 p-6" role="status" aria-busy="true">
        <p className="text-sm font-semibold text-muted-foreground">Cargando información comercial…</p>
        <div className="h-8 w-2/3 animate-pulse rounded-md bg-slate-100" aria-hidden="true" />
        <div className="h-8 w-full animate-pulse rounded-md bg-slate-100" aria-hidden="true" />
      </Card>
    );
  }
  if (resource.state === "error") {
    return (
      <StatePanel kind="error" title="No se pudo cargar la información" description={resource.message}>
        {onRetry && <Button type="button" variant="outline" onClick={onRetry}>Reintentar</Button>}
      </StatePanel>
    );
  }
  return <StatePanel kind="unavailable" title="Conexión pendiente" description="Tu información comercial estará disponible cuando se conecte la base de datos." />;
}
