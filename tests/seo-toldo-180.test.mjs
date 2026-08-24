import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

test("toldo 180 has a focused indexable landing without fake commerce data", async () => {
  const html = await readFile(resolve(root, "fichas/toldo-180.html"), "utf8");
  assert.match(html, /<title>Toldo 180 para Camionetas y 4x4 en Ecuador \| Maxmotor<\/title>/);
  assert.match(html, /<h1>Toldo lateral 180 grados para camionetas y 4x4<\/h1>/);
  assert.match(html, /rel="canonical" href="https:\/\/maxmotor4x4\.com\/fichas\/toldo-180"/);
  assert.match(html, /"@type":"Service"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.doesNotMatch(html, /"@type":"Product"|"price"|"availability"/);
});

test("toldo 180 is discoverable from public navigation and search", async () => {
  const [home, products, shell, sitemap, search] = await Promise.all([
    readFile(resolve(root, "index.html"), "utf8"),
    readFile(resolve(root, "productos/index.html"), "utf8"),
    readFile(resolve(root, "assets/site-shell.js"), "utf8"),
    readFile(resolve(root, "sitemap.xml"), "utf8"),
    readFile(resolve(root, "catalog/search-index.json"), "utf8").then(JSON.parse),
  ]);
  assert.match(home, /href="\/fichas\/toldo-180"/);
  assert.match(products, /href="\/fichas\/toldo-180"/);
  assert.match(shell, /href="\/fichas\/toldo-180"/);
  assert.match(sitemap, /https:\/\/maxmotor4x4\.com\/fichas\/toldo-180/);
  const entry = search.entries.find((item) => item.url === "/fichas/toldo-180");
  assert.ok(entry);
  assert.match(entry.terms.toLowerCase(), /toldo para camioneta/);
  assert.match(entry.terms.toLowerCase(), /awning 180/);
});
