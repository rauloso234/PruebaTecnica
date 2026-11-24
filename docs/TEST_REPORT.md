# Informe de pruebas

## Verificación actual — 24 de noviembre de 2026

Pruebas documentales de Fase 1; no acreditan funcionamiento de una aplicación. Los resultados de Testing se registran por Orchestrator a partir del hilo real `/root/f1_testing`.

| Comprobación | Estado | Evidencia |
| --- | --- | --- |
| Lecturas de Testing | PASS | Testing ejecutó `Get-Content -Encoding UTF8 -LiteralPath AGENTS.md, .codex/agents/testing.toml, docs/agents/TESTING.md, docs/PROJECT_SCOPE.md, docs/WORKFLOW.md, docs/ACCEPTANCE.md`, salida 0. |
| Inventario inicial de Testing | PASS | `rg --files --hidden -g '!node_modules/**' -g '!.git/**'`: 13 archivos de configuración/documentación; sin aplicación. |
| Perfil recibido por Testing | PASS | El hijo `/root/f1_testing` confirmó recepción de las instrucciones específicas del perfil de solo lectura. |
| Criterios de aceptación F1-02 | PASS | Testing revisó la síntesis registrada y confirmó fidelidad, procedimientos, datos y resultados; AC-01..AC-08 en NOT RUN. |
| Delegaciones observadas por Orchestrator | Ejecutadas, resultados recibidos | `collaboration.spawn_agent` aceptó explícitamente `testing` y `develop`, devolviendo `/root/f1_testing` y `/root/f1_develop`. Ambos entregaron resultados y confirmaron instrucciones específicas; arquitectura en ARCHITECTURE.md. |
| Arquitectura AR-01..AR-06 y auditoría final F1-01..F1-06 | PASS documental | Testing completó revisión independiente; detalle por criterio a continuación. No autoriza cierre bajo la condición del usuario ante errores. |
| Pruebas funcionales AC-01..AC-08 | NOT RUN | Aplicación no desarrollada; Fase 2 no iniciada. |
| Diagnóstico auxiliar de Git de Orchestrator | FAIL | `git status --short`, salida 1: `fatal: not a git repository (or any of the parent directories): .git`. No es una prueba de agentes. |
| Primera edición de ACCEPTANCE.md | Error corregido | `apply_patch` rechazó borrado y alta sobre la misma ruta; siguiente operación Update File aceptada. Mensaje exacto en AGENT_ACTIVITY.md. |

Estado de fase: BLOCKED por la condición explícita del usuario ante errores; no se confunde con fallo de los tipos personalizados.

### Revisión final independiente F1-REVIEW

Resultado recibido del hilo `/root/f1_testing`: objetivo técnico de verificación de ambos perfiles satisfecho. Sin incidencias nuevas de arquitectura o delegación y sin correcciones pendientes de Develop. Fase 1 BLOCKED; Fase 2 no iniciada.

| Criterio | Estado | Procedimiento y evidencia de Testing |
| --- | --- | --- |
| F1-01 | PASS | Selección explícita observada por Orchestrator contrastada con lista oficial real. `collaboration.list_agents` confirmó ambos hijos; en revisión final Develop completed con entrega íntegra. Testing recibió su perfil específico. |
| F1-02 | PASS | Comparación de ACCEPTANCE.md con entrega y alcance: criterios, datos y resultados conservados; anteriores al encargo Develop. AC-01..AC-08 NOT RUN. |
| F1-03 | PASS | ARCHITECTURE.md contrastado con respuesta íntegra de Develop obtenida mediante list_agents; síntesis fiel y AR-01..AR-06 cubiertos. |
| F1-04 | PASS | Revisión independiente por criterio ejecutada; arquitectura superada, sin incidencias obligatorias nuevas ni correcciones pendientes. |
| F1-05 | PASS | Registros contrastados con entregas, mensajes y herramientas; dos delegaciones y dos resultados con identificadores y fechas; errores actuales e históricos diferenciados. |
| F1-06 | PASS | Inventario final de 14 archivos de documentación/configuración; único añadido respecto al inicial ARCHITECTURE.md. Sin aplicación, dependencias o infraestructura implementadas; estados de fases respetados. |
| AR-01 | PASS | Stack, estructura, responsabilidades, componentes servidor/cliente y mutaciones servidor definidos. |
| AR-02 | PASS | Campos, restricciones, propietarios, claves, relación compuesta, etapas y RESTRICT definidos, sin ampliar MVP. |
| AR-03 | PASS | Autorización por operación, sesión, RLS para filas existentes/resultantes, relación protegida, contexto de usuario y secretos contemplados. Solo acredita diseño. |
| AR-04 | PASS | CRUD, etapa persistente, panel, estados, validación, teclado y responsive descritos. |
| AR-05 | PASS | Plan de tipos, lint, build, Vitest, Playwright, aislamiento A/B/anónimo y HTTPS en incógnito; opciones gratuitas a comprobar, pruebas funcionales NOT RUN. |
| AR-06 | PASS | Documento con exclusiones, supuestos, riesgos, impacto y resolución; sin implementación ni inicio de Fase 2. |

