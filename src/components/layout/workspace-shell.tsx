"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Columns3, LayoutDashboard, LoaderCircle, LogOut, Menu, Target, UsersRound, X } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import type { VerifiedSession } from "@/lib/auth/contracts";
import type { Mutation } from "@/lib/data/contracts";
import { cn } from "@/lib/utils";

const nav = [
  { id: "dashboard", label: "Panel comercial", href: "/dashboard", icon: LayoutDashboard },
  { id: "clientes", label: "Clientes", href: "/clientes", icon: UsersRound },
  { id: "oportunidades", label: "Oportunidades", href: "/oportunidades", icon: Target },
  { id: "pipeline", label: "Pipeline", href: "/pipeline", icon: Columns3 },
] as const;

export type WorkspaceSection = (typeof nav)[number]["id"];
type WorkspaceUser = VerifiedSession["user"];

function WorkspaceNav({ active, onNavigate }: { active: WorkspaceSection; onNavigate?: () => void }) {
  return (
    <nav aria-label="Navegación del CRM" className="space-y-1">
      {nav.map(({ id, label, href, icon: Icon }) => (
        <Link key={id} href={href} aria-current={active === id ? "page" : undefined} onClick={onNavigate}
          className={cn("flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-navy", active === id && "bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-950")}>
          <Icon className="size-[18px] shrink-0" aria-hidden="true" />{label}
        </Link>
      ))}
    </nav>
  );
}

function UserArea({ user, onSignOut }: { user: WorkspaceUser; onSignOut?: () => Promise<Mutation> }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const label = user.displayName || user.email;
  const initials = label.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part.slice(0, 1).toLocaleUpperCase("es")).join("");

  async function signOut() {
    if (!onSignOut || pending) return;
    setPending(true);
    setError(undefined);
    try {
      const result = await onSignOut();
      if (!result.ok) setError(result.message);
    } catch {
      setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2 border-t border-border pt-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-100 text-sm font-bold text-teal-950" aria-hidden="true">{initials}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-navy" title={label}>{label}</p>
          <p className="truncate text-xs text-muted-foreground" title={user.email}>{user.email}</p>
        </div>
      </div>
      <Button type="button" variant="ghost" size="sm" disabled={!onSignOut || pending} onClick={() => { void signOut(); }}>
        {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <LogOut aria-hidden="true" />}
        {pending ? "Cerrando sesión…" : "Cerrar sesión"}
      </Button>
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
    </div>
  );
}

export function WorkspaceShell({ user, active, onSignOut, children }: {
  user: WorkspaceUser;
  active: WorkspaceSection;
  onSignOut?: () => Promise<Mutation>;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeLabel = nav.find(({ id }) => id === active)?.label;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[14.5rem_minmax(0,1fr)]">
      <a href="#contenido-crm" className="sr-only z-[60] rounded-md bg-primary px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">Saltar al contenido</a>
      <aside className="sticky top-0 hidden h-dvh min-h-0 flex-col gap-8 overflow-auto border-r border-border bg-card px-4 py-5 lg:flex">
        <Brand className="text-navy" />
        <WorkspaceNav active={active} />
        <div className="mt-auto"><UserArea user={user} onSignOut={onSignOut} /></div>
      </aside>
      <div className="min-w-0">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex min-h-16 max-w-[100rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="hidden items-center gap-2 text-sm font-semibold text-muted-foreground lg:flex">
              <span>Espacio comercial</span><span aria-hidden="true">/</span><span className="text-navy">{activeLabel}</span>
            </div>
            <div className="lg:hidden"><Brand className="text-navy" /></div>
            <p className="hidden max-w-64 truncate rounded-md bg-slate-100 px-3 py-1.5 text-sm font-semibold text-navy lg:block" title={user.displayName || user.email}>{user.displayName || user.email}</p>
            <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <Dialog.Trigger asChild>
                <Button type="button" variant="outline" size="icon" aria-label="Abrir menú" className="lg:hidden"><Menu aria-hidden="true" /></Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-navy/55" />
                <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(19rem,calc(100vw-2rem))] flex-col gap-5 overflow-auto border-r border-border bg-card p-5 shadow-xl outline-none">
                  <div className="flex items-center justify-between gap-2">
                    <Dialog.Title className="font-display text-lg font-extrabold text-navy">Menú de ClientFlow</Dialog.Title>
                    <Dialog.Close asChild><Button type="button" size="icon" variant="ghost" aria-label="Cerrar menú"><X aria-hidden="true" /></Button></Dialog.Close>
                  </div>
                  <Dialog.Description className="sr-only">Navega por tu espacio comercial.</Dialog.Description>
                  <WorkspaceNav active={active} onNavigate={() => setMenuOpen(false)} />
                  <div className="mt-auto"><UserArea user={user} onSignOut={onSignOut} /></div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </header>
        <main id="contenido-crm" tabIndex={-1} className="mx-auto w-full max-w-[100rem] px-4 py-6 focus-visible:outline-none sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
