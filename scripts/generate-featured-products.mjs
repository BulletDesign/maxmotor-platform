import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const source = await readFile(resolve(root, "catalog/families.js"), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);

const selectedSlugs = ["toldo-180", "tapa-quadfold", "tapa-enrollable", "tapa-electrica", "rollbar-zr", "tiro-estandar", "tough-dog"];
const products = context.window.MAXMOTOR_FAMILIES.flatMap((family) => family.products.map((product) => ({ ...product, family: family.name })))
  .filter((product) => selectedSlugs.includes(product.slug))
  .sort((a, b) => selectedSlugs.indexOf(a.slug) - selectedSlugs.indexOf(b.slug));
const output = resolve(root, "productos");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const canonicalFor = (product) => `https://maxmotor4x4.com${product.landing || `/fichas/${product.slug}`}`;
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "CollectionPage", "@id": "https://maxmotor4x4.com/productos/#page", name: "Productos destacados Maxmotor 4x4", description: "Tapas de balde, rollbars, barras de tiro y suspension Tough Dog con asesoria e instalacion en Ecuador.", url: "https://maxmotor4x4.com/productos/", inLanguage: "es-EC" },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Inicio", item: "https://maxmotor4x4.com/" }, { "@type": "ListItem", position: 2, name: "Productos", item: "https://maxmotor4x4.com/productos/" }] },
    { "@type": "ItemList", name: "Productos destacados Maxmotor 4x4", numberOfItems: products.length, itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name, url: canonicalFor(product), image: product.image })) },
    { "@type": "OfferCatalog", name: "Catalogo de equipamiento Maxmotor 4x4", itemListElement: products.map((product) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: product.name, description: product.summary, image: product.image, url: canonicalFor(product), provider: { "@id": "https://maxmotor4x4.com/#store" }, areaServed: "EC" } })) },
  ],
};
const cards = products.map((product, index) => {
  const href = product.landing || `/fichas/${product.slug}`;
  const quote = `https://wa.me/593960855932?text=${encodeURIComponent(`Hola Maxmotor 4x4, quiero cotizar ${product.name}. Mi vehiculo es:`)}`;
  return `<article class="product-index-card"><a class="product-index-card__media" href="${href}"><img src="${product.image}" alt="${escapeHtml(product.name)} en Maxmotor 4x4" width="720" height="520" loading="${index < 2 ? "eager" : "lazy"}" referrerpolicy="no-referrer"><span>${String(index + 1).padStart(2, "0")}</span></a><div><small>${escapeHtml(product.family)}</small><h2><a href="${href}">${escapeHtml(product.name)}</a></h2><p>${escapeHtml(product.summary)}</p><nav><a href="${href}">Ver ficha <b>→</b></a><a href="${quote}" target="_blank" rel="noopener">Cotizar <b>↗</b></a></nav></div></article>`;
}).join("");

const html = `<!doctype html>
<html lang="es-EC">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Productos 4x4 Destacados | Maxmotor Ecuador</title>
  <meta name="description" content="Tapas de balde, Rollbar ZR, barras de tiro y suspension Tough Dog para camionetas. Asesoria e instalacion Maxmotor en Ecuador.">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="https://maxmotor4x4.com/productos/">
  <link rel="icon" href="/assets/brand/favicon-maxmotor-v2.svg" type="image/svg+xml"><link rel="alternate icon" href="/assets/favicon-maxmotor.png" type="image/png"><link rel="apple-touch-icon" href="/assets/favicon-maxmotor.png">
  <meta property="og:type" content="website"><meta property="og:locale" content="es_EC"><meta property="og:site_name" content="Maxmotor 4x4"><meta property="og:title" content="Productos 4x4 destacados | Maxmotor"><meta property="og:description" content="Equipamiento para camionetas con asesoria e instalacion en Ecuador."><meta property="og:url" content="https://maxmotor4x4.com/productos/"><meta property="og:image" content="${products[0].image}">
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=Montserrat:wght@400;600;800&family=Teko:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/shared-shell.css?v=20260825-1"><link rel="stylesheet" href="/assets/type-system.css?v=20260805-2"><link rel="stylesheet" href="/assets/products-hub.css?v=20260820-1"><script src="/assets/site-shell.js?v=20260825-1"></script>
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body><maxmotor-header compact></maxmotor-header><main class="product-index"><header class="product-index-hero"><nav aria-label="Migas de pan"><a href="/">Inicio</a><span>/</span>Productos</nav><p>CATALOGO ESENCIAL / ECUADOR</p><h1>Equipo que<br><em>si trabaja.</em></h1><div><p>Siete soluciones de alta demanda para proteger, cargar y controlar tu camioneta. La aplicacion se confirma por modelo, ano y uso.</p><a href="#catalogo">Ver productos <b>↓</b></a></div></header><section id="catalogo" class="product-index-grid" aria-label="Productos destacados">${cards}</section><aside class="product-index-close"><span>NO COMPRES A CIEGAS</span><h2>Primero la camioneta.<br>Despues la pieza.</h2><a href="/camionetas">Buscar por vehiculo <b>→</b></a></aside></main><maxmotor-footer></maxmotor-footer></body></html>`;
await writeFile(resolve(output, "index.html"), html, "utf8");
console.log(`Generated featured product hub with ${products.length} indexable services`);