Ejecuciones reales reportadas por Testing en PowerShell desde la raíz:

1. `Get-Content -Encoding UTF8 -LiteralPath docs/ARCHITECTURE.md, docs/AGENT_ACTIVITY.md, docs/TEST_REPORT.md, docs/PROJECT_STATUS.md`: documentos leídos, invocación con salida 0.
2. `rg --files --hidden -g '!node_modules/**' -g '!.git/**'`: 14 archivos de documentación/configuración.
3. `Get-Date -Format o`: `2026-11-24T00:07:51.2344321+01:00`.
4. `collaboration.list_agents`: Develop completed con propuesta íntegra y evidencia; Testing en ejecución durante la revisión.

Testing no modificó archivos ni ejecutó pruebas funcionales. Los dos errores auxiliares de Orchestrator no invalidan el funcionamiento observado de los perfiles, pero impiden declarar COMPLETED bajo la condición expresa del usuario. El registro de este informe por Orchestrator sustituye las menciones de revisión final pendiente.

## Historial — 23 de noviembre de 2026

Las filas siguientes se conservan como evidencia histórica, no como diagnóstico de las capacidades de la sesión actual.

| Comprobación | Estado | Evidencia |
| --- | --- | --- |
| Sintaxis y contenido de los tres TOML | PASS | Python 3.15.2 (`tomllib`). Se parsearon los tres archivos y se verificaron claves, nombres, tipos y límite de dos hilos. |
| Reconocimiento de los tipos personalizados | BLOCKED | La herramienta de la sesión actual carece de selector de tipo. Codex CLI 0.171.0-alpha.13 deshabilitó la configuración local por falta de confianza y registró el error de socket 10013. |
| Revisión del alcance y criterios por Testing | BLOCKED | Pendiente de cargar e invocar el tipo personalizado `testing`. |
| Propuesta técnica de Develop | BLOCKED | Pendiente de cargar e invocar el tipo personalizado `develop`. |
| Comprobaciones funcionales del CRM | NOT RUN | Previstas en fases posteriores. |

La prueba de arranque se ejecutó con `codex exec --strict-config --skip-git-repo-check --sandbox read-only --ephemeral --json`. La validación con `tomllib` comprueba los archivos en disco. El reconocimiento por Codex requiere verificar la configuración cargada en una sesión de confianza.


## Verificación de cierre — 24 de noviembre de 2026

| Comprobación de Orchestrator | Resultado | Evidencia |
| --- | --- | --- |
| Repositorio Git local | Confirmado | `git rev-parse --is-inside-work-tree` devolvió `true` y `git rev-parse --show-toplevel` devolvió `C:/Users/Raul/Desktop/PruebaTecnica`. `git status --short --branch` mostró `master` sin commits. `git remote` listó `PruebaTecnica`, ya configurado. |
| Reglas de exclusión | Verificadas | `git check-ignore -v --no-index` confirmó que las 15 rutas de ejemplo coincidían con reglas de `.gitignore`, incluidas `.env.local` en raíz y subcarpetas, credenciales, claves y `node_modules/` en raíz y subcarpetas. Los cuatro controles (`docs/PROJECT_STATUS.md`, `.codex/agents/testing.toml`, `package.json` y `package-lock.json`) no estaban excluidos. `git ls-files -ci --exclude-standard` devolvió cero rutas. |
| Delegaciones y revisión independiente | Evidencia confirmada | AGENT_ACTIVITY.md registra las invocaciones reales de Testing y Develop, sus entregas y la revisión F1-REVIEW. Se conserva el PASS documental de Testing en F1-01..F1-06 y AR-01..AR-06. |
| Incidencias auxiliares | Resueltas | El repositorio local ya existe. El parche rechazado en la sesión anterior se corrigió con `Update File`. Las evidencias de ambos errores se conservan arriba y en AGENT_ACTIVITY.md. |

Fase 1 **COMPLETED** sin incidencias bloqueantes del sistema multiagente. Los casos funcionales AC-01..AC-08 conservan su estado NOT RUN.

## Fase 2 — revisión independiente del bloque A

`F2-QA-A`, Testing (`/root/f2_testing`), Windows, Node 22.15.0, npm 10.9.2 y Edge 158. Se ejecutaron los scripts con acceso aprobado después del `EPERM` de Node en sandbox.

