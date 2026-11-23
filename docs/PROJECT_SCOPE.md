# Alcance de ClientFlow

Mini CRM para pequeñas empresas, desarrollado para la prueba técnica de Speed Paradigm.

- Acceso con Supabase Auth y área privada con datos aislados por cuenta.
- Alta, consulta, edición y borrado de clientes y oportunidades relacionadas.
- Pipeline visible por etapas con cambios de etapa persistentes.
- Panel con recuentos de clientes y oportunidades y distribución por etapa.
- Validación de formularios, manejo de errores, diseño responsive y uso básico con teclado.
- Despliegue HTTPS público en Vercel y base de datos Supabase PostgreSQL dentro de las opciones gratuitas. La URL debe poder abrirse desde incógnito y el área privada debe requerir sesión.

Stack previsto: Next.js App Router, React, TypeScript estricto, Tailwind CSS, shadcn/ui, Supabase Auth y PostgreSQL, Vitest, Playwright y Vercel.

Quedan fuera del MVP facturación, automatizaciones comerciales, correo, importación masiva, integraciones externas y permisos avanzados de equipo. En Fase 1 se preparan la configuración y la documentación, se verifica la delegación y se propone la estructura técnica.
