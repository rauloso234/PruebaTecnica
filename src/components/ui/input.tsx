import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn("min-h-12 w-full rounded-lg border border-control-border bg-card px-3.5 py-2.5 text-base text-foreground placeholder:text-slate-500 enabled:hover:border-slate-600 disabled:cursor-not-allowed disabled:bg-muted aria-invalid:border-red-600 enabled:aria-invalid:hover:border-red-700", className)}
      {...props}
    />
  );
}