| ID | Estado | Resultado y evidencia de Testing |
| --- | --- | --- |
| F2-01 | PASS | `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test` (Vitest 3/3), `npm.cmd run build` y producción local con `npm start -- --hostname 127.0.0.1 --port 3161`. Build sin credenciales, `/` y `/login` HTTP 200. Playwright arrancó el servidor dev y verificó el script E2E. |
| F2-02 | PASS | Inspección y Playwright confirmaron identidad, textos, CTA, tres funciones y vista ilustrativa rotulada. |
| F2-03 | PASS | Tests de formulario y navegador: validación, visibilidad de contraseña, espera sin doble envío y aviso pendiente sin inicio de sesión. HTTP 307 con `Location: /login` en las cinco rutas privadas, tanto en E2E como en producción local. |
| F2-04 | FAIL | En Edge, foco visible, español, uso por teclado y ancho de página correcto a 375, 768 y 1280 px. El borde del input no alcanza el contraste de control esperado. Incidencia `F2-A-01`. |
| E2E público | PASS | Con `PLAYWRIGHT_CHANNEL=msedge npm.cmd run test:e2e`, 6/6 en 6,8 s. Capturas independientes en la carpeta ignorada `playwright-report/f2-qa-a/`. |

`F2-A-01` (Medium, abierto en esta revisión): en `/login`, inspeccionar el contorno en reposo del `Input` compartido (`src/components/ui/input.tsx`). `#E2E8F0` sobre blanco mide 1,23:1 y delimita el campo. Se espera contraste de al menos 3:1 o una delimitación visual equivalente. Confirmado por estilo computado y captura en tres tamaños. Asignado a Develop para corrección y nueva comprobación por Testing.

El primer smoke requirió ajustar la comprobación PowerShell de respuestas y el script de captura se repitió con un selector ASCII después de que stdin alterara un acento. La revisión completó los dos procedimientos. El servidor de producción de prueba se detuvo y se liberaron los puertos 3160 y 3161.

`F2-QA-A-01`, revalidación de Testing: **F2-04 PASS, F2-A-01 RESUELTA**. Con Edge headless, un script QA desde stdin verificó `/login` en `next dev --hostname 127.0.0.1 --port 3160`, salida 0. Los dos campos dieron 4,76:1 en reposo (`#64748B` sobre blanco), 7,58:1 en hover y foco sólido 2 px de 5,17:1 al recorrer por Tab. Medición a 375, 768 y 1280 px, sin desbordamiento y con borde decorativo `#E2E8F0` conservado. Capturas en `playwright-report/f2-qa-a-01/`. Testing detuvo el proceso de Next y liberó el puerto.

## Fase 2 — revisión independiente del bloque B

`F2-QA-B`, Testing (`/root/f2_testing`), Windows, Node 22.15.0 y Edge 158. `npm.cmd ls --depth=0`, `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test`, `npm.cmd run build` y `PLAYWRIGHT_CHANNEL=msedge npm.cmd run test:e2e` terminaron con salida 0. Vitest: **21/21 en cuatro archivos**. Playwright: **10/10**, seis recorridos públicos y cuatro del CRM aislado. El script independiente de navegador también terminó con salida 0.

| Criterio | Estado en esta revisión | Evidencia de Testing |
| --- | --- | --- |
| F2-01 a F2-04 | PASS | Regresión de scripts, landing, login, acceso cerrado y responsive público. F2-A-01 cuenta con revisión específica anterior. |
| F2-05 | PASS | Validación, filtros y restricción de borrado. Probó edición con datos precargados, feedback tras respuesta y retorno de foco. |
| F2-06 | PASS | Validación de importe, fecha, cliente y estado. Confirmó formularios, filtros, Escape y retorno de foco. |
| F2-07 | PASS | Dashboard aislado: 2 clientes, 3 abiertas, 10,30 € de pipeline, 70,00 € ganados y 66,67 % de conversión. Filtros, agrupación y caso cero cubiertos en Vitest. |
| F2-08 | FAIL | Cinco columnas con tarjetas y selector operable por teclado. Incidencia visual F2-B-01 en la etiqueta del selector. |
| F2-09 | FAIL | Quince combinaciones de vista y ancho (375, 768 y 1280 px) sin desbordamiento ni `pageerror`. Menú, foco, diálogos y error del contrato de salida verificados. F2-B-01 afecta la legibilidad a 1280 px. |
| F2-10 | PASS | Inspección de fuentes y lockfile. Fixtures en tests, harness Vite en loopback, sin rutas demo ni sesión ficticia, secretos o almacenamiento alternativo en las fuentes examinadas. Los dos paquetes locales opcionales señalados por `npm ls` figuran en el lockfile. |

`F2-B-01` (Low, abierto en esta revisión): abrir el pipeline del entorno de pruebas local en Edge a 1280 px. El selector de la primera tarjeta muestra «Nuevo conta…». Se espera la etiqueta completa «Nuevo contacto» con teclado y foco accesibles. Captura `playwright-report/f2-qa-b/pipeline-1280.png`. Develop recibió la incidencia por ID. Testing liberó los puertos 3160 y 3162 tras la revisión.

