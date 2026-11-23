# ClientFlow

Mini CRM para organizar clientes, oportunidades y ventas. La Fase 2 incluye la web pública, la pantalla de acceso y las interfaces preparadas para la integración de Supabase.

## Ejecutar localmente

Con Node.js 22.12 o posterior:

```bash
npm ci
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para visitar la landing. La segunda ruta pública es `/login`. Las rutas privadas requieren autenticación y redirigen a `/login` mientras la integración esté pendiente. La aplicación no requiere credenciales para compilar o mostrar las páginas públicas.

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

Las vistas privadas reciben sus datos y mutaciones mediante contratos separados. La autenticación real, las políticas por usuario, la persistencia y la comprobación en PostgreSQL del borrado de clientes vinculados se integrarán en la Fase 3.
