import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";
import { ECUADOR_PICKUPS } from "../catalog/pickups.mjs";

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
  { path: "/maxlining", changefreq: "weekly", priority: "0.9" },
  { path: "/maxlining/vehiculos", changefreq: "weekly", priority: "0.9" },
  { path: "/maxlining/accesorios", changefreq: "monthly", priority: "0.8" },
  { path: "/maxlining/industrial", changefreq: "monthly", priority: "0.8" },
  { path: "/maxlining/comparacion", changefreq: "monthly", priority: "0.9" },
  { path: "/maxlining/aplicador", changefreq: "monthly", priority: "0.7" },
  { path: "/maxlining/distribuidor", changefreq: "monthly", priority: "0.7" },
  { path: "/camionetas", changefreq: "weekly", priority: "0.9" },
  ...ECUADOR_PICKUPS.map((pickup) => ({ path: `/camionetas/${pickup.slug}`, changefreq: "monthly", priority: "0.8" })),
  { path: "/fichas/tapas-balde-camionetas", changefreq: "weekly", priority: "0.9" },
  ...context.window.MAXMOTOR_FAMILIES.flatMap((family) => family.products).map((product) => ({
    path: `/fichas/${product.slug}`,
    changefreq: "monthly",
    priority: "0.8",
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>
    <loc>${site}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

await writeFile(resolve(root, "sitemap.xml"), sitemap, "utf8");
console.log(`Generated sitemap.xml with ${pages.length} canonical URLs`);