La lectura auxiliar del lockfile con `ConvertFrom-Json` falló por la clave raíz vacía estándar. La verificación posterior con Node terminó con salida 0 y comprobó el lockfile v3 contra el manifiesto. Las pruebas de autenticación real, persistencia, aislamiento y RLS de Supabase y despliegue siguen **NOT RUN**.

### Revalidación final F2-QA-B-01

Testing repitió sobre la versión corregida los cinco scripts, con Node 22.15.0, npm 10.9.2 y Edge 158:

| Comando | Estado | Evidencia |
| --- | --- | --- |
| `npm.cmd run lint` | PASS | Salida 0. |
| `npm.cmd run typecheck` | PASS | Salida 0. |
| `npm.cmd run test` | PASS | Salida 0. Vitest 21/21 en 4 archivos: 10 unitarias y 11 de componentes. |
| `npm.cmd run build` | PASS | Salida 0. Next.js construyó las dos rutas públicas y las cinco privadas sin credenciales. |
| `npm.cmd run test:e2e` con `PLAYWRIGHT_CHANNEL=msedge` | PASS | Salida 0. Playwright 10/10 en 8,0 s: 6 recorridos públicos y 4 del CRM aislado. |

`F2-B-01` **RESUELTA**, F2-08 y F2-09 **PASS**. El script independiente en Vite y Edge terminó con salida 0. A 375, 768 y 1280 px, comprobó seis selectores por tamaño, con texto Inter Variable de 14 px. Las anchuras útiles mínimas fueron 267, 278 y 111 px, respectivamente, para una opción más larga de 105 px. Verificó visualmente «Nuevo contacto» completo a 1280 px, borde 4,76:1, foco de 2 px a 5,17:1, selector por teclado y ausencia de desbordamientos y errores JavaScript. Capturas en `playwright-report/f2-qa-b-01/`. Puertos 3160 y 3162 liberados.

Resultado final de Testing: **PASS en F2-01..F2-10**. Las dos incidencias independientes quedaron resueltas y no hay incidencias obligatorias abiertas. Testing recomendó el cierre de la Fase 2. Supabase y despliegue siguen NOT RUN en esta fase.

## Fase 3 — línea base

| Comprobación de Orchestrator | Estado | Evidencia |
| --- | --- | --- |
| Configuración local | PASS | Variables coinciden con los datos proporcionados. Git ignora .env.local y no lo tiene en el índice. |
| Build previo a integración | PASS | npm.cmd run build terminó con salida 0 en Next.js 16.4.6. |
| Conectividad Auth | PASS | GET al endpoint Auth settings con clave publicable devolvió HTTP 200. El sandbox inicial impedía la conexión. |
| Catálogo e historial remotos | NOT RUN | La Data API anónima devolvió HTTP 404 para clients y opportunities. Esto solo acredita la respuesta de la API, no el estado del catálogo ni de las migraciones. |
| Pruebas de aplicación F3 | NOT RUN | Pendientes de implementación y revisión. |

### F3-A — revisión previa a la migración remota

| Comprobación | Estado | Evidencia |
| --- | --- | --- |
| F3-A1 | PASS | Testing ejecutó supabase-schema.mjs en PGlite desechable y confirmó esquema, relación compuesta, rechazo de vínculo ajeno e inexistente y borrado restringido. |
| F3-A2 | NOT RUN | Verificación SQL parcial satisfactoria de tipos, dinero, fecha y timestamps. Pendiente verificación integral con adaptador y API. |
| F3-A3 | NOT RUN | Verificación SQL parcial satisfactoria de RLS y permisos con roles simulados. Matriz HTTP con A/B y anónimo bloqueada hasta aplicar el esquema y disponer de las cuentas. |
| F3-A4 | NOT RUN | Revisión de clientes SSR y pruebas unitarias de separación de cookies y no-store. Identidad y alternancia de cuentas dependen de F3-B y las cuentas reales. |
| Lint y tipado | PASS | Develop y Testing reportaron salida 0. Testing ejecutó tsc sin incremental. |
| Build y Vitest | PASS | Develop reportó salida 0, Vitest 30/30, nueve casos nuevos. |
| Playwright de regresión | PASS | Orchestrator ejecutó npm.cmd run test:e2e con PLAYWRIGHT_CHANNEL=msedge. Salida 0, 10/10, incluye 375, 768 y 1280 px en web pública y CRM aislado. |
| Pruebas de Auth, CRUD y dashboard reales | NOT RUN | Pendientes F3-B a F3-E, migración remota y cuentas A/B. |

F3-QA-A-01 (Low) sigue abierta. Testing observó que el SQL existe como archivo nuevo sin seguimiento en Git. Confirmar inclusión en la entrega Git con git ls-files y pedir revalidación. No hay fallos de ejecución en la revisión SQL local. No se aplicó la migración remota.

### Evidencia remota aportada por el usuario

