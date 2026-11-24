import type { Metadata } from "next";
import { ChartNoAxesCombined, PanelsTopLeft, UsersRound } from "lucide-react";
import { signIn } from "@/features/auth/actions";
import { LoginForm } from "@/features/auth/login-form";
import { getPrivateDestination } from "@/lib/auth/redirects";
import { getSupabaseConfigOrNull } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Iniciar sesión" };

const items = [
  { label: "Clientes en un solo lugar", icon: UsersRound },
  { label: "Oportunidades por etapa", icon: PanelsTopLeft },
  { label: "Tu actividad comercial de un vistazo", icon: ChartNoAxesCombined },
];

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const onSignIn = getSupabaseConfigOrNull() ? signIn.bind(null, getPrivateDestination(next)) : undefined;
  return (
    <div className="page-width grid min-h-[min(44rem,75vh)] place-items-center py-10 sm:py-14">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:grid-cols-[.92fr_1fr]">
        <div className="login-art hidden content-center gap-6 p-10 text-white md:grid lg:p-12">
          <p className="text-sm font-bold text-teal-200">ClientFlow</p>
          <p className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-tight font-extrabold tracking-tight">Simplifica tus ventas. Organiza tus clientes.</p>
          <ul className="space-y-4">
            {items.map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-3 text-base font-medium text-slate-100">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-white/10 text-teal-200">
                  <Icon className="size-[17px]" aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <section aria-labelledby="login-title" className="min-w-0 p-6 sm:p-9 lg:p-12">
          <h1 id="login-title" className="font-display text-[clamp(1.9rem,4vw,2.6rem)] leading-tight font-extrabold tracking-[-0.045em] text-navy">Iniciar sesión</h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">Accede a tu espacio comercial de ClientFlow.</p>
          <LoginForm onSignIn={onSignIn} />
        </section>
      </div>
    </div>
  );
}
