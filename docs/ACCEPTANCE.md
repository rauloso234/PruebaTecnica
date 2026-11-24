# Criterios de aceptación de ClientFlow

Definidos por Testing mediante delegación real `F1-ACCEPTANCE`, hilo `/root/f1_testing`, el 24 de noviembre de 2026. Orchestrator registra esta entrega antes del encargo de arquitectura. Los criterios del MVP no se consideran ejecutados por aprobar la documentación de Fase 1.

Estados: PASS = comprobación ejecutada y superada; FAIL = ejecutada con fallo; BLOCKED = dependencia que impide ejecutarla; NOT RUN = pendiente.

## Fase 1: configuración y delegación

Todos los criterios siguientes son obligatorios para cerrar Fase 1.

| ID | Procedimiento verificable | Resultado esperado |
| --- | --- | --- |
| F1-01 | Revisar la herramienta oficial y las llamadas reales con selección explícita de `agent_type: testing` y `agent_type: develop`. | Ambos tipos aceptados y con hilos reales identificables. Los TOML en disco no bastan. |
| F1-02 | Contrastar la respuesta de Testing con PROJECT_SCOPE.md y ACCEPTANCE.md. | AC-01..AC-08 trazables al alcance, con procedimientos, datos y resultados esperados registrados antes del encargo de arquitectura; pruebas MVP en NOT RUN. |
| F1-03 | Recibir la respuesta del hilo real Develop y registrar su propuesta. | Arquitectura documental conforme a AR-01..AR-06, sin desarrollar la aplicación. |
| F1-04 | Testing revisa independientemente la propuesta y aporta procedimientos, resultados e incidencias por ID. | PASS en AR-01..AR-06 y ninguna incidencia obligatoria abierta; repetir revisión de criterios corregidos. |
| F1-05 | Contrastar AGENT_ACTIVITY.md y TEST_REPORT.md con llamadas, mensajes y comandos observados. | Tarea, tipo explícito, identificador disponible, fecha, resultado real y evidencia registrados; errores históricos diferenciados de los actuales. |
| F1-06 | Revisar inventario final y PROJECT_STATUS.md. | Cambios limitados a documentación; ninguna aplicación, dependencia o infraestructura implementada; Fase 2 pendiente. COMPLETED solo tras F1-01..F1-05. |

Al definir los criterios, solo la delegación de Testing y sus lecturas estaban ejecutadas; Develop y la revisión independiente estaban pendientes. Esta entrega no autoriza el cierre. Se conserva además la instrucción del usuario: si ocurre algún error, registrar el error exacto y mantener la fase BLOCKED.

## Propuesta técnica de Develop

| ID | Contenido que debe revisarse | Resultado esperado |
| --- | --- | --- |
| AR-01 | Stack, estructura y responsabilidades. | Next.js App Router, React, TypeScript estricto, Tailwind CSS, shadcn/ui, Supabase Auth/PostgreSQL, Vitest, Playwright y Vercel; separación de presentación, validación, negocio y datos; límites servidor/cliente. |
| AR-02 | Modelo de clientes y oportunidades. | Campos mínimos, claves, propietario, relación, etapas y restricciones; política de borrado de clientes con oportunidades y datos inválidos, sin ampliar MVP. |
| AR-03 | Autenticación y aislamiento. | Área privada protegida, sesión validada en servidor, RLS de lectura y escritura propias, relación protegida entre propietarios y secretos fuera del cliente. |
| AR-04 | Flujos funcionales. | CRUD, persistencia de etapa y recuentos/distribución; estados vacío, carga y error; validación, teclado y responsive. |
| AR-05 | Comprobación y publicación. | Plan de typecheck, lint, build, Vitest, Playwright, aislamiento con dos cuentas, Vercel/Supabase y HTTPS desde incógnito en opciones gratuitas; ningún resultado futuro PASS. |
| AR-06 | Límites y decisiones. | Propuesta documental sin aplicación, instalaciones ni despliegues; exclusiones respetadas; supuestos, riesgos y decisiones pendientes con impacto y momento de resolución. |

## MVP: pruebas para fases posteriores

