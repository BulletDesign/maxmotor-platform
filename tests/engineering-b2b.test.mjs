import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

test("engineering B2B page exposes the complete industrial workflow", async () => {
  const html = await readFile(resolve(root, "ingenieria.html"), "utf8");
  assert.match(html, /id="ingenieria-b2b"/);
  assert.match(html, /https:\/\/maxmotor4x4\.com\/ingenieria/);
  assert.match(html, /Tool<br><span>not toys\.<\/span>/);
  for (const technology of ["SolidWorks", "Dassault Systèmes", "Shining 3D", "Bodor", "Krass", "Lincoln Electric", "Gemma"]) {
    assert.match(html, new RegExp(technology));
  }
  assert.equal((html.match(/class="eng-step eng-reveal"/g) || []).length, 4);
  assert.match(html, /Toyota del Ecuador/);
  assert.match(html, /<table class="eng-table">/);
});

test("home and shared navigation expose engineering without remote brand rasters", async () => {
  const [home, shell] = await Promise.all([
    readFile(resolve(root, "index.html"), "utf8"),
    readFile(resolve(root, "assets/site-shell.js"), "utf8"),
  ]);
  assert.match(home, /href="\/ingenieria"/);
  assert.match(home, /id="ingenieria-corporativa"/);
  assert.match(shell, />Ingenieria B2B<\/a>/);
  assert.match(shell, /\/assets\/brand\/maxmotor-logo\.svg/);
  assert.doesNotMatch(shell, /logo%20maxmotor\.png/);
});

test("new brand resources are local vectors and the favicon is not empty", async () => {
  const resources = [
    "maxmotor-logo.svg",
    "maxmotor-footer.svg",
    "tools-not-toys.svg",
    "traction-points-logo.svg",
    "traction-points-wordmark.svg",
    "favicon-maxmotor.svg",
  ];
  for (const name of resources) {
    const svg = await readFile(resolve(root, "assets", "brand", name), "utf8");
    assert.match(svg, /<svg\b/);
    assert.match(svg, /<(?:path|rect|polygon|circle|ellipse)\b/, `${name} debe contener geometria visible`);
  }
});
