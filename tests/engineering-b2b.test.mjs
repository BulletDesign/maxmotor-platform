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
  for (const technology of ["SolidWorks", "Dassault Systèmes", "Shining 3D", "Bodor", "KRRASS", "Lincoln Electric", "Gema"]) {
    assert.match(html, new RegExp(technology));
  }
  assert.equal((html.match(/<details class="eng-step eng-reveal"/g) || []).length, 4);
  assert.equal((html.match(/youtube-nocookie\.com\/embed\//g) || []).length, 2);
  assert.match(html, /assets\/partners\/technology\/solidworks\.svg/);
  assert.match(html, /assets\/partners\/technology\/gema\.svg/);
  assert.match(html, /Toyota del Ecuador/);
  assert.match(html, /01 \/ ¿QUÉ\?/);
  assert.match(html, /02 \/ ¿CÓMO\?/);
  assert.match(html, /03 \/ ¿PARA QUÉ\?/);
  assert.match(html, /04 \/ ¿POR QUÉ\?/);
  assert.equal((html.match(/<details class="eng-brand-case"/g) || []).length, 4);
  assert.match(html, /Más de 600 vehículos equipados/);
  assert.match(html, /<table class="eng-table">/);
});

test("home and shared navigation expose engineering without remote brand rasters", async () => {
  const [home, shell] = await Promise.all([
    readFile(resolve(root, "index.html"), "utf8"),
    readFile(resolve(root, "assets/site-shell.js"), "utf8"),
  ]);
  assert.match(home, /href="\/ingenieria"/);
  assert.match(home, /id="ingenieria-corporativa"/);
  assert.match(home, /Producto homologado por/i);
  assert.match(home, /assets\/partners\/oem\/toyota\.svg/);
  assert.ok(home.indexOf('id="main-catalog"') < home.indexOf('id="mimaxmotor-title"'));
  assert.match(home, /class="intro-logo" src="\/assets\/brand\/maxmotor-logo\.svg"/);
  assert.match(shell, />Ingenieria B2B<\/a>/);
  assert.match(shell, /\/assets\/brand\/maxmotor-logo\.svg/);
  assert.match(shell, /class="shared-footer__art"/);
  assert.match(shell, /\/assets\/brand\/maxmotor-footer\.svg/);
  assert.doesNotMatch(shell, /logo%20maxmotor\.png/);
});

test("new brand resources are local vectors and the favicon is not empty", async () => {
  const resources = [
    "maxmotor-logo.svg",
    "maxmotor-footer.svg",
    "tools-not-toys.svg",
    "traction-points-logo.svg",
    "traction-points-wordmark.svg",
    "favicon-maxmotor-v2.svg",
  ];
  for (const name of resources) {
    const svg = await readFile(resolve(root, "assets", "brand", name), "utf8");
    assert.match(svg, /<svg\b/);
    assert.match(svg, /<(?:path|rect|polygon|circle|ellipse)\b/, `${name} debe contener geometria visible`);
  }
  const favicon = await readFile(resolve(root, "assets", "brand", "favicon-maxmotor-v2.svg"), "utf8");
  assert.match(favicon, /viewBox="0 0 1253\.96 1253\.96"/, "el favicon debe conservar una relacion cuadrada para buscadores");
});