Datos comunes: cuentas independientes A y B, sesión anónima, clientes y oportunidades propios, entorno de pruebas sin datos reales. No registrar credenciales en documentos, capturas o logs. Antes de implementar cada tarea se fijarán reglas de campos, etapas y borrado propuestas por Develop.

| ID | Datos y procedimiento | Resultado esperado | Estado |
| --- | --- | --- | --- |
| AC-01 | Abrir URL HTTPS pública de Vercel en incógnito sin sesión de Vercel ni CRM; solicitar todas las rutas privadas acordadas. Revisar configuración de servicios sin mostrar secretos. | Acceso público disponible sin autorización de Vercel; ningún dato privado sin sesión; HTTPS válido; opciones gratuitas previstas. | NOT RUN |
| AC-02 | Iniciar sesión con A, recargar ruta privada, cerrar sesión y volver por URL directa, recarga y atrás; probar credenciales incorrectas. | Sesión válida permite acceso; cierre elimina acceso privado; credenciales incorrectas generan error comprensible sin sesión válida. | NOT RUN |
| AC-03 | Con A crear, consultar y editar cliente y oportunidad vinculada; recargar tras cada escritura; borrar oportunidad y cliente sin relaciones; probar cliente con oportunidades según política aprobada. | Valores, relaciones y borrados correctos y persistentes; política relacional explícita, sin oportunidades huérfanas. | NOT RUN |
| AC-04 | Con B y anónimo intentar listar, leer por ID, crear, editar y borrar datos de A mediante rutas, acciones servidor y Supabase con credenciales públicas y sesión propia, nunca claves privilegiadas. Crear/reasignar oportunidad de B a cliente de A y falsificar propietario. | Ningún dato ajeno revelado o alterado, propietario falsificado o relación entre cuentas. Verificar datos de A intactos tras cada intento. | NOT RUN |
| AC-05 | Crear oportunidades en cada etapa aprobada, mover una con el control ofrecido, recargar y reabrir; intentar etapa no admitida. | Cada oportunidad aparece una vez en su etapa; cambio válido persistente; etapa inválida rechazada sin modificar datos. | NOT RUN |
| AC-06 | Cuenta vacía; después A con 2 clientes y 3 oportunidades (2 en una etapa y 1 en otra); B con datos adicionales. Crear, mover y borrar, recargando panel. | Vacío con ceros; A muestra 2 clientes y 3 oportunidades, distribución 2/1/0 según etapas, suma igual al total y recuentos actualizados sin B. | NOT RUN |
| AC-07 | Cada formulario: obligatorios vacíos, espacios y límites/tipos definidos; error de servicio controlado. Navegación, formularios, diálogos y cambio de etapa con Tab, Shift+Tab, Enter y Escape cuando aplique, a 375 y 1280 px. | Inválidos rechazados también en servidor; mensajes asociados a campos; errores recuperables sin falso éxito; etiquetas/foco visibles, sin trampas de teclado ni desbordamiento horizontal de página. | NOT RUN |
| AC-08 | Instalación reproducible: ejecutar typecheck, lint, build, Vitest y Playwright que defina el proyecto; inspeccionar TypeScript estricto y cobertura AC-02..AC-07; ejecutar aislamiento contra Supabase de pruebas y AC-01 desplegado. | Todos los comandos obligatorios satisfactorios; cobertura de validación, etapas, recuentos, autenticación, CRUD y aislamiento real. Ninguna prueba obligatoria omitida, bloqueada o pendiente presentada como PASS. | NOT RUN |

AC-04 requiere intentos directos contra servidor y RLS: ocultar botones no acredita aislamiento. Arquitectura y pruebas futuras deben conservarlo.

## Fase 2: MVP visual y estructura funcional

Criterios entregados por Testing en `F2-QA-PLAN`, hilo `/root/f2_testing`. Todos parten de NOT RUN. Los resultados se publican en `TEST_REPORT.md`.

