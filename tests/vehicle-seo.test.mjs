import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { ECUADOR_PICKUPS, pickupName } from "../catalog/pickups.mjs";
import { classifyInventoryItem, matchInventoryToVehicles, parseInventoryNames, publicInventoryName } from "../scripts/inventory-compatibility.mjs";

async function source(relativePath) {
  return readFile(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}

test("pickup catalog covers the principal Ecuador market without duplicate routes", () => {
  assert.ok(ECUADOR_PICKUPS.length >= 30);
  assert.equal(new Set(ECUADOR_PICKUPS.map((pickup) => pickup.slug)).size, ECUADOR_PICKUPS.length);
  for (const pickup of ECUADOR_PICKUPS) {
    assert.match(pickup.slug, /^[a-z0-9-]+$/);
    assert.ok(pickup.brand && pickup.model && pickup.profile && pickup.focus);
  }
});

test("vehicle generator creates canonical, structured and useful model pages", async () => {
  const generator = await source("../scripts/generate-vehicle-pages.mjs");
  assert.match(generator, /"@type": "Vehicle"/);
  assert.match(generator, /"@type": "FAQPage"/);
  assert.match(generator, /Validamos compatibilidad/);
  assert.match(generator, /año, cabina y versión/);
  assert.match(generator, /class="vehicle-card-media"/);
  assert.match(generator, /class="vehicle-card-cta"/);
  assert.match(generator, /class="vehicle-sales-banner"/);
  assert.match(generator, /class="vehicle-inventory"/);
  assert.match(generator, /class="inventory-compatible-card"/);
  assert.match(generator, /01 \/ HOT SELLERS/);
  assert.match(generator, /const accessoryAnchor = inventoryItems\.length \? "#catalogo-compatible" : "#accesorios"/);
  assert.match(generator, /href="#modelos"/);
  assert.match(generator, /class="vehicle-hub-statement"/);
  assert.doesNotMatch(generator, /class="vehicle-hub-gallery"/);
  assert.doesNotMatch(generator, /<base href="\.\.\/">/);
  assert.match(generator, /Referencias de catálogo/);
  assert.match(generator, /loading="lazy"/);
  for (const pickup of ECUADOR_PICKUPS) {
    assert.match(generator, new RegExp(`/camionetas/\\$\\{pickup\\.slug\\}`));
    assert.ok(pickupName(pickup).length > 4);
  }
});

test("inventory import reads product names without leaking commercial columns", async () => {
  const csv = `codigo,nomart,cantot,costot\nA1,BARRA LED 6" DMAX,8,99.95\nA2,"TAPA DE BALDE HILUX, REVO",2,450.00\n`;
  const names = parseInventoryNames(csv);
  assert.deepEqual(names, ['BARRA LED 6" DMAX', "TAPA DE BALDE HILUX, REVO"]);

  const catalogSource = await source("../catalog/inventory-compatible.json");
  const catalog = JSON.parse(catalogSource);
  assert.deepEqual(Object.keys(catalog), ["vehicles"]);
  assert.doesNotMatch(catalogSource, /costot|cantot|codiva|precio|stock/i);
  for (const items of Object.values(catalog.vehicles)) {
    for (const item of items) {
      assert.deepEqual(Object.keys(item).sort(), ["category", "name"]);
      assert.doesNotMatch(item.name, /\b(DMAX|D MAX|HILUX|REVO|VIGO|POER|SINOTRUK|RANGER|F150|FRONTIER|NAVARA|NP300|L200|TRITON|BT ?50|WINGLE|JAC|T6|T8|T9|AMAROK|T60|T90|LANDTREK|TASMAN|RAM|HUNTER|COLORADO|SILVERADO)\b/i);
      assert.doesNotMatch(item.name, /\b(?:19|20)\d{2}\b|\//);
    }
  }
});

test("public inventory names remove cross-fitment details and use the right family", () => {
  const cover = "TAPA DE BALDE PLEGABLE MAXMOTOR PARA HILUX REVO 4X4 16/25 DE 4 PARTES DE ALUMINIO SINOTRUK/POER/JAC";
  assert.equal(classifyInventoryItem(cover), "covers");
  assert.equal(publicInventoryName(cover), "Tapa rígida plegable de 4 partes Maxmotor");
  assert.equal(classifyInventoryItem("AMORTIGUADOR EMBOLO PARA COMPUERTA DE CAMIONETA TOYOTA REVO"), "bedAccessories");
  assert.equal(classifyInventoryItem("SWITCH LIGHTFORCE TOYOTA HILUX"), "electrical");
  assert.equal(classifyInventoryItem("CROMADOS DE FAROS POSTERIORES DMAX"), "exterior");
  assert.equal(classifyInventoryItem("BISEL DE TACOMETRO TOYOTA VIGO CROMADO"), "interior");
  assert.equal(publicInventoryName("BARRA PORTA FAROS JAC T6 2FAROS"), "Barra portafaros");
  assert.equal(classifyInventoryItem("FILTRO DE AIRE K&N MITSUBISHI L200"), "performance");
});

test("inventory matching requires an explicit vehicle reference", () => {
  const matches = matchInventoryToVehicles([
    "TAPA DE BALDE PLEGABLE PARA DMAX Y COLORADO",
    "TAPA DE BALDE ISUZU DMAX",
    "BARRA PORTA FAROS JAC T6",
    "BARRA LED UNIVERSAL RAPTOR",
    "TAPA DE BALDE SIN MODELO",
  ]);
  assert.equal(matches["chevrolet-dmax"].length, 1);
  assert.equal(matches["isuzu-dmax"].length, 1);
  assert.equal(matches["chevrolet-colorado"].length, 1);
  assert.equal(matches["jac-t6"].length, 1);
  assert.equal(matches["ford-f150"].length, 0);
  assert.equal(Object.values(matches).flat().some((item) => item.name.includes("SIN MODELO")), false);
});

test("raw inventory stays outside Git and the Cloudflare package", async () => {
  const [gitignore, build] = await Promise.all([
    source("../.gitignore"),
    source("../scripts/build-static.mjs"),
  ]);
  assert.match(gitignore, /^CSV_MAXMOTOR\.csv$/m);
  assert.doesNotMatch(build, /CSV_MAXMOTOR/);
});

test("generated vehicle pages expose every sanitized match and nothing else", async () => {
  const catalog = JSON.parse(await source("../catalog/inventory-compatible.json"));
  let pagesWithMatches = 0;
  let publishedItems = 0;

  for (const pickup of ECUADOR_PICKUPS) {
    const html = await source(`../camionetas/${pickup.slug}.html`);
    const expected = catalog.vehicles[pickup.slug] || [];
    const cards = html.match(/class="inventory-compatible-card"/g) || [];
    assert.equal(cards.length, expected.length, pickup.slug);
    assert.equal(html.includes('id="catalogo-compatible"'), expected.length > 0, pickup.slug);
    assert.match(html, new RegExp(`href="#${expected.length ? "catalogo-compatible" : "accesorios"}"`));
    assert.doesNotMatch(html, /<base href="\.\.\/">/);
    assert.match(html, /01 \/ HOT SELLERS/);
    assert.doesNotMatch(html, /costot|cantot|codiva/i);
    if (expected.length) pagesWithMatches += 1;
    publishedItems += cards.length;
  }

  assert.equal(pagesWithMatches, 18);
  assert.equal(publishedItems, 198);
});

test("vehicle hub lists names without vehicle photography", async () => {
  const html = await source("../camionetas/index.html");
  assert.match(html, /class="vehicle-hub-statement"/);
  assert.match(html, /href="#modelos"/);
  assert.doesNotMatch(html, /<base href="\.\.\/">/);
  assert.doesNotMatch(html, /class="vehicle-hub-gallery"/);
  assert.doesNotMatch(html, /<section class="vehicle-brand"[^]*?<img/);
});

test("build, home, footer and sitemap expose the vehicle architecture", async () => {
  const [build, home, shell, sitemap] = await Promise.all([
    source("../scripts/build-static.mjs"),
    source("../index.html"),
    source("../assets/site-shell.js"),
    source("../scripts/generate-sitemap.mjs"),
  ]);
  assert.match(build, /generate-vehicle-pages\.mjs/);
  assert.match(build, /"camionetas"/);
  assert.match(home, /href="\/camionetas"/);
  assert.match(shell, /camionetas\//);
  assert.match(sitemap, /\/camionetas\/\$\{pickup\.slug\}/);
});
