import { access, readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const errors = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }));
  return files.flat();
}

for (const required of ["index.html", "MiMaxmotor.html", "portal-maxmotor.html", "console.html", "robots.txt", "sitemap.xml", "_headers"]) {
  try { await access(join(dist, required)); } catch { errors.push(`Falta ${required} en dist`); }
}

const files = await walk(dist);
for (const forbidden of ["portal.html", "portal-superadmin.html"]) {
  if (files.some((file) => file === join(dist, forbidden))) errors.push(`Ruta privada heredada publicada: ${forbidden}`);
}
const htmlFiles = files.filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`Title ausente: ${file}`);
  if (!/meta\s+name="description"\s+content="[^"]+"/s.test(html)) errors.push(`Description ausente: ${file}`);
  if (/href="(?:\.\.\/)?fichas\//.test(html)) errors.push(`Enlace relativo a ficha: ${file}`);
}

const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (urls.length !== new Set(urls).size) errors.push("El sitemap contiene URLs duplicadas");
if (urls.some((url) => !url.startsWith("https://maxmotor4x4.com/"))) errors.push("El sitemap contiene URLs fuera del dominio de produccion");
if (urls.some((url) => /\/(?:api|portal|admin|mimaxmotor|console)(?:\/|$)/i.test(new URL(url).pathname))) errors.push("El sitemap contiene rutas privadas");

const robots = await readFile(join(dist, "robots.txt"), "utf8");
if (!robots.includes("Sitemap: https://maxmotor4x4.com/sitemap.xml")) errors.push("robots.txt no referencia el sitemap de produccion");
for (const privatePath of ["/api/", "/portal", "/MiMaxmotor", "/portal-maxmotor", "/portal-superadmin", "/console"]) {
  if (!robots.includes(`Disallow: ${privatePath}`)) errors.push(`robots.txt no bloquea ${privatePath}`);
}

const home = await readFile(join(dist, "index.html"), "utf8");
if (!home.includes('href="/MiMaxmotor?tab=register"')) errors.push("Falta el CTA de registro MiMaxmotor en el index");
if (!home.includes('rel="canonical" href="https://maxmotor4x4.com/"')) errors.push("Canonical de produccion ausente en el index");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Verification passed: ${files.length} files, ${htmlFiles.length} HTML, ${urls.length} sitemap URLs`);