| ID | Bloque | Comprobación y resultado esperado |
| --- | --- | --- |
| F2-01 | A | Verificar lockfile, stack, TypeScript estricto, separación modular y scripts efectivos. Ejecutar lint, typecheck, test y build sin credenciales. Verificar configuración apta para Vercel y scripts dev, start y test:e2e. |
| F2-02 | A | En `/`, verificar textos y CTA solicitados, marca ClientFlow, navegación, pie, tres ventajas e ilustración de dashboard reconocible como ejemplo. La landing funciona sin Supabase. |
| F2-03 | A | En `/login`, comprobar campos, mostrar y ocultar contraseña, validación Zod asociada a cada campo, feedback al enviar y configuración pendiente. Acceso directo a las cinco rutas privadas redirige a login en servidor. Sin sesión ficticia, credenciales o bypass. |
| F2-04 | A | Verificar identidad y paleta, legibilidad, teclado, foco, etiquetas y ausencia de scroll lateral involuntario a 375, 768 y 1280 px. Ejecutar Playwright público si el entorno lo permite. |
| F2-05 | B | Con fixtures aislados, comprobar clientes en lista y detalle, búsqueda por nombre y empresa, vacío y sin coincidencias, alta y edición con normalización, errores de nombre, email y límites. Confirmar borrado y rechazo de cliente con oportunidades sin afirmar persistencia. |
| F2-06 | B | Con fixtures aislados, comprobar lista, búsqueda, filtro y formularios de oportunidades. Cliente obligatorio desde contrato de datos, título normalizado, estado válido, importe no negativo de hasta dos decimales, cero válido, fecha real opcional y confirmación de borrado. |
| F2-07 | B | Verificar cinco métricas, distribución de cinco estados, últimas oportunidades, accesos rápidos y estados vacío/pendiente. Con dos clientes, abiertas de 0,10, 0,20 y 10 €, ganadas de 30 y 40 €, y perdida de 999 €, esperar 2 clientes, 3 abiertas, 10,30 € de pipeline, 70 € ganados y 66,67 % de conversión. Sin oportunidades cerradas: 0 %. Formato EUR en español y suma en céntimos. |
| F2-08 | B | Verificar cinco columnas ordenadas, agrupación sin duplicados, conteos, importes, campos de tarjetas y acción de abrir o editar. El selector funciona con teclado. Carga o error conserva estado confirmado y sin conexión no muestra éxito. |
| F2-09 | B | Revisar shell, menú móvil, encabezado, contexto de usuario y salida mediante contrato. Verificar a 375, 768 y 1280 px, con tablas adaptadas, formularios en una columna móvil, foco, Escape y retorno de foco de diálogos. Incluir carga, vacío, error, validación y operación pendiente. Toast solo tras éxito confirmado o callback de prueba. |
| F2-10 | B | Revisar cobertura de Vitest y Testing Library. Ejecutar los scripts técnicos y Playwright según disponibilidad del entorno. Comprobar ausencia de secretos, almacenamiento alternativo, usuarios o sesiones ficticios, rutas demo privadas y flags de bypass. Distinguir fixtures de prueba del ejemplo público y registrar resultados y dependencias reales. |

Pendientes de Fase 3: autenticación, aislamiento RLS, restricciones PostgreSQL, persistencia y agregados reales por usuario. Publicación HTTPS queda para su fase. Riesgos anotados: autorización por operación, mapeo de estados y dinero a PostgreSQL, precisión y límites del importe, fechas sin desfase y separación entre ejemplos y datos reales.

## Fase 3

Criterios entregados por Testing en F3-QA-PLAN. Pruebas inicialmente NOT RUN.

