import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { FRONT_PROTECTION_MEDIA, FRONT_PROTECTION_ROUTE } from "../catalog/front-protection.mjs";

const root = resolve(import.meta.dirname, "..");

test("front protection has one authoritative visual landing", async () => {
  const html = await readFile(resolve(root, `.${FRONT_PROTECTION_ROUTE}.html`), "utf8");
  assert.match(html, /<title>Bumpers, Bullbars y Guardachoques 4x4/);
  assert.match(html, /id="bumpers-metalicos"/);
  assert.match(html, /id="bullbars-metalicos"/);
  assert.match(html, /id="guardachoques-4x4"/);
  assert.match(html, /primaryImageOfPage/);
  assert.match(html, /"@type":"Service"/);
  assert.doesNotMatch(html, /"@type":"Product"/);
  assert.equal((html.match(/<img /g) || []).length, 5);
  for (const image of Object.values(FRONT_PROTECTION_MEDIA)) assert.match(html, new RegExp(image.src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("front protection is connected to search, home and sitemap", async () => {
  const home = await readFile(resolve(root, "index.html"), "utf8");
  const search = await readFile(resolve(root, "catalog/search-index.json"), "utf8");
  const sitemap = await readFile(resolve(root, "sitemap.xml"), "utf8");
  assert.match(home, /href="\/fichas\/bumpers-bullbars-guardachoques"/);
  assert.match(search, /bumpers-bullbars-guardachoques/);
  assert.match(sitemap, /xmlns:image=/);
  assert.match(sitemap, /<image:image>/);
});
