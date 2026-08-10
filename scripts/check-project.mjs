import { access, readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { ECUADOR_PICKUPS } from "../catalog/pickups.mjs";

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

for (const required of ["index.html", "ingenieria.html", "MiMaxmotor.html", "portal-maxmotor.html", "console.html", "camionetas/index.html", "catalog/inventory-compatible.json", "fichas/tapas-balde-camionetas.html", "assets/mimaxmotor-qr.svg", "assets/brand/maxmotor-logo.svg", "assets/brand/favicon-maxmotor.svg", "robots.txt", "sitemap.xml", "_headers"]) {
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
if (!urls.includes("https://maxmotor4x4.com/fichas/tapas-balde-camionetas")) errors.push("La categoria de tapas de balde no esta en el sitemap");
if (urls.includes("https://maxmotor4x4.com/fichas/tapa-balde-dmax")) errors.push("La landing D-Max duplicada sigue en el sitemap");
if (!urls.includes("https://maxmotor4x4.com/camionetas")) errors.push("El hub de camionetas no esta en el sitemap");
if (!urls.includes("https://maxmotor4x4.com/ingenieria")) errors.push("La landing de ingenieria B2B no esta en el sitemap");
for (const pickup of ECUADOR_PICKUPS) {
  const path = `camionetas/${pickup.slug}.html`;
  try { await access(join(dist, path)); } catch { errors.push(`Falta ${path} en dist`); }
  if (!urls.includes(`https://maxmotor4x4.com/camionetas/${pickup.slug}`)) errors.push(`Falta ${pickup.slug} en el sitemap`);
}

const robots = await readFile(join(dist, "robots.txt"), "utf8");
if (!robots.includes("Sitemap: https://maxmotor4x4.com/sitemap.xml")) errors.push("robots.txt no referencia el sitemap de produccion");
for (const privatePath of ["/api/", "/portal", "/MiMaxmotor", "/portal-maxmotor", "/portal-superadmin", "/console"]) {
  if (!robots.includes(`Disallow: ${privatePath}`)) errors.push(`robots.txt no bloquea ${privatePath}`);
}

const publicInventory = JSON.parse(await readFile(join(dist, "catalog/inventory-compatible.json"), "utf8"));
const fitmentTerms = /\b(DMAX|D MAX|HILUX|REVO|VIGO|POER|SINOTRUK|RANGER|F150|FRONTIER|NAVARA|NP300|L200|TRITON|BT ?50|WINGLE|JAC|T6|T8|T9|AMAROK|T60|T90|LANDTREK|TASMAN|RAM|HUNTER|COLORADO|SILVERADO)\b/i;
for (const [vehicle, items] of Object.entries(publicInventory.vehicles || {})) {
  for (const item of items) {
    if (Object.keys(item).sort().join(",") !== "category,name") errors.push(`Campos internos publicados para ${vehicle}`);
    if (fitmentTerms.test(item.name) || /\b(?:19|20)\d{2}\b|\//.test(item.name)) errors.push(`Compatibilidad interna publicada para ${vehicle}: ${item.name}`);
  }
}

const home = await readFile(join(dist, "index.html"), "utf8");
if (!home.includes('href="/assets/brand/favicon-maxmotor.svg?v=20260810-2"')) errors.push("El index no referencia la version vigente del favicon");
if (!/href="\/MiMaxmotor\?tab=register(?:&amp;offer=welcome)?"/.test(home)) errors.push("Falta el CTA de registro MiMaxmotor en el index");
if (!home.includes('rel="canonical" href="https://maxmotor4x4.com/"')) errors.push("Canonical de produccion ausente en el index");
if (home.includes('href="/fichas/tapa-balde-dmax"')) errors.push("El index conserva un enlace a la landing D-Max duplicada");
if (!home.includes('href="/camionetas"')) errors.push("Falta el enlace interno al hub de camionetas");
if (!home.includes('href="/ingenieria"')) errors.push("Falta el acceso a Ingenieria B2B desde el index");

const engineering = await readFile(join(dist, "ingenieria.html"), "utf8");
for (const marker of ["ingenieria-b2b", "SolidWorks", "Dassault Systèmes", "Shining 3D", "Bodor", "KRRASS", "Lincoln Electric", "Gema", "Toyota del Ecuador", "Tool<br><span>not toys."]) {
  if (!engineering.includes(marker)) errors.push(`Falta contenido B2B: ${marker}`);
}
if ((engineering.match(/<details class="eng-step eng-reveal"/g) || []).length !== 4) errors.push("El pipeline de ingenieria no tiene cuatro etapas desplegables");
if ((engineering.match(/youtube-nocookie\.com\/embed\//g) || []).length !== 2) errors.push("Faltan demostraciones tecnicas en Ingenieria B2B");
if (!engineering.includes('rel="canonical" href="https://maxmotor4x4.com/ingenieria"')) errors.push("Canonical ausente en Ingenieria B2B");
if (/logo%20maxmotor\.png/.test(engineering)) errors.push("Ingenieria B2B usa el logo raster remoto");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Verification passed: ${files.length} files, ${htmlFiles.length} HTML, ${urls.length} sitemap URLs`);
