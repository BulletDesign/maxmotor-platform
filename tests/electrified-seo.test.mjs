import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ELECTRIFIED_VEHICLES } from "../catalog/electrified-vehicles.mjs";
import { ECUADOR_PICKUPS } from "../catalog/pickups.mjs";

const root = resolve(import.meta.dirname, "..");

test("electrified catalog covers priority brands with visual pages", async () => {
  assert.equal(ELECTRIFIED_VEHICLES.length, 26);
  for (const brand of ["Deepal", "Geely", "Suzuki", "Changan", "BYD"]) {
    assert.ok(ELECTRIFIED_VEHICLES.some((vehicle) => vehicle.brand === brand));
  }
  for (const slug of ["deepal-s05", "geely-ex5", "suzuki-grand-vitara-hybrid", "changan-cs55-r-ev", "byd-shark"]) {
    const html = await readFile(resolve(root, "hibridos", `${slug}.html`), "utf8");
    assert.match(html, new RegExp(`rel="canonical" href="https://maxmotor4x4.com/hibridos/${slug}"`));
    assert.match(html, /Aplicación no invasiva/);
    assert.match(html, /No son adaptaciones improvisadas/);
    assert.match(html, /wa\.me\/593960855932/);
    assert.ok((html.match(/<img /g) || []).length >= 7);
    assert.match(html, /"@type":"Vehicle"/);
    assert.doesNotMatch(html, /"@type":"Product"/);
  }
});

test("directories expose electrified routes and Sinotruk Bolden", async () => {
  const hub = await readFile(resolve(root, "hibridos", "index.html"), "utf8");
  const pickupHub = await readFile(resolve(root, "camionetas", "index.html"), "utf8");
  const home = await readFile(resolve(root, "index.html"), "utf8");
  assert.match(hub, /Híbridos[.]<br>Eléctricos[.]/);
  assert.ok((hub.match(/<img /g) || []).length >= ELECTRIFIED_VEHICLES.length + 1);
  assert.match(pickupHub, /href="\/hibridos"/);
  assert.match(home, /href="\/hibridos"/);
  assert.ok(ECUADOR_PICKUPS.some((pickup) => pickup.slug === "sinotruk-bolden"));
});
