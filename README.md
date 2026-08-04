# Maxmotor 4x4

Sitio publico, catalogo y backend inicial del ecosistema Maxmotor.

## Desarrollo

Requiere Node.js 22 o superior.

```powershell
npm ci
npm run verify
npm run db:migrate:local
npm run dev
```

El frontend se genera en `dist/`. Las Pages Functions bajo `functions/` usan el
binding D1 `DB`.

## Publicacion

La rama `main` es produccion. Cloudflare Pages debe ejecutar `npm run build` y
publicar `dist`. Antes de integrar cambios se exige `npm run verify`.

No se deben versionar `.dev.vars`, `.env`, `dist/`, `.wrangler/` ni archivos ZIP.
Las migraciones D1 se versionan y se aplican antes de activar endpoints nuevos.
