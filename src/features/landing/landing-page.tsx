import Link from "next/link";
import { ChartNoAxesCombined, Columns3, UsersRound, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "./dashboard-preview";

const features = [
  {
    title: "Gestión centralizada de clientes",
    description: "Consulta contactos, empresas y notas en una sola ficha. Encuentra el contexto de cada conversación cuando lo necesites.",
    icon: UsersRound,
  },
  {
    title: "Seguimiento de oportunidades",
    description: "Visualiza cada negociación en su etapa, desde el primer contacto hasta el cierre. Decide qué seguimiento hacer después.",
    icon: Columns3,
  },
  {
    title: "Estadísticas comerciales",
    description: "Consulta el importe de tu pipeline, las ventas ganadas y la tasa de conversión desde un mismo panel.",
    icon: ChartNoAxesCombined,
  },
];

export function LandingPage() {
  return (
    <>
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="page-width hero-grid">
          <div className="hero-copy">
            <p className="section-label"><span /> CRM para pequeñas empresas</p>
            <h1 id="hero-title">Tus clientes y oportunidades, <em>bajo control.</em></h1>
            <p className="hero-description">Centraliza tu información comercial, organiza tus oportunidades y sigue el crecimiento de tu negocio desde un único lugar.</p>
            <div className="hero-actions">
              <Button asChild size="lg"><Link href="/login">Acceder a ClientFlow</Link></Button>
              <Button asChild size="lg" variant="ghost"><Link href="#funciones">Ver funciones</Link></Button>
            </div>
          </div>
          <div className="hero-visual">
            <DashboardPreview />
          </div>
        </div>
      </section>

      <section id="funciones" className="feature-section" aria-labelledby="feature-title">
        <div className="page-width">
          <p className="section-label"><span /> Funciones</p>
          <h2 id="feature-title">Toda tu actividad comercial, en un solo lugar.</h2>
          <div className="feature-grid">
            {features.map(({ title, description, icon: Icon }) => (
              <article key={title} className="feature-card">
                <span className="feature-icon"><Icon aria-hidden="true" size={23} /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-width cta-wrap" aria-labelledby="cta-title">
        <div className="landing-cta">
          <Waypoints className="cta-decoration" aria-hidden="true" />
          <div className="relative">
            <h2 id="cta-title">Simplifica tus ventas.<br />Organiza tus clientes.</h2>
          </div>
          <Button asChild size="lg" className="relative bg-white text-navy hover:bg-blue-50">
            <Link href="/login">Acceder a ClientFlow</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
