# Decisiones

| ID | Decisión | Motivo |
| --- | --- | --- |
| D-01 | Orchestrator en AGENTS.md y dos definiciones en .codex/agents. | Mantiene la coordinación en la sesión principal y separa implementación de revisión. |
| D-02 | Habilitar agentes con dos hilos secundarios como máximo y heredar el modelo de la sesión. | Permite los dos perfiles previstos y evita fijar un modelo ajeno a la instalación. |
| D-03 | Prever Supabase Auth y políticas RLS en PostgreSQL. | Aísla datos por cuenta en la base de datos y cubre autenticación y persistencia con el mismo proveedor. |
| D-04 | Usar URL pública de Vercel con acceso autenticado al CRM. | La evaluación puede abrir el enlace sin permisos de Vercel y los datos privados siguen protegidos. |
| D-05 | Excluir permisos avanzados de equipo y usar recuentos básicos para el panel inicial. | Mantiene la prueba técnica acotada a clientes, oportunidades, pipeline y estadísticas verificables. |
| D-06 | Fase 2 entrega la experiencia visual y los contratos del CRM. Fase 3 integra Supabase Auth y PostgreSQL. | Ajusta el calendario del alcance original al encargo. Las rutas privadas fallan en cerrado y redirigen en servidor al login. Las vistas se verifican aisladamente. Se conservan autorización por operación, RLS, relación compuesta y RESTRICT para su implementación real. |
| D-07 | Usar `/clientes`, `/clientes/[id]` y `/oportunidades`. El dominio usa `status` con `new`, `qualified`, `proposal`, `won` y `lost`. | Las rutas son parte de la experiencia en español. `qualified` sustituye a `contacted` antes de que existan datos. El nombre de columna de etapa se decidirá al definir el adaptador de Fase 3. |
| D-08 | Conservar `owner_id` como identificador del propietario y añadir empresa y notas al cliente, y descripción, importe y fecha de cierre a la oportunidad. | Conserva el aislamiento y la relación de la arquitectura aprobada. Los campos adicionales permiten los formularios, el pipeline y las métricas solicitadas. El propietario se derivará de la sesión verificada. |
| D-09 | Representar importes en céntimos enteros en el dominio, formatear en EUR para `es-ES` y tratar el cierre estimado como fecha sin hora. | Evita errores de suma y cambios de fecha por zona horaria. El adaptador futuro convertirá el decimal de forma exacta. Se amplía el panel con abiertas, pipeline, ganadas y conversión. |
| D-10 | Comprobar las pantallas privadas en un servidor de pruebas Vite en loopback, aislado del enrutador de Next.js. | Playwright puede verificar componentes reales con fixtures, CSS y tamaños de pantalla sin abrir el CRM ni simular sesiones en la aplicación. |

Referencias oficiales: [Subagentes de Codex](https://developers.openai.com/codex/subagents) y [configuración de Codex](https://developers.openai.com/codex/config-reference).