| ID | Comprobación obligatoria |
| --- | --- |
| F3-A1 | Catálogo y SQL en base desechable. UUID, propietario Auth, unicidad compuesta, FK compuesta con RESTRICT, campos y cinco etapas. Probar alta y reasignación propias, cliente ajeno o inexistente y borrado vinculado con filas intactas. |
| F3-A2 | Timestamps automáticos e inalterables desde la API, avance de updated_at en edición. NUMERIC(12,2), cero, un céntimo, suma exacta 0,10 + 0,20, máximo funcional vigente, rechazo de negativo y exceso. La aplicación rechaza más de dos decimales. Postgres aplica su coerción NUMERIC antes del CHECK. Fecha sin hora estable entre zonas. |
| F3-A3 | RLS explícito y CRUD mínimo para authenticated, sin acceso efectivo de anon/PUBLIC. Matriz API de SELECT, INSERT, UPDATE y DELETE sobre ambas tablas con A/B/anónimo, propios y ajenos. Verificar filas intactas tras intentos denegados, propietario inmutable, vínculo cruzado inválido y ausencia de vías alternativas que eludan RLS. |
| F3-A4 | Clientes SSR separados, identidad verificada por lectura y mutación, propietario derivado de sesión y contexto de usuario. Alternar A/B en mismas URLs, verificar aislamiento de caché y ausencia de credenciales privadas en cliente. Sin configuración, área privada cerrada y landing disponible. |
| F3-B | AUTH-001 a AUTH-010. Validación, credenciales válidas e inválidas, login, cinco rutas privadas, logout, recarga y otra pestaña. Token alterado, expiración con refresh válido e inválido, cookies renovadas, redirecciones internas y ausencia de bucles. |
| F3-C | CLIENT-001 a CLIENT-012. CRUD propio, validación servidor, búsqueda por nombre y empresa, detalle y vínculos, estados vacío/error, persistencia, confirmación, borrado restringido y respuesta genérica para ID ajeno o inexistente. |
| F3-D | OPP-001 a OPP-012. CRUD y asociación propia, validaciones, importe y fecha, búsqueda, filtros, orden, persistencia. Cinco columnas, conteos y totales, cambio por teclado y recuperación de errores sin mostrar cambios fallidos como guardados. |
| F3-E | DASH-001 a DASH-010. Ceros, aislamiento y datos completos más allá del límite de listado. Caso de referencia con 2 clientes, 3 abiertas, 10,30 EUR de pipeline, 70,00 EUR ganados y 66,67 % de conversión. Verificar distribución, recientes y actualización después de mutar. Datos demo sintéticos cargados bajo cuenta propia y sin sobrescribir. |
| F3-R1 | Lint, typecheck, build, Vitest y Playwright. Mantener cobertura de 21 casos Vitest y 10 recorridos Playwright. Next con Supabase de pruebas y cobertura responsive a 375, 768 y 1280 px, teclado, foco y errores de consola. |

SEC-001 a SEC-016 se verifican mediante F3-A1, F3-A3, F3-A4 y F3-B. Registrar entorno, migración, procedimiento, resultados esperados y observados, estado y evidencia depurada. La matriz API comprueba cero filas o denegación y que el propietario aún puede leer la fila intacta. El cierre requiere PASS independiente en todos los criterios obligatorios.

## Fase 4 — auditoría local

| ID | Criterio obligatorio |
| --- | --- |
| F4-01 | Edge sobre Next producción y Supabase de pruebas. Landing, cinco rutas privadas, autenticación, logout, CRUD, filtro, búsqueda, cancelación, borrado, restricción, pipeline, métricas, errores y recuperación. Evidencia previa de F3 se conserva; identificar las comprobaciones repetidas. |
| F4-02 | Edge a 375, 768 y 1280 px. Revisar landing, login, dashboard, clientes y ficha, oportunidades y pipeline. Comprobar ancho, controles accesibles, espaciado, tablas, formularios, menú y diálogos. |
| F4-03 | Recorrer teclado, foco visible, semántica, nombres, etiquetas, mensajes asociados y contraste en controles y estados. Referencia 4,5:1 texto normal y 3:1 para texto grande e indicadores necesarios de controles. |
| F4-04 | Revisar sesiones, cookies, autorización, aislamiento, validación servidor, Git, logs y bundles. Matriz A/B/anónimo existente y regresión en cambios relevantes, con limpieza y salida saneada. |
| F4-05 | Lockfile, instalación reproducible y cinco scripts estándar. Revisar advertencias de dependencia, consultas y paginación. Registrar tiempos y condiciones cuando se mida rendimiento local. |
| F4-06 | Demo verificable en vista previa de 6 clientes, 10 oportunidades, cinco etapas y fechas distintas. Revisar opt-in y recuperación por marcador. |
| F4-07 | README y revisión de entrega local. Documentar requisitos de GitHub, Vercel, variables, reconciliación de migración, rotación de contraseña demo y control de logs. |

AC-01 y el tramo público de AC-08 quedan pendientes hasta autorización de despliegue. El cierre de la auditoría local exige dictamen PASS independiente en F4-01 a F4-07.