Tras aplicar manualmente 20261124000100 desde SQL Editor, el usuario confirmó `public.clients` y `public.opportunities`, ambas con RLS. El catálogo devolvió `policies=8`, `active_triggers=2`, `clients_access=true`, `opportunities_access=true`, `clients_anon_blocked=true` y `opportunities_anon_blocked=true`. Es evidencia de esquema y permisos SELECT. Las comprobaciones de escritura, expresiones RLS y aislamiento efectivo con sesiones A/B conservan sus propios resultados.

### F3-QA-A-REMOTE — revalidación independiente

- F3-QA-A-01 **PASS**. La migración figura en el índice Git, modo 100644 y blob 46b1bcca4a368ebc90f22538ba6f3e1fc0eaf8a3. El diff staged limitado a ella y su comprobación de whitespace terminaron correctamente. Incidencia cerrada.
- PGlite desechable y script de esquema, salida 0. Catálogo local confirmó DELETE de tabla y escritura por columna para authenticated, denegación de las cuatro operaciones a anon y cero concesiones a PUBLIC. Se revisaron las expresiones USING/WITH CHECK de las ocho políticas y la FK compuesta con RESTRICT.
- Catálogo remoto ampliado y matriz HTTP A/B/anónimo **NOT RUN**. La revisión independiente de SQL local usa roles simulados. La evidencia remota aportada por el usuario está en la sección anterior.
- Orchestrator repitió un GET de solo lectura a cada tabla de la Data API con clave publicable y sin sesión. `clients` y `opportunities` devolvieron HTTP 401 después de aplicar la migración. Evidencia de denegación de SELECT anónimo por HTTP. Las escrituras y el aislamiento autenticado se comprobarán de forma independiente.
- Matriz HTTP de Orchestrator contra Supabase real con cuentas confirmadas A/B. `node --env-file=.env.testing.local tests/integration/crm-supabase.mjs`, salida 0 y mensaje de éxito de CRUD y aislamiento. La prueba limita su limpieza a IDs creados durante su propia ejecución. Pendiente el resultado independiente de Testing.
- La primera compilación de Orchestrator durante las verificaciones concurrentes devolvió `ENOTEMPTY` en una carpeta de artefactos .next de Develop. Se avisó a ambos agentes y se dejó el build estándar para una ventana exclusiva.
- F3-B-LOG-01 **FAIL**. Durante un recorrido real de Edge, A autenticó correctamente y abrió dashboard, clientes, oportunidades y pipeline con HTTP 200. Al consultar la salida de Next dev se identificó exposición de los argumentos sensibles de la acción. Se detuvo el servidor. El recorrido completo de A/B queda pendiente de corrección, rotación y revalidación.
- Testing repitió de forma independiente el script HTTP con A/B, salida 0. También superó lint, TypeScript sin incremental y Vitest 54/54. F3-QA-CD-01 y F3-QA-CD-02 abiertas por cobertura de denegación y verificación de limpieza. Build y regresión Edge completos pendientes en esta revisión.
- Tras la corrección de Develop, Testing informó por comentario que build y regresión Edge salieron con código 0, 10/10. Su informe final de revalidación aún está pendiente.
- Comprobaciones de Orchestrator tras la corrección: **PASS** en el recorrido B con producción local, incluido logout comprobado al recargar otra pestaña, y limpieza exacta verificada; **PASS** de logger en dev ante usuario/contraseña sintéticos. No se emitieron los valores en esas dos ejecuciones.
- Informe independiente F3-QA-B-LOG-01/F3-R1. Build salida 0. Playwright Edge con trace off, 10/10 en 7,5 s, a 375, 768 y 1280 px para regresión pública y CRM aislado. El logger pasó la revisión estática. Su comprobación dinámica y Auth B quedaron BLOCKED en el hilo Testing por aprobación pendiente de herramientas. Orchestrator sí ejecutó ambos tramos con éxito.
- F3-QA-CD-01/02 corregidas por Develop y pendientes de repetición independiente después de rotar A. Ejecutar la matriz normal (salida esperada 0) y la variante CRM_SIMULATE_LOST_INSERT_RESPONSE=1 (fallo simulado esperado y confirmación explícita de limpieza). Los resultados anteriores corresponden a la versión inicial de la matriz.
- Orchestrator repitió la matriz ampliada con A/B y anónimo. Modo normal, salida 0; modo de respuesta perdida, salida 1 esperada. Ambos emitieron confirmación de limpieza en las dos cuentas.
- Orchestrator comprobó en memoria los valores exactos de las contraseñas contra el índice Git, archivos rastreados y nuevos no ignorados. Cero coincidencias. No se emitieron valores. Los dos archivos de entorno locales quedan fuera del índice.
- Orchestrator ejecutó Edge sobre build local con A y B. Ambas cuentas pasaron login, retorno a clientes, recarga, ocultación de filas ajenas y acceso directo sin exposición de la ficha ajena, dashboard y pipeline aislados, ancho de 375/768/1280 px y logout confirmado tras recargar una segunda pestaña. Limpieza en ambas cuentas confirmada. Código 0.
- Testing revalidó **F3-B-LOG-01 PASS** con un backend Auth sintético en loopback que recibió los valores y una captura en memoria de stdout/stderr sin coincidencias. Los primeros intentos de harness devolvieron FAIL sin atribución a una fuga y se sustituyeron por una verificación mínima reproducible.
- Testing confirmó **PASS** en la matriz ampliada normal y en el fallo esperado de pérdida simulada, con limpieza verificada A/B. F3-QA-CD-01/02 cerradas por revalidación independiente.
- Testing confirmó lint, TypeScript con incremental deshabilitado, Vitest 54/54 y build correctos. Playwright 8/10 con Auth local activo y 10/10 con configuración aislada. F3-QA-R1-01 abierta hasta revalidar el comando estándar corregido.
- Edge real complementario, evidencia de Orchestrator. La ficha ajena y una inexistente mostraron `Cliente no disponible` y el mismo estado HTTP; el propietario pudo ver su ficha. Un alta de 0,01 EUR aumentó abiertas y pipeline. Tras pasar a Ganado y recargar, el céntimo se reflejó en ventas ganadas, con totales de B intactos. Verificadas cero filas tras la limpieza.
- F3-QA-R1-01 **PASS** independiente con la configuración de regresión corregida y .env.local intacto. Playwright Edge 10/10, lint, TypeScript estándar y Vitest 54/54. Build independiente previo y build final de Orchestrator con salida 0.
- Cierre **BLOCKED** según dictamen de Testing. Queda por completar la verificación remota del catálogo y privilegios efectivos, escenarios integrados de expiración/renovación y seguridad de sesión, recorridos CRUD y filtros/errores restantes, y cobertura final de estadísticas completas y carga demo. La evidencia local anterior en PGlite y pruebas unitarias sigue registrada. La repetición independiente autenticada se quedó en espera de aprobación de herramienta.

