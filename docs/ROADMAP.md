# Roadmap de ClientFlow

| Fase | Alcance | Estado |
| --- | --- | --- |
| 1 | Configuración de Orchestrator, Develop y Testing. Alcance, arquitectura y criterios. | COMPLETED |
| 2 | MVP visual, rutas y contratos del CRM. | COMPLETED |
| 3 | Auth, PostgreSQL, RLS, CRUD, pipeline y dashboard. | COMPLETED |
| 4 | Auditoría integral y preparación de entrega. Verificación pública diferida por autorización. | COMPLETED (auditoría local) |

El alcance se deriva de PROJECT_SCOPE.md y ACCEPTANCE.md. La auditoría y preparación local están autorizadas. AC-01 y la comprobación desplegada de AC-08 requieren una publicación futura expresamente autorizada. La carga demo permanente en A fue autorizada, ejecutada y verificada por Testing.

## Plan de auditoría

| Encargo | Responsable | Resultado |
| --- | --- | --- |
| F4-QA-PLAN | Testing | Criterios verificables antes de cambios, registrados en ACCEPTANCE.md. |
| F4-QA-AUDIT | Testing | Recorridos funcionales, visuales y accesibles en Edge, seguridad, rendimiento, demo y preparación técnica. |
| F4-DEP-01 y correcciones por ID | Develop | Correcciones acotadas a incidencias verificadas y pruebas propias. |
| F4-QA-REVIEW | Testing | Revalidación de incidencias y dictamen por criterio. |
| F4-DELIVERY | Orchestrator | Evidencia, estado y requisitos de GitHub y Vercel. |

Referencias: [alcance](PROJECT_SCOPE.md), [criterios](ACCEPTANCE.md), [estado](PROJECT_STATUS.md) e [informe](TEST_REPORT.md).

La auditoría local obtuvo 7/7 PASS. Testing cerró F4-SEC-01 tras la rotación y revalidación de A/B. GitHub y Vercel conservan pasos pendientes de autorización y preparación de la revisión definitiva. Consulta [README](../README.md) y [TEST_REPORT.md](TEST_REPORT.md).
