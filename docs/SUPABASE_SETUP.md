# Configuración de Supabase

La integración está en curso. Consulta [PROJECT_STATUS.md](PROJECT_STATUS.md) para saber qué puedes verificar en el entorno actual.

## Configuración local

1. Copia `.env.example` a `.env.local` si aún no existe.
2. Introduce la URL del proyecto y la clave publicable del Dashboard. Git excluye `.env.local`.
3. Desde la raíz ejecuta `npm.cmd ci` y `npm.cmd run dev`. Abre http://localhost:3000.
4. Para comprobar conectividad, haz un GET a `/auth/v1/settings` con la clave publicable en la cabecera `apikey`. Un HTTP 200 confirma que responde Auth con esa configuración. La existencia de tablas y el funcionamiento del login requieren comprobaciones propias.

El acceso habitual usa la clave publicable y la sesión del usuario. Guarda las contraseñas de demostración fuera del repositorio.

## Migraciones

El usuario aplicó `20261124000100_create_crm.sql` en SQL Editor. El historial `supabase_migrations.schema_migrations` no existía en la comprobación previa. Queda pendiente comprobar el registro de esta versión en CLI. Evita volver a ejecutar el SQL inicial.

1. Antes de un futuro despliegue de esquema, verifica en el catálogo que el SQL versionado coincide con el esquema aplicado. Revisa tablas, políticas, restricciones, triggers y permisos.
2. Comprueba `supabase --version` y la ayuda de los subcomandos de la CLI instalada. Inicia sesión con `supabase login` y vincula el proyecto correcto con `supabase link --project-ref <referencia-del-proyecto>`. Usa el prompt local para cualquier credencial solicitada.
3. Consulta `supabase migration list --remote`. Si falta la versión y ya verificaste la equivalencia del esquema, solicita aprobación para modificar el historial. Ejecuta entonces `supabase migration repair 20261124000100 --status applied` conforme a la ayuda de tu CLI. Esta operación registra la versión aplicada. Si detectas divergencias, detén la reconciliación hasta aclararlas.
4. Vuelve a ejecutar `supabase migration list --remote` y `supabase db push --dry-run`. El plan debe omitir la migración inicial. Aplica futuras migraciones remotas tras su revisión y autorización.

[Gestión oficial de migraciones](https://supabase.com/docs/guides/deployment/database-migrations)

## Cuentas de demostración

En el Dashboard del proyecto, abre **Authentication → Users → Add user** y usa **Create new user** para crear dos cuentas de prueba con direcciones y contraseñas elegidas por ti. A es la cuenta demo principal y B se usa para verificar el aislamiento. Si tienes autorización sobre el buzón de pruebas, confirma el correo mediante la opción de creación cuando esté disponible. Para una cuenta invitada, abre el enlace recibido y completa la confirmación. Verifica en **Users** que ambas cuentas aparecen confirmadas antes de probar el acceso.

Las credenciales se introducen localmente o se comparten por el canal privado acordado. La carga de datos ficticios queda pendiente del bloque F3-E.

[Usuarios de Supabase Auth](https://supabase.com/docs/guides/auth/users)

### Validar con las cuentas confirmadas

Crea `.env.testing.local` en la raíz y guarda estas variables, con los valores elegidos al crear las dos cuentas. Git ignora ese archivo.

- `CRM_TEST_USER_A_EMAIL` y `CRM_TEST_USER_A_PASSWORD`.
- `CRM_TEST_USER_B_EMAIL` y `CRM_TEST_USER_B_PASSWORD`.

Para la matriz HTTP, ejecuta desde PowerShell en la raíz:

```powershell
$config = ConvertFrom-StringData (Get-Content .env.local -Raw)
$env:CRM_TEST_SUPABASE_URL = $config.NEXT_PUBLIC_SUPABASE_URL
$env:CRM_TEST_SUPABASE_PUBLISHABLE_KEY = $config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
$env:CRM_RUN_SUPABASE_TESTS = '1'
node --env-file=.env.testing.local tests/integration/crm-supabase.mjs
```

El script crea registros sintéticos en las dos cuentas. En `finally`, filtra por propietario (`user_id`) y por coincidencia exacta con los títulos de oportunidades y nombres de clientes derivados de `CRM integration <UUID>`. Elimina primero las oportunidades, luego los clientes, y comprueba que no quede ninguna fila coincidente en ambas cuentas. El lote demo permanente usa el marcador `ClientFlow demo v1:<UUID>` y queda intacto.

Los valores de las cuentas se cargan en el proceso de pruebas. Para la carga demo de A, usa las mismas variables públicas, activa `$env:CRM_DEMO_SEED = '1'` y ejecuta `node --env-file=.env.testing.local scripts/demo/seed.mjs` una vez. El procedimiento y sus condiciones están en [scripts/demo/README.md](../scripts/demo/README.md).