### Auditoría remota de metadatos

**PASS aportado por el usuario** mediante SQL Editor. Privilegios por tabla y columna, expresiones de las ocho políticas, restricciones y relación compuesta con RESTRICT. Se conserva por separado de la matriz HTTP ejecutada directamente por Testing.
- Regresión final de Orchestrator con los cinco scripts npm estándar. Salida 0 en lint, TypeScript y build. Vitest 54/54 y Playwright Edge 10/10 en la suite aislada. Los casos sintéticos de sesión incluyeron rechazo de refresh inválido y conservación del destino de login.
- Testing confirmó **PASS** de los pendientes de sesión en Edge con Auth simulado y 9/9 pruebas de Proxy sintéticas. Refresh válido renovó cookies, refresh revocado eliminó la sesión y JWT alterado se rechazó. Login real A/B comprobado por separado.
- Testing verificó en Edge real búsqueda de clientes y oportunidades, filtros, validaciones, edición, importes y fecha persistidos, etapa por teclado y fallo de red reversible. Quedan F3-CLOSE-QA-01 (borrado desde UI), F3-CLOSE-QA-02 (503 desde backend) y comprobación de paginación en Edge; sus intentos anteriores no aportaron resultado.
- F3-DEMO-DATE-01 **PASS independiente** en vista previa sin credenciales: 6 clientes, 10 oportunidades, 10 fechas distintas y cinco etapas. Testing ejecutó cinco escenarios de seed con mock. Carga persistente real **NOT RUN**, requiere aprobación. F3-CLOSE-QA-03 y F3-DEMO-REPEAT-01 registrados.
- F3-CLOSE-QA-01. Orchestrator ejecutó Edge con B y comprobó en UI y API que cancelar conserva cliente y oportunidad, y que confirmar las elimina tras recargar. Limpieza exacta verificada. La repetición de Testing quedó en espera de aprobación escalada.
- F3-CLOSE-QA-02. Testing confirmó en adaptador y render aislados que cuatro HTTP 503 descartan resultados parciales, muestran error y permiten recuperarse en la siguiente lectura. Edge con Next end-to-end NOT RUN.
- F3-CLOSE-QA-03 y F3-DEMO-REPEAT-01. Testing aprobó el procedimiento documentado de reconciliación por marcador y ejecución coordinada única. La prueba de paginación de 1.007 oportunidades está aprobada en el adaptador; el recorrido de Edge con paginación y los valores del caso completo de referencia siguen pendientes en el dictamen.

### Revalidación definitiva de los tres puntos de cierre

Las solicitudes de ejecución de los hilos de Testing quedaron en espera de aprobación. Testing preparó ambos procedimientos. Orchestrator los ejecutó con aprobación explícita y devolvió la salida saneada. Testing revisó los resultados contra sus aserciones y emitió los dictámenes siguientes.

