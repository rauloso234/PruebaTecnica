# Base de datos de ClientFlow

## Esquema de Fase 3

La migración inicial está en [20261124000100_create_crm.sql](../supabase/migrations/20261124000100_create_crm.sql). Consulta [PROJECT_STATUS.md](PROJECT_STATUS.md) para el estado de aplicación y [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para el procedimiento.

| Tabla | Columnas |
| --- | --- |
| `public.clients` | `id` y `user_id` UUID, `name` obligatorio, `company`, `email`, `phone` y `notes` opcionales, `created_at` y `updated_at` TIMESTAMPTZ. |
| `public.opportunities` | `id`, `user_id` y `client_id` UUID, `title` obligatorio, `description` opcional, `amount` NUMERIC(12,2), `status` de cinco valores y `expected_close_date` DATE opcional. Incluye ambos timestamps. |

PostgreSQL genera los UUID y timestamps. Un trigger actualiza `updated_at` al editar. Los campos de texto tienen límites de longitud y los nombres y títulos requieren al menos un carácter distinto de espacio. `status` admite `new`, `qualified`, `proposal`, `won` y `lost`.

El propietario referencia `auth.users(id)` y toma por defecto la identidad de la sesión. La unicidad de `clients(user_id, id)` respalda la clave foránea compuesta desde `opportunities(user_id, client_id)`. La relación exige el mismo propietario y restringe el borrado de clientes vinculados. Los índices incluyen propietario, cliente asociado y etapa para las consultas habituales.

## Acceso

Ambas tablas habilitan RLS expresamente. Para `authenticated`, SELECT y DELETE usan una condición de propietario basada en `auth.uid()`, INSERT valida la fila resultante y UPDATE exige coincidencia tanto antes como después de la escritura. Se conceden SELECT y DELETE en las tablas, e INSERT y UPDATE solo en columnas editables. Identificadores, propietario y timestamps quedan fuera de los permisos de escritura. `anon` y `PUBLIC` carecen de acceso a las tablas del CRM.

## Importes

El tipo decimal almacena euros. El dominio calcula con céntimos enteros y presenta en EUR con configuración `es-ES`. El límite funcional es 999.999.999,99 EUR y el mínimo es cero. La aplicación rechaza valores con más de dos decimales. La asignación directa a NUMERIC(12,2) aplica la coerción de PostgreSQL antes de evaluar el CHECK.

## Aplicación y comprobación remotas

El usuario aplicó la migración inicial mediante SQL Editor. Confirmó ambas tablas, RLS activo, ocho políticas, dos triggers activos y SELECT permitido a authenticated y denegado a anon. El historial de CLI no existía en la comprobación previa. Consulta [SUPABASE_SETUP.md](SUPABASE_SETUP.md) antes de cualquier db push.

Las consultas siguientes inspeccionan el catálogo sin escribir datos. INSERT y UPDATE se comprueban por columna, porque los permisos de escritura del CRM están limitados a campos editables.

```sql
select table_name, role_name,
       has_table_privilege(role_name, table_name, 'SELECT') as can_select,
       has_table_privilege(role_name, table_name, 'DELETE') as can_delete,
       array(select a.attname from pg_attribute a
             where a.attrelid = table_name::regclass and a.attnum > 0
               and not a.attisdropped
               and has_column_privilege(role_name, table_name, a.attname, 'INSERT')
             order by a.attname) as insert_columns,
       array(select a.attname from pg_attribute a
             where a.attrelid = table_name::regclass and a.attnum > 0
               and not a.attisdropped
               and has_column_privilege(role_name, table_name, a.attname, 'UPDATE')
             order by a.attname) as update_columns
from (values ('public.clients'), ('public.opportunities')) t(table_name)
cross join (values ('authenticated'), ('anon')) r(role_name);

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('clients', 'opportunities')
order by tablename, cmd;

select conrelid::regclass as relation, conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid in ('public.clients'::regclass, 'public.opportunities'::regclass)
order by relation, conname;
```

Para authenticated se esperan permisos DELETE y listas de campos de escritura acordes con la migración. Para anon, DELETE debe ser falso y las listas deben estar vacías. Comprueba las expresiones de cada política contra la migración, además de la clave foránea compuesta con RESTRICT y las restricciones de estado e importe.

### Auditoría de metadatos del operador

El usuario ejecutó las consultas de solo lectura en Supabase SQL Editor y confirmó ambas tablas con RLS, ocho políticas para `authenticated` con `auth.uid() = user_id` y las expresiones USING y WITH CHECK correspondientes. Confirmó SELECT y DELETE para authenticated, INSERT y UPDATE solo en columnas editables y ausencia de los cuatro permisos para anon. Confirmó claves primarias, unicidad compuesta, FK compuesta con ON DELETE RESTRICT, límites de longitud e importe y los cinco estados. Los dos triggers activos constan en la comprobación inicial del usuario. Esta evidencia procede del operador de Supabase. La matriz autenticada de Testing consta en TEST_REPORT.md.
