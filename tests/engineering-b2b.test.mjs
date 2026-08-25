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
  assert.equal((html.match(/<details class="eng-tech-card"/g) || []).length, 7);
  assert.doesNotMatch(html, /Ingeniería con<br>un propósito/);
  assert.match(html, /<strong>Cómo\.<\/strong>/);
  assert.match(html, /<strong>Para qué\.<\/strong>/);
  assert.match(html, /<strong>Por qué\.<\/strong>/);
  assert.equal((html.match(/<details class="eng-brand-case(?:\s[^\"]*)?"/g) || []).length, 4);
  assert.match(html, /más de 600 unidades/);
  assert.match(html, /<table class="eng-table">/);
});

test("home and shared navigation expose engineering without remote brand rasters", async () => {
  const [home, shell] = await Promise.all([
    readFile(resolve(root, "index.html"), "utf8"),
    readFile(resolve(root, "assets/site-shell.js"), "utf8"),
  ]);
  assert.match(home, /href="\/ingenieria"/);
  assert.match(home, /href="\/maxlining"/);
  assert.match(home, /id="ingenieria-corporativa"/);
  assert.match(home, /Producto homologado por/i);
  assert.match(home, /assets\/partners\/oem\/toyota\.svg/);
  assert.ok(home.indexOf('id="main-catalog"') < home.indexOf('id="mimaxmotor-title"'));
  assert.match(home, /class="intro-logo" src="\/assets\/brand\/maxmotor-logo\.svg"/);
  assert.match(shell, />Ingeniería B2B<\/a>/);
  assert.match(shell, />Maxlining<\/a>/);
  assert.match(shell, /primero-ecuador\.png/);
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

test("shared shell prevents intrinsic media widths from breaking mobile layouts", async () => {
  const [shell, styles] = await Promise.all([
    readFile(resolve(root, "assets", "site-shell.js"), "utf8"),
    readFile(resolve(root, "assets", "shared-shell.css"), "utf8"),
  ]);
  assert.doesNotMatch(shell, /class="logo"[^>]+width="2022"/);
  assert.match(shell, /class="logo"[^>]+max-width:42vw/);
  assert.match(styles, /html,body\{width:100%;max-width:100%;overflow-x:clip\}/);
  assert.match(styles, /img,svg,video,canvas,iframe\{max-width:100%\}/);
  assert.match(styles, /\.shared-site-header \.logo\{display:block;width:250px;max-width:100%/);
});
