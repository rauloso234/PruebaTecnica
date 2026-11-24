# Demo y pruebas de ClientFlow

Ejecuta `node scripts/demo/seed.mjs --dry-run` para validar la demo en local sin credenciales, opt-in ni conexión. Imprime un resumen JSON con 6 clientes, 10 oportunidades, el reparto entre los cinco estados y 10 fechas de cierre previstas distintas. Las fechas son fijas y se guardan como `YYYY-MM-DD` al cargar la demo.

Configura estas variables en el entorno local de un proyecto Supabase de pruebas con las tablas del CRM desplegadas. Usa cuentas de prueba existentes. Los scripts usan la clave pública y se autentican mediante contraseña.

| Variable | Uso |
| --- | --- |
| CRM_TEST_SUPABASE_URL | URL del proyecto Supabase de pruebas |
| CRM_TEST_SUPABASE_PUBLISHABLE_KEY | Clave pública con prefijo `sb_publishable_` |
| CRM_TEST_USER_A_EMAIL / CRM_TEST_USER_A_PASSWORD | Cuenta A usada por el seed y la prueba |
| CRM_TEST_USER_B_EMAIL / CRM_TEST_USER_B_PASSWORD | Cuenta B independiente para la prueba |

- `CRM_DEMO_SEED=1` habilita `node scripts/demo/seed.mjs`. Es una carga permanente de 6 clientes y 10 oportunidades sintéticos en A. Si la cuenta conserva clientes marcados de una demo anterior, el script se detiene.
- `CRM_RUN_SUPABASE_TESTS=1` habilita `node tests/integration/crm-supabase.mjs`. Ejecuta CRUD en ambas cuentas, comprueba RLS y verifica la limpieza de los registros temporales según el procedimiento descrito abajo. Usa cuentas desechables para que un fallo de red durante una escritura sea recuperable.
- Mantén los valores en el entorno local. Evita guardar credenciales en el repositorio o compartirlas en los informes.

## Ejecución coordinada (F3-DEMO-REPEAT-01)

Acuerda quién ejecutará la carga y desde qué terminal para esa cuenta A. Esa persona lanza el seed una sola vez y comunica el resultado tras verificar el lote. Evita lanzamientos simultáneos desde otras terminales, personas o automatizaciones. La comprobación previa y la inserción son operaciones separadas, por lo que dos procesos concurrentes podrían comprobar que la cuenta está libre e insertar ambos.

## Verificación del lote (F3-CLOSE-QA-03)

1. Con la sesión de A, busca en `clients.notes` los valores que empiezan por `ClientFlow demo v1:`. Cada ejecución genera un marcador completo `ClientFlow demo v1:<UUID>`. Usa la igualdad con ese valor completo para identificar los clientes del lote exacto.
2. Comprueba que el marcador identifica exactamente 6 clientes. Con sus IDs, cuenta las filas de `opportunities` cuyo `client_id` pertenezca a ese conjunto. Debe haber exactamente 10 oportunidades. Si hay varios marcadores, verifica cada lote por separado y comunica la duplicación.
3. Si el recuento es parcial o el resultado de la escritura es incierto, detén la carga y revisa con A los registros persistidos. No reintentes mientras haya un lote parcial o siga sin aclararse el resultado. Si ya están los 6 clientes y las 10 oportunidades del mismo lote, da la carga por realizada aunque haya fallado la confirmación del comando.

El seed conserva el lote demo permanente con el marcador `ClientFlow demo v1:<UUID>`. La prueba de integración usa etiquetas temporales derivadas de `CRM integration <UUID>`. En `finally`, filtra por propietario (`user_id`) y por coincidencia exacta con los títulos y nombres de esa ejecución. Borra primero las oportunidades, luego los clientes, y comprueba que no quede ninguna fila coincidente en ambas cuentas. El lote demo queda intacto. Usa `--dry-run` para comprobar los datos previstos sin persistirlos.

## Rotación de contraseñas de A y B (F4-SEC-01-ROT)

Desde la raíz del repositorio, con Node.js 22 y las dependencias instaladas:

- `node scripts/demo/rotate-passwords.mjs` muestra una vista previa sin leer archivos de configuración ni abrir conexiones.
- `node scripts/demo/rotate-passwords.mjs --check` valida la configuración local sin iniciar sesión.
- **Solo tras autorización expresa para el proyecto de pruebas**, ejecuta `node scripts/demo/rotate-passwords.mjs --apply`. Coordina una única ejecución y confirma el proyecto en la configuración antes de iniciarla.

Para Supabase alojado, el script toma la URL HTTPS `*.supabase.co` y la clave pública exclusivamente de `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local`. Los correos y contraseñas actuales se leen de `.env.testing.local`. Define `CRM_TEST_USER_A_NEW_PASSWORD` y `CRM_TEST_USER_B_NEW_PASSWORD` en `.env.rotation.local`. Elige valores aleatorios únicos de 20 a 72 caracteres ASCII imprimibles sin espacios, con mayúsculas, minúsculas, números, símbolos y al menos 12 caracteres distintos. Cada nueva contraseña debe diferir de las dos actuales y de la otra nueva. Mantén los tres archivos fuera de Git y los valores fuera de la terminal y de los informes.

La ejecución autentica ambas cuentas antes de iniciar la rotación y comprueba que tienen IDs distintos. Procesa A y luego B. Para cada cuenta abre una sesión fresca y envía la contraseña actual junto con la nueva a Supabase Auth. Después abre clientes independientes para verificar la identidad con la nueva y confirmar que Supabase rechaza la anterior con `invalid_credentials` HTTP 400. El script escribe únicamente en Supabase Auth y conserva los archivos locales tal como estaban.

La salida JSON usa etiquetas de cuenta, etapas, estados y mensajes predefinidos. Un fallo termina la ejecución con código 1 y detiene el procesamiento. `partial` significa que A quedó verificada y B no completó el proceso. `uncertain` indica que la actualización de A se intentó y la verificación quedó incompleta. Revisa siempre ambos estados: `untouched`, `uncertain`, `new-confirmed` (falta confirmar el rechazo de la anterior) o `verified`. Ante un resultado `partial` o `uncertain`, o una cuenta en `new-confirmed`, el campo `action` indica que debes verificar el estado de cada cuenta antes de reintentar. Haz esa comprobación mediante un procedimiento autorizado antes de repetir la rotación o actualizar la configuración de pruebas. Si aparece `reauthentication-required`, sigue el procedimiento autorizado de Supabase para esa cuenta. El script omite el nonce.

Testing puede ejecutar `node scripts/demo/rotate-passwords.mjs --apply --fixture` contra un servidor HTTP desechable en `127.0.0.1` con puerto explícito. En ese modo usa una clave ficticia fija, toma `CRM_TEST_SUPABASE_URL` y los seis valores de cuenta del entorno del proceso y omite los archivos locales. Usa exclusivamente datos sintéticos. El fixture permite observar las solicitudes del SDK sin conectarse al proyecto.
