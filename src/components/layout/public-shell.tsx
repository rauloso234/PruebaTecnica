import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

export function PublicShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenido" className="sr-only z-50 rounded-md bg-primary px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Saltar al contenido
      </a>
      <header className="border-b border-border bg-white text-navy">
        <div className="page-width flex min-h-[4.5rem] items-center justify-between gap-3">
          <Brand />
          <nav aria-label="Navegación principal" className="flex items-center gap-5 sm:gap-8">
            <Link href="/#funciones" className="hidden rounded text-sm font-semibold text-slate-700 hover:text-primary sm:inline">
              Funciones
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main id="contenido" tabIndex={-1} className="flex-1 focus-visible:outline-none">{children}</main>
      <footer className="border-t border-border bg-white">
        <div className="page-width flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-6 text-navy">
          <Brand />
          <p className="text-sm text-slate-600">Simplifica tus ventas. Organiza tus clientes.</p>
          <Link href="/login" className="rounded text-sm font-semibold text-slate-700 hover:text-primary">Acceso a la aplicación</Link>
        </div>
      </footer>
    </div>
  );
}
