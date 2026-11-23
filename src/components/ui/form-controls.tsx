import { ChevronDown, LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Field({ id, label, error, children }: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-navy">{label}</label>
      {children}
      {error && <p id={id + "-error"} className="text-sm text-red-700" role="alert">{error}</p>}
    </div>
  );
}

export function fieldErrorProps(id: string, error?: string) {
  return { "aria-invalid": Boolean(error), "aria-describedby": error ? id + "-error" : undefined };
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn("min-h-24 w-full resize-y rounded-lg border border-control-border bg-card px-3.5 py-2.5 text-base enabled:hover:border-slate-600 disabled:bg-muted aria-invalid:border-red-600 enabled:aria-invalid:hover:border-red-700", className)} {...props} />;
}

export function Select({ className, children, compact = false, ...props }: ComponentProps<"select"> & { compact?: boolean }) {
  return (
    <div className="relative">
      <select className={cn(
        "min-h-11 w-full appearance-none rounded-lg border border-control-border bg-card py-2 text-sm enabled:hover:border-slate-600 disabled:cursor-not-allowed disabled:bg-muted aria-invalid:border-red-600 enabled:aria-invalid:hover:border-red-700",
        compact ? "pr-5 pl-1.5" : "pr-9 pl-3",
        className,
      )} {...props}>
        {children}
      </select>
      <ChevronDown className={cn(
        "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
        compact ? "right-1.5 size-3" : "right-3 size-4",
      )} aria-hidden="true" />
    </div>
  );
}

export function FormFooter({ pending, error, label, onCancel }: { pending: boolean; error?: string; label: string; onCancel: () => void }) {
  return (
    <div className="space-y-3 border-t border-border pt-4">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          {pending ? "Guardando…" : label}
        </Button>
      </div>
    </div>
  );
}
