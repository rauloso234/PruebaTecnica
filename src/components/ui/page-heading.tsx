import type { ReactNode } from "react";

export function PageHeading({ title, description, action, eyebrow }: {
  title: string;
  description: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="flex min-w-0 flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-sm font-semibold text-primary">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-extrabold tracking-tight break-words text-navy sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}
