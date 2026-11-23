import { Activity, CircleDollarSign, LayoutDashboard, ListFilter, UsersRound, Waypoints } from "lucide-react";

const metrics = [
  { label: "Clientes", value: "48", icon: UsersRound },
  { label: "Abiertas", value: "12", icon: Activity },
  { label: "Pipeline", value: "24.600 €", icon: CircleDollarSign },
];

export function DashboardPreview() {
  return (
    <figure aria-label="Vista ilustrativa del panel comercial" className="dashboard-preview">
      <figcaption className="preview-chrome">
        <span className="flex gap-1.5" aria-hidden="true"><i /><i /><i /></span>
        <span>Vista ilustrativa · Datos de ejemplo</span>
      </figcaption>
      <div className="preview-window">
        <div className="preview-rail" aria-hidden="true">
          <Waypoints className="preview-mark" />
          <span className="preview-rail-active"><LayoutDashboard /></span>
          <span><UsersRound /></span>
          <span><Activity /></span>
          <span><ListFilter /></span>
        </div>
        <div className="preview-content">
          <p className="preview-title">Resumen comercial</p>
          <div className="preview-metrics">
            {metrics.map(({ label, value, icon: Icon }) => (
              <div className="preview-metric" key={label}>
                <span><Icon aria-hidden="true" />{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="preview-chart">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <p>Actividad comercial</p>
              <span>Últimos 6 meses</span>
            </div>
            <svg viewBox="0 0 360 125" role="img" aria-label="Curva ilustrativa de actividad comercial, con tendencia ascendente">
              <defs>
                <linearGradient id="preview-area" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="#2563eb" stopOpacity=".23" />
                  <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 22H360M0 52H360M0 82H360M0 112H360" stroke="#e2e8f0" strokeDasharray="3 5" />
              <path d="M0 99C25 99 38 74 70 77S103 92 133 69 159 54 185 61 216 56 242 35 266 47 292 41 328 21 360 14V122H0Z" fill="url(#preview-area)" />
              <path d="M0 99C25 99 38 74 70 77S103 92 133 69 159 54 185 61 216 56 242 35 266 47 292 41 328 21 360 14" fill="none" stroke="#2563eb" strokeWidth="2.6" vectorEffect="non-scaling-stroke" />
              <circle cx="292" cy="41" r="4.4" fill="#14b8a6" stroke="white" strokeWidth="1.6" />
            </svg>
            <div className="preview-chart-months" aria-hidden="true"><span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span></div>
          </div>
          <div className="preview-activity">
            <span className="preview-activity-icon"><Waypoints aria-hidden="true" /></span>
            <div><strong>Oportunidades recientes</strong><span>Seguimiento por etapa</span></div>
            <span className="preview-status">Propuesta</span>
          </div>
        </div>
      </div>
    </figure>
  );
}
