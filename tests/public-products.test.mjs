import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const home = await readFile(resolve(root, "index.html"), "utf8");
const toughDog = await readFile(resolve(root, "tough-dog.html"), "utf8");
const generator = await readFile(resolve(root, "scripts/generate-featured-products.mjs"), "utf8");
const middleware = await readFile(resolve(root, "functions/_middleware.js"), "utf8");

test("home exposes a semantic quote-based catalog without fake product offers", () => {
  assert.match(home, /"hasOfferCatalog"/);
  assert.match(home, /"@type":"Service"/);
  assert.doesNotMatch(home, /"@type":"Product"/);
  assert.match(home, /href="\/tough-dog"/);
});

test("featured catalog covers the six requested commercial services", () => {
  for (const slug of ["tapa-quadfold", "tapa-enrollable", "tapa-electrica", "rollbar-zr", "tiro-estandar", "tough-dog"]) {
    assert.match(generator, new RegExp(`"${slug}"`));
  }
  assert.doesNotMatch(generator, /price|precio|stock|sku/i);
});

test("Tough Dog has one canonical landing and redirects its legacy ficha", () => {
  assert.match(toughDog, /rel="canonical" href="https:\/\/maxmotor4x4\.com\/tough-dog"/);
  assert.match(toughDog, /Distribución Ecuador/i);
  assert.match(toughDog, /Nitro Gas/);
  assert.match(toughDog, /Foam Cell/);
  assert.doesNotMatch(toughDog, /"@type":"Product"/);
  assert.match(middleware, /\/fichas\/tough-dog/);
  assert.match(middleware, /url\.pathname = "\/tough-dog"/);
  assert.match(middleware, /\["\/mxr", "\/mxr\.html"\]/);
  assert.doesNotMatch(home, /href="mxr\.html"/);
});
