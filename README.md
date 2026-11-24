# ClientFlow

Mini CRM para organizar clientes, oportunidades y ventas. El área privada usa Supabase Auth y PostgreSQL. La Fase 3 está completada (`COMPLETED`) tras la revisión de Testing.

## Ejecutar localmente

Con Node.js 22.12 o posterior:

```bash
npm ci
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para visitar la landing. Las rutas privadas redirigen a `/login` cuando falta una sesión válida. Configura `.env.local` y usa una cuenta confirmada de Supabase Auth para entrar. Las páginas públicas y la compilación se pueden usar sin credenciales de usuario.

## Comprobaciones

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm exec -- playwright install chromium
npm run test:e2e
```

`npm run start` sirve la compilación de producción. Playwright inicia su propio servidor local.

Los recorridos públicos y las redirecciones usan Next.js en el puerto 3160. Las pruebas de componentes privados en navegador usan otro servidor local en el puerto 3162, con una entrada de Vite en `tests/browser/` y datos de `tests/fixtures/`. La entrada solo la inicia Playwright y no forma parte de las rutas de Next.js.

Las vistas privadas cargan datos del usuario autenticado. PostgreSQL aplica RLS y protege la relación entre clientes y oportunidades, incluido el borrado restringido de clientes vinculados.

## Supabase y validación

Consulta [la configuración de Supabase](docs/SUPABASE_SETUP.md), [el diseño de base de datos](docs/DATABASE.md) y [el recorrido de validación manual](docs/MANUAL_TESTING.md). El [estado del proyecto](docs/PROJECT_STATUS.md) indica qué bloques de la integración están disponibles.

## Preparación de la entrega

- **GitHub.** Revisar una revisión concreta de entrega, incluida la migración SQL, lockfile, código y documentación. Verificar que el índice y los archivos nuevos excluyen `.env.local`, `.env.testing.local` y artefactos de pruebas. Confirmar con el propietario el repositorio y la rama de entrega antes de subir cambios. [Guía oficial de GitHub](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)
- **Vercel.** Después de autorizar la publicación, importar esa revisión con el preset Next.js y una versión de Node compatible con `package.json`. Configurar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en el entorno correspondiente al proyecto. Revisar si el enlace elegido requiere autenticación de Vercel y validar HTTPS, acceso en incógnito y protección del CRM según AC-01. [Integración GitHub](https://vercel.com/docs/git/vercel-for-github), [variables](https://vercel.com/docs/environment-variables) y [protección](https://vercel.com/docs/deployment-protection).
- **Supabase y demo.** La contraseña temporal de Demo A se sustituyó y Testing aprobó la revisión de logs durante la auditoría local. Antes de la entrega, compartir el acceso vigente por el canal privado acordado y verificar los logs del despliegue autorizado. La carga permanente se ejecutó con autorización en Demo A. El procedimiento de recuperación está en la guía del seed. La migración inicial ya se aplicó mediante SQL Editor. Reconciliar el historial antes de un futuro `db push`. [Configuración de Supabase](docs/SUPABASE_SETUP.md)