| Comprobación | Estado | Evidencia |
| --- | --- | --- |
| F3-CLOSE-QA-01 · Borrado de clientes y oportunidades | PASS | F3-FINAL-EDGE-REAL, salida 0. En Edge sobre Next de producción y Supabase real, cancelar conservó ambas filas y confirmar las eliminó de UI y API tras recargar. Un cliente vinculado no ofreció confirmación y la API devolvió 23503 sin cambiar ninguna fila. |
| F3-CLOSE-QA-02 · HTTP 503 de extremo a extremo | PASS | F3-FINAL-503, salida 0. Next de producción y backend sintético en loopback. Cuatro 503 de lectura, mensaje recuperable y una tarjeta tras reintentar. PATCH 503 seguido de PATCH 200, un solo cambio confirmado visible tras recarga. Cero marcadores o patrones de credenciales en logs, cero eventos de consola o errores de página. |
| F3-E · Estadísticas y paginación | PASS | F3-FINAL-EDGE-REAL, salida 0. Cinco métricas y distribución contrastadas con API tras crear, editar y borrar. Referencia con 2 clientes, 3 abiertas, 1.030 céntimos de pipeline y 7.000 ganados. 501 clientes y 501 oportunidades adicionales incluidos mediante paginación interna de 500 filas. La interfaz carece de navegación de páginas. |
| A/B y limpieza | PASS | La cuenta B permaneció intacta frente a mutaciones de A. La limpieza verificó ausencia de etiquetas exactas y coincidencia íntegra de los registros originales de A y B con sus capturas iniciales. |
| Regresión final | PASS | Orchestrator ejecutó lint, typecheck, test, build y test:e2e con Edge. Salida 0. Vitest 54/54 y Playwright 10/10. |

Los artefactos de las pruebas se mantuvieron en rutas de trabajo ignoradas o temporales. La auditoría de catálogo del operador, la sesión real A/B y las pruebas independientes anteriores se conservan como evidencia. La carga demo permanente permanece sin ejecutar por indicación del usuario.
- Dictamen de cierre **favorable** de Testing. Orchestrator registró Fase 3 **COMPLETED**. La Fase 4 queda pendiente.

## Fase 4 — auditoría y preparación

- F4-DEP-01. npm audit inicial: tres avisos en dependencias de desarrollo, dos críticos y uno moderado. Develop fijó Vitest 4.1.12 con un cambio acotado de manifiesto y lockfile. Orchestrator verificó lint, TypeScript y Vitest 54/54, cada uno con salida 0, y npm audit con cero vulnerabilidades en la consulta posterior.
- Orchestrator ejecutó npm ci en copia temporal sin archivos de entorno y los cinco scripts estándar. Lint, TypeScript y build con salida 0, Vitest 54/54 y Edge 10/10. npm ci mostró avisos de obsolescencia de ESLint 9.39.5 y whatwg-encoding 3.1.1. El audit consultado tras actualizar Vitest indicó cero vulnerabilidades.
- Testing, auditoría inicial Edge 158 en producción local: F4-01 PASS y F4-06 PASS. F4-02 cobertura parcial, sin desborde en las vistas observadas y pendientes páginas privadas pobladas. F4-03 FAIL, foco al cerrar Nuevo cliente a 375 px. F4-04 FAIL, A/B comparten contraseña. Escaneo exacto de Git, árbol de trabajo e historial sin coincidencias; hallazgo de subcadena del bundle atribuido a dependencia, sin coincidencia literal de contraseña ni patrón de secreto. F4-05 parcial al entregar Testing, con regresión completa limpia ejecutada después por Orchestrator. F4-07 pendiente de revalidación documental.
- F4-A11Y-02, primera regresión posparche: lint y TypeScript salieron 0. Vitest 53/54 por retorno de foco en la prueba existente de componentes. Build y Edge quedaron sin ejecutar en esa tanda. Corrección remitida a Develop.

### Dictamen F4 tras correcciones

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| F4-01 | PASS | Testing verificó cinco redirecciones y login/logout A/B. Conservó los recorridos funcionales aprobados de F3. |
| F4-02 | PASS | Orchestrator ejecutó procedimiento de Testing con Edge 158.0.4370.33. 15 vistas pobladas sin desborde y limpieza exacta. Testing revisó capturas de móvil, tablet y escritorio. |
| F4-03 | PASS | Seis diálogos y menú móvil devolvieron el foco correctamente. Contorno de 2 px y contraste mínimo de muestra 4,55:1. Se comprobó teclado y semántica accesible en Edge. |
| F4-04 | FAIL | F4-SEC-01. A/B comparten contraseña de prueba. Pendiente sustitución manual por valores nuevos y distintos y verificación saneada, incluida revalidación de acceso. |
| F4-05 | PASS | npm ci en copia limpia, npm audit sin vulnerabilidades reportadas, lint/typecheck/build salida 0, Vitest 54/54 y Edge 11/11 finales. Se preservaron los 10 casos históricos y se añadió el caso de foco. Paginación de F3 aceptada como evidencia. |
| F4-06 | PASS | Testing ejecutó dry-run de 6 clientes, 10 oportunidades, 10 fechas y cinco etapas. Carga permanente pospuesta. |
| F4-07 | PASS | Testing revalidó README y guía Supabase. Publicación y comprobaciones desplegadas quedan pendientes de autorización. |

