import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";
import { ECUADOR_PICKUPS } from "../catalog/pickups.mjs";
import { ELECTRIFIED_VEHICLES } from "../catalog/electrified-vehicles.mjs";
import { FRONT_PROTECTION_MEDIA, FRONT_PROTECTION_ROUTE } from "../catalog/front-protection.mjs";
import { MAXMOTOR_MEDIA, productMedia, vehicleMedia } from "../catalog/maxmotor-media.mjs";

const root = resolve(import.meta.dirname, "..");
const source = await readFile(resolve(root, "catalog/families.js"), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);

const site = "https://maxmotor4x4.com";
const lastmod = new Date().toISOString().slice(0, 10);
const pages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/ingenieria", changefreq: "monthly", priority: "0.9" },
  { path: "/productos/", changefreq: "weekly", priority: "0.9" },
  { path: "/tough-dog", changefreq: "weekly", priority: "0.9" },
  { path: "/maxlining", changefreq: "weekly", priority: "0.9", images: MAXMOTOR_MEDIA.filter((item) => item.family === "polyurethane").map((item) => item.src) },
  { path: "/maxlining/vehiculos", changefreq: "weekly", priority: "0.9", images: MAXMOTOR_MEDIA.filter((item) => item.family === "polyurethane").map((item) => item.src) },
  { path: "/maxlining/accesorios", changefreq: "monthly", priority: "0.8", images: [FRONT_PROTECTION_MEDIA.hero.src, ...MAXMOTOR_MEDIA.filter((item) => item.family === "polyurethane").map((item) => item.src)] },
  { path: "/maxlining/industrial", changefreq: "monthly", priority: "0.8", images: MAXMOTOR_MEDIA.filter((item) => item.file.includes("industrial")).map((item) => item.src) },
  { path: "/maxlining/comparacion", changefreq: "monthly", priority: "0.9", images: MAXMOTOR_MEDIA.filter((item) => item.family === "polyurethane").map((item) => item.src) },
  { path: "/maxlining/aplicador", changefreq: "monthly", priority: "0.7" },
  { path: "/maxlining/distribuidor", changefreq: "monthly", priority: "0.7" },
  { path: "/camionetas", changefreq: "weekly", priority: "0.9" },
  ...ECUADOR_PICKUPS.map((pickup) => ({ path: `/camionetas/${pickup.slug}`, changefreq: "monthly", priority: "0.8", images: vehicleMedia(pickup.slug).map((item) => item.src) })),
  { path: "/hibridos", changefreq: "weekly", priority: "0.9" },
  ...ELECTRIFIED_VEHICLES.map((vehicle) => ({ path: `/hibridos/${vehicle.slug}`, changefreq: "monthly", priority: "0.8" })),
  { path: "/fichas/tapas-balde-camionetas", changefreq: "weekly", priority: "0.9" },
  { path: FRONT_PROTECTION_ROUTE, changefreq: "monthly", priority: "0.9", images: Object.values(FRONT_PROTECTION_MEDIA).map((image) => image.src) },
  ...context.window.MAXMOTOR_FAMILIES.flatMap((family) => family.products).map((product) => ({
    path: `/fichas/${product.slug}`,
    changefreq: "monthly",
    priority: "0.8",
    images: productMedia(product.slug).map((item) => item.src),
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map((page) => `  <url>
    <loc>${site}${page.path}</loc>
${(page.images || []).map((image) => `    <image:image><image:loc>${image.replaceAll("&", "&amp;")}</image:loc></image:image>`).join("\n")}${page.images?.length ? "\n" : ""}
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

await writeFile(resolve(root, "sitemap.xml"), sitemap, "utf8");
console.log(`Generated sitemap.xml with ${pages.length} canonical URLs`);
