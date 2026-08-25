import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolve } from "node:path";
import { MAXMOTOR_MEDIA, productMedia, vehicleMedia } from "../catalog/maxmotor-media.mjs";

const root = resolve(import.meta.dirname, "..");

test("R2 media manifest contains the 55 unique approved assets", () => {
  assert.equal(MAXMOTOR_MEDIA.length, 55);
  assert.equal(new Set(MAXMOTOR_MEDIA.map((item) => item.file)).size, 55);
  assert.ok(MAXMOTOR_MEDIA.every((item) => item.src.startsWith("https://media.maxmotor4x4.com/repoimg/bucket_accesorios_autos/")));
});

test("all approved media is assigned to an indexable page", async () => {
  const sitemap = await readFile(resolve(root, "sitemap.xml"), "utf8");
  for (const item of MAXMOTOR_MEDIA) assert.match(sitemap, new RegExp(item.src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replaceAll("&", "&amp;")));
});

test("vehicle galleries never mix named vehicle projects", async () => {
  const poer = await readFile(resolve(root, "camionetas/gwm-poer.html"), "utf8");
  const hilux = await readFile(resolve(root, "camionetas/toyota-hilux.html"), "utf8");
  assert.ok(vehicleMedia("gwm-poer").length > 0);
  assert.ok(vehicleMedia("toyota-hilux").length > 0);
  assert.doesNotMatch(poer, /toyota_hilux|mazda_bt50/i);
  assert.doesNotMatch(hilux, /delantero_poer|mazda_bt50/i);
});

test("product pages expose real media in social and structured data", async () => {
  const hitch = await readFile(resolve(root, "fichas/tiro-estandar.html"), "utf8");
  const image = productMedia("tiro-estandar")[0].src;
  assert.match(hitch, new RegExp(image.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(hitch, /Proyectos reales/);
  assert.match(hitch, /application\/ld\+json/);
});

test("generated media galleries use versioned card layouts and commercial links", async () => {
  const [vehicle, product] = await Promise.all([
    readFile(resolve(root, "camionetas/gwm-poer.html"), "utf8"),
    readFile(resolve(root, "fichas/tiro-estandar.html"), "utf8"),
  ]);
  assert.match(vehicle, /seo-product\.css\?v=20260825-2/);
  assert.match(vehicle, /class="vehicle-project-card"/);
  assert.match(vehicle, /href="\/fichas\/bumpers-bullbars-guardachoques"/);
  assert.match(product, /product-detail\.css\?v=20260825-2/);
  assert.match(product, /class="project-gallery__card"/);
  assert.match(product, /Consultar este producto/);
});

test("product galleries remain curated instead of dumping the full media bucket", () => {
  assert.ok(productMedia("bullbar-overland").length <= 6);
  assert.ok(productMedia("bullbar-raptor").length <= 6);
});
