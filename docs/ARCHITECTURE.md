# Arquitectura propuesta de ClientFlow

Entrega de Develop, tarea `F1-ARCHITECTURE`, hilo `/root/f1_develop`, 24 de noviembre de 2026. Orchestrator registra la propuesta para revisión independiente de Testing. No acredita implementación ni pruebas funcionales.

## Stack y responsabilidades — AR-01

Se conserva Next.js App Router, React, TypeScript estricto, Tailwind CSS, shadcn/ui, Supabase Auth/PostgreSQL, Vitest, Playwright y Vercel. Versiones compatibles y archivo de bloqueo se fijarán en Fase 2; no se han instalado paquetes.

Separación de presentación, validación, negocio y acceso a datos. Páginas y lecturas iniciales mediante Server Components; formularios, diálogos y controles de pipeline mediante Client Components pequeños, conforme al [modelo de componentes de Next.js](https://nextjs.org/docs/app/getting-started/server-and-client-components).

Estructura propuesta, todavía inexistente:

| Ruta | Responsabilidad |
| --- | --- |
| `src/app/(public)/login/` | Acceso público por email y contraseña. |
| `src/app/(private)/dashboard/` | Recuentos y distribución por etapa. |
| `src/app/(private)/clients/` | Lista, detalle, alta y edición de clientes. |
| `src/app/(private)/opportunities/` | Lista, detalle, alta y edición de oportunidades. |
| `src/app/(private)/pipeline/` | Oportunidades agrupadas por etapa. |
| `src/components/ui/` | Componentes básicos shadcn/ui. |
| `src/features/{clients,opportunities,pipeline,dashboard}/` | Componentes, validaciones y reglas de cada función. |
| `src/lib/auth/` | Verificación de identidad y acceso. |
| `src/lib/supabase/` | Clientes por entorno y acceso a datos bajo sesión de usuario. |
| `supabase/migrations/` | Tablas, restricciones, políticas y agregación del panel. |
| `tests/unit/`, `tests/integration/`, `tests/e2e/` | Reglas puras, aislamiento real y navegador. |

Las mutaciones usarán Server Actions con identidad y entradas validadas antes de negocio y datos. Acceso a datos exclusivamente de servidor. Sin API REST propia adicional si los recorridos no la necesitan.

## Modelo — AR-02

Cada cuenta Supabase Auth es propietaria exclusiva de sus registros. Sin organizaciones, equipos ni roles adicionales.

| Entidad | Campos y reglas propuestos |
| --- | --- |
| Cliente | `id` UUID, `owner_id` UUID vinculado al usuario, `name` obligatorio de 1–120 caracteres tras recortar espacios, `email` opcional hasta 254 caracteres con formato válido, `phone` opcional hasta 30 caracteres, `created_at` y `updated_at` generados en servidor. |
| Oportunidad | `id` UUID, `owner_id` UUID, `client_id` obligatorio, `title` obligatorio de 1–160 caracteres tras recortar espacios, `stage` obligatorio, fechas `created_at` y `updated_at` generadas en servidor. |

Opcionales vacíos se normalizan a nulo. No se exige unicidad de nombre o email; no se añaden importes, previsiones o notas. Identificadores, propietarios y fechas no son editables en formularios. Validación en servidor y restricciones de obligatoriedad, longitudes esenciales y etapas en PostgreSQL.

Etapas: `new` (Nueva, inicial), `contacted` (Contactada), `proposal` (Propuesta), `won` (Ganada) y `lost` (Perdida). Se permite cualquier transición entre ellas, incluidos regresos. Valores e inicial restringidos en base de datos.

Clave única de cliente `(id, owner_id)` y relación compuesta desde oportunidad `(client_id, owner_id)` para exigir el mismo propietario en base de datos. Índices de propietario y relación cliente-oportunidad; índice por propietario y etapa para pipeline.

Borrado de cliente con oportunidades bloqueado con restricción `RESTRICT` y mensaje para borrar o reasignar primero sus oportunidades a otro cliente propio. Sin cascada implícita. Borrado permanente de oportunidad y cliente sin relaciones con confirmación.

## Autenticación y aislamiento — AR-03

Email y contraseña con Supabase Auth. Cuentas A/B preparadas para evaluación; sin registro público, recuperación por correo o invitaciones añadidas al MVP.

Cada lectura y mutación privada verificará identidad en servidor. El layout facilita navegación, pero no sustituye autorización por operación. SSR gestionará cookies y renovación; verificar token con `getClaims` o consultar `getUser` cuando se necesite usuario actualizado, sin confiar únicamente en `getSession`. Sin caché pública compartida de páginas, respuestas o datos privados. Referencia consultada por Develop: [SSR de Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs).

RLS en ambas tablas para el rol autenticado:

- Lectura y borrado: propietario igual a identidad autenticada.
- Inserción: propietario resultante igual a identidad autenticada.
- Actualización: fila existente y resultante pertenecen al usuario.
- Anónimo: sin acceso a datos privados.

`USING` y `WITH CHECK` protegen estado existente y resultante; referencia: [RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security). Relación compuesta protege vínculo cliente-oportunidad entre cuentas.

El servidor deriva `owner_id` de la identidad verificada, nunca del formulario. Acceso normal bajo contexto del usuario, sin claves privilegiadas que eludan RLS. Solo URL y clave pública pueden llegar al cliente; credenciales, tokens, contraseñas y claves privilegiadas fuera de repositorio, respuestas, logs y documentación.

IDs ajenos reciben respuesta genérica de inexistente o inaccesible, sin revelar datos o detalles del propietario. Testing verificará solicitudes directas a Supabase además de la interfaz.

## Flujos y experiencia — AR-04

Clientes y oportunidades: lista, detalle, creación, edición y borrado. Selector de clientes solo propios. Tras escritura confirmada se actualizan vistas relacionadas; recarga consulta persistencia.

Pipeline: una aparición por oportunidad en su etapa. Selector accesible y confirmación de guardado, sin requerir arrastrar tarjetas. Ante fallo conservar etapa persistida y permitir reintento.

Panel: total de clientes, total de oportunidades y recuentos por etapa, incluidos ceros. Agregación en una única instantánea mediante función con permisos del invocador y RLS, ejecutable solo por autenticados, sin `SECURITY DEFINER`. No contar desde listas paginadas/limitadas; mantener coherencia entre suma de etapas y total.

Todas las vistas tendrán carga, vacío y error recuperable. Bloquear envíos duplicados mientras estén pendientes y mostrar éxito solo tras confirmación del servidor. Traducir errores de restricciones a mensajes comprensibles.

Formularios con etiquetas, errores asociados y foco visible. Diálogos gestionan entrada y devolución de foco. Navegación y cambio de etapa utilizables con teclado. Pipeline apilado a 375 px y listas sin desbordamiento horizontal de página; columnas y tablas a 1280 px.

## Pruebas y publicación — AR-05

Todas las comprobaciones futuras están **NOT RUN**. Los scripts aún no existen; se crearán y acordarán en Fase 2.

| Comprobación | Procedimiento previsto | Criterios |
| --- | --- | --- |
| Tipos | `typecheck`, TypeScript estricto sin emisión. | AC-08 |
| Lint | `lint`, errores corregidos antes de revisión. | AC-08 |
| Compilación | `build` de producción. | AC-08 |
| Vitest | Validadores, normalización, etapas y transformación/presentación de recuentos: válidos, inválidos y límites. | AC-05..AC-08 |
| Supabase real | A/B/anónimo: CRUD permitido/denegado, falsificación propietario, vínculo cruzado, borrado relacional y datos intactos tras ataques; sin mocks para acreditar RLS. | AC-03, AC-04, AC-06 |
| Playwright | Login/logout, URL privada, atrás tras logout, CRUD, persistencia, etapa, panel vacío/poblado, errores y teclado a 375/1280 px. | AC-02..AC-08 |
| Publicación | HTTPS desde incógnito sin sesión de Vercel, acceso público y restricción privada, servicios configurados. | AC-01 |

Pruebas de aislamiento contemplarán denegación explícita, respuesta vacía o escritura de cero filas, verificando después que datos atacados siguen intactos.

Destino Vercel y Supabase. Antes de publicar verificar condiciones, cuotas y disponibilidad gratuitas vigentes, variables por entorno, URL de autenticación y ausencia de protección Vercel que impida acceso público. No se presupone aprovisionamiento. Datos de evaluación separados de reales.

## Supuestos, riesgos y decisiones pendientes — AR-06

| Decisión/riesgo | Propuesta e impacto | Resolución |
| --- | --- | --- |
| Campos y etapas | Modelo mínimo descrito; determina formularios, restricciones y límites. | Antes del modelo en Fase 2. |
| Borrado relacional | Bloquear cliente con oportunidades; evita pérdida y fija AC-03. | Antes de migraciones y CRUD. |
| Acceso evaluación | Dos cuentas preparadas, sin registro/correos; credenciales fuera de documentos públicos. | Antes de pruebas de autenticación. |
| Versiones y SSR | Versiones compatibles, archivo de bloqueo y renovación de sesión correspondiente. | Inicio de Fase 2. |
| Caché y logout | Evitar datos compartidos; probar URL, recarga y atrás tras logout. | Autenticación y AC-02/AC-04. |
| Panel | Función con permisos del invocador y pruebas A/B, sin lectura privilegiada. | Antes del panel. |
| Servicios gratuitos | Verificar condiciones y límites; si no encajan, registrar impedimento sin activar pago. | Antes de aprovisionamiento/publicación. |

Fuera del MVP: facturación, automatizaciones comerciales, correo, importación masiva, integraciones externas y permisos avanzados de equipo. La propuesta no inicia Fase 2; resultados funcionales NOT RUN.
