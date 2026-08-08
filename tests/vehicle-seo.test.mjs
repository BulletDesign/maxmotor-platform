import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { ECUADOR_PICKUPS, pickupName } from "../catalog/pickups.mjs";

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
  for (const pickup of ECUADOR_PICKUPS) {
    assert.match(generator, new RegExp(`/camionetas/\\$\\{pickup\\.slug\\}`));
    assert.ok(pickupName(pickup).length > 4);
  }
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
