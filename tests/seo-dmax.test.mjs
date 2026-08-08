import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

async function source(relativePath) {
  return readFile(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}

test("D-Max landing provides crawlable commercial and local content", async () => {
  const html = await source("../seo-pages/tapa-balde-dmax.html");
  assert.match(html, /<title>Tapa de Balde D-Max en Ecuador \| Maxmotor 4x4<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/maxmotor4x4\.com\/fichas\/tapa-balde-dmax"/);
  assert.match(html, /<h1>Tapa de<br>balde para<br>D-Max\.<\/h1>/);
  assert.match(html, /"@type": "Product"/);
  assert.match(html, /"@type": "FAQPage"/);
  assert.match(html, /"@type": "AutoPartsStore"/);
  assert.match(html, /Ambato/);
  assert.match(html, /Quito/);
  assert.doesNotMatch(html, /noindex/i);
});

test("tapa de balde category covers commercial models and links to D-Max", async () => {
  const html = await source("../seo-pages/tapas-balde-camionetas.html");
  assert.match(html, /<title>Tapas de Balde para Camionetas \| Maxmotor Ecuador<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/maxmotor4x4\.com\/fichas\/tapas-balde-camionetas"/);
  assert.match(html, /"@type": "CollectionPage"/);
  assert.match(html, /"@type": "ItemList"/);
  assert.match(html, /"@type": "FAQPage"/);
  assert.match(html, /href="\/fichas\/tapa-balde-dmax"/);
  assert.doesNotMatch(html, /noindex/i);
});

test("home, footer and sitemap generator link to the D-Max landing", async () => {
  const [home, shell, sitemap] = await Promise.all([
    source("../index.html"),
    source("../assets/site-shell.js"),
    source("../scripts/generate-sitemap.mjs"),
  ]);
  assert.match(home, /href="\/fichas\/tapa-balde-dmax"/);
  assert.match(home, /Tapas de balde D-Max/);
  assert.match(shell, /tapa-balde-dmax\.html/);
  assert.match(shell, /tapas-balde-camionetas\.html/);
  assert.match(sitemap, /\/fichas\/tapas-balde-camionetas/);
  assert.match(sitemap, /\/fichas\/tapa-balde-dmax/);
});

test("MiMaxmotor QR is local and available in public and employee interfaces", async () => {
  const [qr, home, portal] = await Promise.all([
    source("../assets/mimaxmotor-qr.svg"),
    source("../index.html"),
    source("../portal-admin.html"),
  ]);
  assert.match(qr, /<svg/);
  assert.match(home, /src="\/assets\/mimaxmotor-qr\.svg"/);
  assert.match(portal, /class="client-qr-card"/);
  assert.match(portal, /href="\/MiMaxmotor"/);
});
