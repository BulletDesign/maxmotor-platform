import { mkdir, writeFile } from "node:fs/promises";
import { categories, products, site } from "../catalog/products.mjs";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

function head({ title, description, canonical, assetPrefix = "" }) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/logo_16x16.png" type="image/png">
  <link rel="apple-touch-icon" href="https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/maxmotor_icon_sin_fondo.png">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <link rel="stylesheet" href="${assetPrefix}assets/shared-shell.css">
  <link rel="stylesheet" href="${assetPrefix}assets/product-showcase.css">
  <script src="${assetPrefix}assets/site-shell.js?v=20260804-3"></script>
</head>`;
}

function structuredData(product) {
  const lowPrice = Math.min(...product.variants.map((variant) => variant.price));
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    image: product.images,
    brand: { "@type": "Brand", name: "MXR" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice,
      highPrice: Math.max(...product.variants.map((variant) => variant.price)),
      offerCount: product.variants.length,
      availability: "https://schema.org/InStock",
      url: `${site.url}/productos/${product.slug}.html`,
    },
  });
}

function productPage(product) {
  const category = categories[product.category];
  const canonical = `${site.url}/productos/${product.slug}.html`;
  const description = `${product.name} para ${product.vehicle}. Conoce acabados, precio referencial y cotiza instalacion con Maxmotor 4x4 Ecuador.`;
  const thumbs = product.images.map((image, index) => `
          <button class="thumb" type="button" data-gallery-thumb data-src="${image}" data-alt="${escapeHtml(product.name)} - vista ${index + 1}" aria-current="${index === 0}">
            <img src="${image}" alt="" loading="lazy">
          </button>`).join("");
  const variants = product.variants.map((item) => `<option value="${escapeHtml(item.name)}" data-price="${item.price}">${escapeHtml(item.name)} - ${money(item.price)}</option>`).join("");
  return `${head({ title: `${product.name} | Maxmotor 4x4 Ecuador`, description, canonical, assetPrefix: "../" })}
<body>
  <maxmotor-header compact></maxmotor-header>
  <main class="shell product-hero">
    <nav class="breadcrumbs" aria-label="Migas de pan"><a href="../index.html">Inicio</a> / <a href="../vitrina.html">Productos</a> / ${escapeHtml(product.name)}</nav>
    <div class="product-layout">
      <section class="gallery" aria-label="Galeria de ${escapeHtml(product.name)}">
        <img class="gallery-main" data-gallery-main src="${product.images[0]}" alt="${escapeHtml(product.name)} instalado en ${escapeHtml(product.vehicle)}">
        <div class="thumbs">${thumbs}</div>
      </section>
      <section class="product-panel">
        <span class="eyebrow">${escapeHtml(category.eyebrow)} / ${escapeHtml(product.vehicle)}</span>
        <h1>${escapeHtml(product.name)}</h1>
        <p class="summary">${escapeHtml(product.summary)}</p>
        <ul class="specs">${product.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>
        <div class="field"><label for="variant">Acabado</label><select id="variant" data-variant>${variants}</select></div>
        <div class="field"><label for="vehicle">Tu vehiculo</label><input id="vehicle" data-vehicle type="text" placeholder="Marca, modelo y ano"></div>
        <div class="price" data-price-output>${money(product.variants[0].price)}</div>
        <div class="price-note">Precio referencial. Confirma compatibilidad e instalacion.</div>
        <a class="quote-button" data-quote data-product="${escapeHtml(product.name)}" data-phone="${site.whatsapp}" href="#">Cotizar por WhatsApp <span>↗</span></a>
      </section>
    </div>
    <p class="notice">La compatibilidad, capacidad y especificaciones finales se confirman con el equipo tecnico segun el vehiculo y su uso.</p>
  </main>
  <maxmotor-footer></maxmotor-footer>
  <script type="application/ld+json">${structuredData(product)}</script>
  <script src="../assets/product-showcase.js"></script>
</body>
</html>`;
}

function showcase() {
  const sections = Object.entries(categories).map(([categoryId, category], categoryIndex) => {
    const cards = products.filter((product) => product.category === categoryId).map((product, index) => `
        <a class="product-card" href="productos/${product.slug}.html">
          <div class="card-media"><span class="card-index">${String(categoryIndex + 1).padStart(2, "0")}.${String(index + 1).padStart(2, "0")}</span><img src="${product.images[0]}" alt="${escapeHtml(product.name)} para ${escapeHtml(product.vehicle)}" loading="lazy"></div>
          <div class="card-body"><span class="eyebrow">${escapeHtml(product.vehicle)}</span><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.summary)}</p><div class="card-bottom"><span>Desde ${money(Math.min(...product.variants.map((variant) => variant.price)))}</span><span>Ver ficha ↗</span></div></div>
        </a>`).join("");
    return `<section class="catalog-section" id="${categoryId}"><div class="section-head"><div><span class="eyebrow">${escapeHtml(category.eyebrow)}</span><h2>${escapeHtml(category.name)}</h2></div><p>${escapeHtml(category.description)}</p></div><div class="product-grid">${cards}</div></section>`;
  }).join("");
  const canonical = `${site.url}/vitrina`;
  return `${head({ title: "Accesorios MXR para Camionetas | Maxmotor 4x4", description: "Explora rollbars, bullbars, barras de tiro y protecciones MXR para camionetas. Revisa acabados y cotiza tu proyecto 4x4 en Ecuador.", canonical })}
<body>
  <maxmotor-header compact></maxmotor-header>
  <main class="shell">
    <section class="hero"><span class="eyebrow">Ingenieria ecuatoriana / Serie MXR</span><h1>Equipo para salir del mapa.</h1><p class="hero-copy">Proteccion, carga y presencia para camionetas construidas con un proposito. Explora cada pieza, elige el acabado y lleva una cotizacion lista a nuestro equipo.</p><div class="telemetry"><div><strong>${products.length}</strong><span>Fichas activas</span></div><div><strong>Ambato</strong><span>Fabricacion e instalacion</span></div><div><strong>Quito</strong><span>Atencion comercial</span></div></div></section>
    ${sections}
  </main>
  <maxmotor-footer></maxmotor-footer>
</body>
</html>`;
}

await mkdir(new URL("../productos/", import.meta.url), { recursive: true });
await Promise.all(products.map((product) => writeFile(new URL(`../productos/${product.slug}.html`, import.meta.url), productPage(product), "utf8")));
await writeFile(new URL("../vitrina.html", import.meta.url), showcase(), "utf8");
console.log(`Generated ${products.length} product pages and vitrina.html`);
