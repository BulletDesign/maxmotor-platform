# Backend Maxmotor en Cloudflare

## Arquitectura

- Cloudflare Pages aloja el frontend generado en `dist/`.
- Pages Functions expone las rutas de autenticacion, puntos y administracion.
- Cloudflare D1 almacena usuarios, vehiculos, facturas, garantias y el libro mayor de puntos.
- Las contrasenas se derivan con PBKDF2-SHA256 y los tokens de sesion se guardan como hashes.
- Los movimientos de puntos son inmutables; los ajustes se registran como nuevos movimientos.

## Preparacion local

```powershell
npm install
npm run build
npm run db:migrate:local
npm run dev
```

El servidor local queda disponible en `http://localhost:8788`.

## Bases D1

```powershell
npx wrangler login
npx wrangler d1 create maxmotor-dev
npx wrangler d1 create maxmotor-prod
```

`wrangler.dev.jsonc` apunta a desarrollo y `wrangler.jsonc` apunta a produccion.
Aplicar primero las migraciones de desarrollo:

```powershell
npm run db:migrate:dev
```

Produccion se migra solamente despues de validar el release con `npm run verify`:

```powershell
npm run db:migrate:prod
```

## Despliegue por GitHub

En Cloudflare Pages conectar el repositorio y configurar:

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

Agregar el binding D1 `DB` al proyecto de Pages, enlazado a `maxmotor-prod`.

## Primer superadministrador

Registrar la cuenta desde `/api/auth/register` y promoverla una sola vez desde D1:

```sql
UPDATE users
SET role = 'superadmin', updated_at = CURRENT_TIMESTAMP
WHERE email = 'CORREO_ADMINISTRADOR';
```

No existe una ruta publica para elevar roles. Las siguientes promociones deben
realizarse desde una interfaz administrativa autenticada y auditada.

## Endpoints iniciales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/points/summary`
- `POST /api/admin/points/award` para empleados y superadministradores
