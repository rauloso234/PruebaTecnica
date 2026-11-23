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