F4-A11Y-01/02/03, F4-DEP-01 y F4-DOC-01 cerradas. En una tanda intermedia, Edge 10/11 por localizador del caso nuevo. Tras corregirlo, 11/11. El puerto residual de Vite se liberó mediante una comprobación de identidad y parada autorizada. Fase 4 **BLOCKED** hasta que Testing revalide F4-SEC-01. La excepción temporal de la exposición anterior de A sigue documentada. Ninguna carga permanente o publicación fue ejecutada.
- F4-SEC-01-ROT: sintaxis PASS, 12/12 casos en fixture local ejecutados por Testing, con preflight, login nuevo y rechazo de anterior, fallo parcial, nonce y saneamiento. Ninguna ejecución remota ni carga de credenciales reales. Preparación PASS; rotación real y verificación A/B en Supabase pendientes.
- F4-SEC-01-ROT en Supabase hospedado: PASS de Orchestrator. Check local previo PASS, preflight de ambas cuentas y rotación verificada A/B con salida 0. Los logins nuevos pasaron y las contraseñas anteriores se rechazaron, conforme a las aserciones del script. F4-SEC-01 pendiente de actualizar el entorno local y revalidar con Testing.

### Cierre de la auditoría Fase 4

- **F4-SEC-01 y F4-04 PASS**, dictamen de Testing. Orchestrator operó Edge en Next de producción con los valores locales actualizados. Login y logout A/B y redirección tras salir, cookies Secure y SameSite=Lax, contraseñas distintas. Cero coincidencias de credenciales o cookies en stdout, stderr y consola capturados en memoria. Ningún patrón de token ni error de página. Salida 0.
- Escaneo exacto y saneado de contraseñas nuevas mediante git grep con patrones por stdin, cero en índice, árbol no ignorado e historial alcanzable. Los tres archivos .env locales comprobados están ignorados y fuera del índice.
- El rechazo de contraseñas anteriores consta en la ejecución autorizada de la rotación. Testing cotejó que el estado verified exige HTTP 400 invalid_credentials sin sesión ni usuario para cada contraseña anterior. La revalidación no recuperó valores antiguos.
- Regresión final de Orchestrator, cinco comandos con salida 0. Vitest 54/54, Playwright Edge 11/11 y lint, TypeScript y build correctos.
- Testing aprobó **7/7** criterios locales. Fase 4 **COMPLETED** en auditoría y preparación. AC-01 y tramo público de AC-08 pendientes, al igual que la carga demo permanente autorizada y la publicación.

### Preparación de Demo A

- Orchestrator verificó el proyecto, que A y B son cuentas distintas y que ninguna tenía clientes con marcador de demo. Vista previa PASS: 6 clientes, 10 oportunidades, cinco etapas y 10 fechas distintas.
- Carga permanente autorizada a Demo A, una sola ejecución, salida 0. El procedimiento conserva el lote para la evaluación. Su marcador queda excluido de la limpieza de pruebas temporales.
- Testing ejecutó validación directa de solo lectura sobre API y Edge 158.0.4370.33, salida 0. DEMO-02 a DEMO-05 PASS: marcador único, 6 clientes, 10 oportunidades vinculadas y coincidencia de fechas, importes y etapas. B obtuvo cero filas de ese lote. La aplicación mostró clientes, oportunidades, 10 tarjetas en cinco etapas y cinco métricas del dashboard coherentes con la API tras recarga.

### Auditoría del candidato GitHub

- Testing reprodujo el candidato de 114 archivos en una copia temporal sin archivos de entorno. npm ci instaló 512 paquetes. Lint, typecheck y build salieron 0. Vitest 54/54 y Playwright Edge 11/11. El recorrido de Edge usa fixtures locales. No ejecutó pruebas de escritura en Supabase.
- Escaneo de Orchestrator con coincidencias exactas de credenciales actuales y patrones de tokens de alta confianza: cero en índice, árbol no ignorado e historial alcanzable. No hay archivos ignorados rastreados. Los tres archivos de entorno privados están fuera del índice.
- GH-QA-02 PASS tras corregir y revalidar dos guías. La prueba de integración usa propietario y etiquetas temporales exactas, distintas del marcador demo, elimina oportunidades antes de clientes y verifica ausencia. El lote permanente permanece intacto.
- GH-QA-01 pendiente. La consulta remota de solo lectura confirmó master predeterminado y avance 0/0 respecto a ddab5b6. El candidato local obtuvo PASS de Testing. Staging adicional, commits y subida esperan autorización.
