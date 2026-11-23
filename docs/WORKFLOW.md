# Flujo de trabajo

Orchestrator coordina el proceso desde la sesión principal y asigna una tarea con ID y alcance. Invoca primero a `testing` para definir criterios y registra su revisión en ACCEPTANCE.md. Con esos criterios disponibles, invoca a `develop` para implementar y ejecutar sus propias comprobaciones. Después, invoca a `testing` para una revisión independiente.

Orchestrator agrupa incidencias por ID y las entrega a `develop`. Tras cada corrección, `testing` vuelve a comprobar el criterio afectado y las regresiones pertinentes. Solo se cierra con PASS en todos los criterios obligatorios. Un resultado BLOCKED indica la dependencia que debe resolverse.

Inicia Codex desde la raíz, en un proyecto de confianza. Pide explícitamente la invocación de `testing` y `develop` como tipos personalizados y comprueba el tipo seleccionado y el identificador de cada hilo. Si la sesión actual no los ofrece, abre una sesión nueva y vuelve a comprobarlos. Registra solo delegaciones observadas en AGENT_ACTIVITY.md y resultados de comprobaciones en TEST_REPORT.md.
