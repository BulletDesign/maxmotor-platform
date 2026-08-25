import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";
import { productMedia } from "../catalog/maxmotor-media.mjs";

const root = resolve(import.meta.dirname, "..");
const source = await readFile(resolve(root, "catalog/families.js"), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);
const families = context.window.MAXMOTOR_FAMILIES;
const output = resolve(root, "fichas");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const absolute = (path) => `https://maxmotor4x4.com${path}`;

for (const family of families) {
  for (const product of family.products) {
    const canonicalPath = `/fichas/${product.slug}`;
    const pageName = product.seoName || product.name;
    const pageTitle = product.seoTitle || `${product.name} | Maxmotor 4x4 Ecuador`;
    const socialTitle = product.seoTitle || `${product.name} | Maxmotor 4x4`;
    const description = product.metaDescription || `${product.summary} Cotiza compatibilidad e instalacion con Maxmotor 4x4 en Ecuador.`;
    const related = family.products.filter((item) => item.slug !== product.slug).slice(0, 3);
    const gallery = productMedia(product.slug);
    const primaryImage = gallery[0]?.src || product.image;
    const quote = `https://wa.me/593960855932?text=${encodeURIComponent(`Hola Maxmotor 4x4, quiero cotizar ${product.name}. Mi vehiculo es:`)}`;
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${absolute(canonicalPath)}#page`,
          name: pageName,
          description: product.summary,
          url: absolute(canonicalPath),
          inLanguage: "es-EC",
          primaryImageOfPage: { "@type": "ImageObject", contentUrl: primaryImage },
          mainEntity: { "@id": `${absolute(canonicalPath)}#service` },
        },
        {
          "@type": "Service",
          "@id": `${absolute(canonicalPath)}#service`,
          name: pageName,
          serviceType: `${family.name}: venta, asesoria e instalacion`,
          description: product.summary,
          image: gallery.length ? gallery.map((item) => item.src) : primaryImage,
          url: absolute(canonicalPath),
          provider: { "@type": "AutoPartsStore", "@id": "https://maxmotor4x4.com/#store", name: "Maxmotor 4x4", url: "https://maxmotor4x4.com/", telephone: "+593960855932" },
          areaServed: { "@type": "Country", name: "Ecuador" },
          availableChannel: { "@type": "ServiceChannel", serviceUrl: absolute(canonicalPath), servicePhone: { "@type": "ContactPoint", telephone: "+593960855932", contactType: "sales" } },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: absolute("/") },
            { "@type": "ListItem", position: 2, name: "Productos", item: absolute("/productos/") },
            { "@type": "ListItem", position: 3, name: product.name, item: absolute(canonicalPath) },
          ],
        },
        ...(product.faq?.length ? [{
          "@type": "FAQPage",
          "@id": `${absolute(canonicalPath)}#faq`,
          mainEntity: product.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }] : []),
      ],
    };
    const html = `<!doctype html>
<html lang="es-EC">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="../">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${absolute(canonicalPath)}">
  <link rel="alternate" hreflang="es-EC" href="${absolute(canonicalPath)}">
  <link rel="icon" href="/assets/brand/favicon-maxmotor-v2.svg" type="image/svg+xml">
  <link rel="alternate icon" href="/assets/favicon-maxmotor.png" type="image/png">
  <link rel="apple-touch-icon" href="/assets/favicon-maxmotor.png">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_EC">
  <meta property="og:site_name" content="Maxmotor 4x4">
  <meta property="og:title" content="${escapeHtml(socialTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${absolute(canonicalPath)}">
  <meta property="og:image" content="${primaryImage}">
  <meta name="twitter:card" content="summary_large_image">
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=Montserrat:wght@400;600;800&family=Teko:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/shared-shell.css?v=20260810-4">
  <link rel="stylesheet" href="assets/product-detail.css?v=20260820-1">
  <link rel="stylesheet" href="assets/type-system.css?v=20260805-2">
  <script src="assets/site-shell.js?v=20260820-3"></script>
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  <maxmotor-header compact></maxmotor-header>
  <main class="detail-shell">
    <section class="product-hero" data-word="${escapeHtml(family.code)}">
      <div class="product-hero__copy">
        <nav class="detail-crumbs" aria-label="Migas de pan"><a href="/">Inicio</a> / <a href="/productos/">Productos</a> / ${escapeHtml(product.name)}</nav>
        <span class="eyebrow">${escapeHtml(family.code)} / ${escapeHtml(family.name)}</span>
        <h1>${escapeHtml(pageName)}</h1>
        <p class="lead">${escapeHtml(product.summary)}</p>
        <a class="hero-cta" href="${quote}" target="_blank" rel="noopener">Cotizar para mi vehiculo <span>+</span></a>
      </div>
      <div class="product-hero__media">
        <img src="${primaryImage}" alt="${escapeHtml(gallery[0]?.alt || `${product.name} para camionetas y 4x4`)}" width="1200" height="900">
        <small class="photo-credit">${escapeHtml(gallery[0]?.credit || product.photoCredit || "Imagen referencial. Confirma la aplicacion exacta con un asesor Maxmotor.")}</small>
        <div class="media-label"><span>${escapeHtml(family.name)}</span><strong>TOOLS NOT TOYS</strong></div>
      </div>
    </section>
    <section class="product-body">
      <div class="section-head"><div><span class="eyebrow">01 / Ventajas</span><h2>Hecho para uso real.</h2></div><p>La aplicacion se selecciona segun marca, modelo, ano y uso del vehiculo. Antes de cotizar confirmamos medidas, anclajes y disponibilidad.</p></div>
      <div class="feature-grid">${product.features.map((feature, index) => `<article class="feature-card"><b>${String(index + 1).padStart(2, "0")}</b><h3>${escapeHtml(feature)}</h3><p>${escapeHtml(product.featureDetails?.[index] || "Configuracion revisada por el equipo tecnico de Maxmotor antes de instalar.")}</p></article>`).join("")}</div>${gallery.length ? `
      <section class="project-gallery" aria-labelledby="gallery-title"><div class="section-head"><div><span class="eyebrow">02 / Proyectos reales</span><h2 id="gallery-title">Instalado por Maxmotor.</h2></div><p>Referencias visuales de trabajos reales. La forma y aplicación final cambian según vehículo, año y versión.</p></div><div class="project-gallery__grid">${gallery.map((item, index) => `<figure${index === 0 ? ` class="project-gallery__lead"` : ""}><img src="${item.src}" alt="${escapeHtml(item.alt)}" width="1200" height="900" loading="${index === 0 ? "eager" : "lazy"}" decoding="async"><figcaption><strong>${escapeHtml(item.title)}</strong><span>Proyecto real Maxmotor 4x4</span></figcaption></figure>`).join("")}</div></section>` : ""}
      <div class="technical-band"><div class="technical-title"><span class="eyebrow">02 / Aplicacion</span><h2>La pieza correcta.</h2><p>Una misma camioneta puede cambiar por generacion, cabina y mercado. La especificacion final se valida antes de la compra.</p></div><div class="spec-list"><div class="spec-row"><span>Familia</span><strong>${escapeHtml(family.name)}</strong></div><div class="spec-row"><span>Compatibilidad</span><strong>Marca, modelo, ano y version</strong></div><div class="spec-row"><span>Instalacion</span><strong>Ambato y Quito</strong></div><div class="spec-row"><span>Disponibilidad</span><strong>Confirmacion con ventas y bodega</strong></div></div></div>
      <section class="quote-panel" id="cotizar"><div><span class="eyebrow">03 / Cotizacion</span><h2>Equipa tu proyecto.</h2></div><div><p>Envia marca, modelo, ano y version para recibir una recomendacion correcta.</p><a class="quote-button" href="${quote}" target="_blank" rel="noopener">Cotizar por WhatsApp <span>&nearr;</span></a></div></section>${product.faq?.length ? `
      <section class="product-faq" id="preguntas"><div class="section-head"><div><span class="eyebrow">04 / Preguntas frecuentes</span><h2>Antes de equipar.</h2></div><p>Respuestas directas para escoger el toldo adecuado y confirmar su aplicacion.</p></div><div class="product-faq__list">${product.faq.map((item) => `<details><summary>${escapeHtml(item.question)}<span>+</span></summary><p>${escapeHtml(item.answer)}</p></details>`).join("")}</div></section>` : ""}
    </section>
${related.length ? `    <section class="related"><span class="eyebrow">Mas de ${escapeHtml(family.name)}</span><h2>Continua tu 4x4.</h2><div class="related-grid">${related.map((item) => `<a class="related-card" href="${item.landing || `/fichas/${item.slug}`}"><img src="${productMedia(item.slug)[0]?.src || item.image}" alt="${escapeHtml(item.name)}" width="560" height="360" loading="lazy"><span><strong>${escapeHtml(item.name)}</strong><small>Ver ficha &nearr;</small></span></a>`).join("")}</div></section>` : ""}
  </main>
  <maxmotor-footer></maxmotor-footer>
</body>
</html>`;
    await writeFile(resolve(output, `${product.slug}.html`), html, "utf8");
  }
}

await cp(resolve(root, "seo-pages/tapas-balde-camionetas.html"), resolve(output, "tapas-balde-camionetas.html"));

console.log(`Generated accessory pages for ${families.flatMap((family) => family.products).length} catalog products plus 1 SEO landing`);
