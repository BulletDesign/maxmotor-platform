import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

async function source(relativePath) {
  return readFile(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}

test("Chevrolet D-Max vehicle page consolidates commercial and local content", async () => {
  const html = await source("../camionetas/chevrolet-dmax.html");
  assert.match(html, /rel="canonical" href="https:\/\/maxmotor4x4\.com\/camionetas\/chevrolet-dmax"/);
  assert.match(html, /<h1>Accesorios<br>para D-Max\.<\/h1>/);
  assert.match(html, /id="catalogo-compatible"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /"@type":"Vehicle"/);
  assert.match(html, /Ambato/);
  assert.match(html, /Quito/);
  assert.doesNotMatch(html, /noindex/i);
});

test("tapa de balde category covers commercial models and links to the D-Max vehicle page", async () => {
  const html = await source("../seo-pages/tapas-balde-camionetas.html");
  assert.match(html, /<title>Tapas de Balde para Camionetas \| Maxmotor Ecuador<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/maxmotor4x4\.com\/fichas\/tapas-balde-camionetas"/);
  assert.match(html, /"@type": "CollectionPage"/);
  assert.match(html, /"@type": "ItemList"/);
  assert.match(html, /"@type": "FAQPage"/);
  assert.match(html, /href="\/camionetas\/chevrolet-dmax"/);
  assert.match(html, /href="\/fichas\/tapas-balde-camionetas#tipos"/);
  assert.doesNotMatch(html, /href="#[^"]+"/);
  assert.doesNotMatch(html, /\/fichas\/tapa-balde-dmax/);
  assert.doesNotMatch(html, /noindex/i);
});

test("duplicate D-Max landing is removed and permanently redirected", async () => {
  const [home, shell, sitemap, middleware] = await Promise.all([
    source("../index.html"),
    source("../assets/site-shell.js"),
    source("../scripts/generate-sitemap.mjs"),
    source("../functions/_middleware.js"),
  ]);
  assert.doesNotMatch(home, /href="\/fichas\/tapa-balde-dmax"/);
  assert.doesNotMatch(shell, /tapa-balde-dmax\.html/);
  assert.match(shell, /tapas-balde-camionetas\.html/);
  assert.match(sitemap, /\/fichas\/tapas-balde-camionetas/);
  assert.doesNotMatch(sitemap, /\/fichas\/tapa-balde-dmax/);
  assert.match(middleware, /"\/fichas\/tapa-balde-dmax"/);
  assert.match(middleware, /url\.pathname = "\/camionetas\/chevrolet-dmax"/);
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
