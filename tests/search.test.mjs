import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const searchIndex = JSON.parse(await readFile(resolve(root, "catalog/search-index.json"), "utf8"));
const searchClient = await readFile(resolve(root, "assets/catalog-service.js"), "utf8");
const home = await readFile(resolve(root, "index.html"), "utf8");

const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const vehicleFor = (slug) => searchIndex.entries.find((entry) => entry.type === "vehicle" && entry.url === `/camionetas/${slug}`);

test("search index connects real vehicle pages and accessory fichas", () => {
  assert.equal(searchIndex.counts.vehicles, 36);
  assert.equal(searchIndex.counts.electrified, 26);
  assert.equal(searchIndex.counts.accessories, 41);
  assert.ok(searchIndex.entries.some((entry) => entry.type === "accessory" && entry.url === "/fichas/tapa-trifold"));
  assert.match(normalize(`${vehicleFor("toyota-hilux").title} ${vehicleFor("toyota-hilux").terms}`), /hilux/);
  assert.match(normalize(vehicleFor("toyota-hilux").terms), /estribos/);
  assert.match(normalize(vehicleFor("gwm-poer").terms), /tapa rigida/);
  assert.ok(searchIndex.entries.some((entry) => entry.type === "electrified" && entry.url === "/hibridos/deepal-s05"));
});

test("public search excludes commercial inventory fields", () => {
  for (const entry of searchIndex.entries) {
    assert.doesNotMatch(Object.keys(entry).join(" "), /precio|costo|stock|sku/i);
  }
  assert.doesNotMatch(searchClient, /sheetsEndpoint|buscarVehiculo/);
});

test("home search is keyboard accessible and uses the generated index", () => {
  assert.match(searchClient, /\/catalog\/search-index\.json/);
  assert.match(searchClient, /ArrowDown/);
  assert.match(searchClient, /aria-activedescendant/);
  assert.match(home, /catalog-service\.js\?v=20260820-2/);
});
