import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

test("Maxlining is a complete, transparent sales landing", async () => {
  const html = await readFile(resolve(root, "maxlining.html"), "utf8");
  assert.match(html, /https:\/\/maxmotor4x4\.com\/maxlining/);
  assert.match(html, /assets\/brand\/maxlining-white\.svg/);
  assert.match(html, /Recubrimiento de poliuretano Maxlining/);
  assert.match(html, /Baldes y flotas/);
  assert.match(html, /Accesorios 4x4/);
  assert.match(html, /Superficies operativas/);
  assert.match(html, /no operamos como franquicia LINE-X/);
  assert.match(html, /wa\.me\/593960855932/);
  assert.match(html, /<maxmotor-footer>/);
});

test("home, sitemap and shared footer expose Maxlining", async () => {
  const [home, sitemap, shell] = await Promise.all([
    readFile(resolve(root, "index.html"), "utf8"),
    readFile(resolve(root, "sitemap.xml"), "utf8"),
    readFile(resolve(root, "assets", "site-shell.js"), "utf8"),
  ]);
  assert.match(home, /id="recubrimiento-maxlining"/);
  assert.match(home, /href="\/maxlining"/);
  assert.match(shell, /href="\/maxlining"/);
  assert.match(shell, /primero-ecuador\.png/);
  assert.match(sitemap, /https:\/\/maxmotor4x4\.com\/maxlining/);
});
