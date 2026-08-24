import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ECUADOR_PICKUPS, pickupName } from "../catalog/pickups.mjs";
import { INVENTORY_CATEGORIES } from "./inventory-compatibility.mjs";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "camionetas");
const inventoryCatalog = JSON.parse(await readFile(resolve(root, "catalog", "inventory-compatible.json"), "utf8"));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const products = {
  cover: { name: "Tapas de balde", href: "/fichas/tapas-balde-camionetas", image: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_tapa_trifold.jpeg", copy: "Rígidas, plegables, enrollables, eléctricas o de lona según año, cabina y medidas." },
  liner: { name: "Recubrimiento de poliuretano", href: "/#main-catalog", image: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_seguro.jpeg", copy: "Protección aplicada en caliente para trabajo, carga diaria y uso severo." },
  suspension: { name: "Suspensión Tough Dog", href: "/tough-dog", image: "https://www.toughdog.com.au/site/DefaultSite/skins/toughdog_2019/images/products-intro-shock-absorbers.jpg", copy: "Distribución para Ecuador y configuración según carga, altura y tipo de conducción." },
  hitch: { name: "Barras de tiro", href: "/fichas/tiro-hd", image: "https://images.pexels.com/photos/33566025/pexels-photo-33566025.jpeg?auto=compress&cs=tinysrgb&w=1200", copy: "Fabricación y montaje para remolque o portacarga, con aplicación validada." },
  bullbar: { name: "Bullbars y guardachoques", href: "/fichas/bullbar-overland", image: "https://images.pexels.com/photos/5628354/pexels-photo-5628354.jpeg?auto=compress&cs=tinysrgb&w=1200", copy: "Protección frontal, rescate e integración de iluminación según proyecto." },
  rollbar: { name: "Rollbars MXR", href: "/fichas/rollbar-rr1", image: "https://images.pexels.com/photos/13644357/pexels-photo-13644357.jpeg?auto=compress&cs=tinysrgb&w=1200", copy: "Fabricación nacional con acabados y configuración para cada camioneta." },
  rack: { name: "Bed racks y carga", href: "/fichas/bed-rack", image: "https://images.pexels.com/photos/28639111/pexels-photo-28639111.jpeg?auto=compress&cs=tinysrgb&w=1200", copy: "Estructuras y sistemas para organizar herramientas o equipo overland." },
  steps: { name: "Estribos y rock sliders", href: "/fichas/estribos-rock", image: "https://images.pexels.com/photos/12138568/pexels-photo-12138568.jpeg?auto=compress&cs=tinysrgb&w=1200", copy: "Acceso lateral y protección adaptados al uso del vehículo." },
  lights: { name: "Iluminación auxiliar", href: "/fichas/luces-led", image: "https://images.pexels.com/photos/7127593/pexels-photo-7127593.jpeg?auto=compress&cs=tinysrgb&w=1200", copy: "Barras LED, faros y neblineros con instalación eléctrica profesional." },
};

const heroMedia = {
  work: { src: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_tapa_trifold.jpeg", position: "center", credit: "Protección de balde Maxmotor" },
  mixed: { src: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/banner2.png", position: "center", credit: "Equipamiento de balde Maxmotor" },
  adventure: { src: "https://images.pexels.com/photos/5628354/pexels-photo-5628354.jpeg?auto=compress&cs=tinysrgb&w=1800", position: "center", credit: "Foto contextual: Erik Mclean / Pexels" },
  premium: { src: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/banner3.png", position: "center", credit: "Accesorios premium Maxmotor" },
  fullsize: { src: "https://images.pexels.com/photos/28639327/pexels-photo-28639327.jpeg?auto=compress&cs=tinysrgb&w=1800", position: "center", credit: "Foto contextual: Stephen Leonardi / Pexels" },
  compact: { src: "https://images.pexels.com/photos/35331201/pexels-photo-35331201.jpeg?auto=compress&cs=tinysrgb&w=1800", position: "center", credit: "Foto contextual: Iridescentlenz / Pexels" },
};

const focusProducts = {
  work: ["cover", "liner", "hitch", "suspension", "rack", "rollbar"],
  mixed: ["cover", "liner", "hitch", "suspension", "steps", "lights"],
  adventure: ["suspension", "bullbar", "rack", "cover", "lights", "steps"],
  premium: ["cover", "suspension", "steps", "hitch", "lights", "rollbar"],
  fullsize: ["cover", "hitch", "suspension", "liner", "bullbar", "rack"],
  compact: ["cover", "liner", "hitch", "rack", "steps", "lights"],
};

const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const absolute = (path) => `https://maxmotor4x4.com${path}`;

function inventorySectionFor(pickup, items) {
  if (!items.length) return "";
  const name = pickupName(pickup);
  const groups = Map.groupBy(items, (item) => item.category);
  let productIndex = 0;
  const groupMarkup = [...groups].map(([category, productsInCategory]) => {
    const meta = INVENTORY_CATEGORIES[category] || INVENTORY_CATEGORIES.specific;
    const productMarkup = productsInCategory.map((item) => {
      productIndex += 1;
      const id = `compatible-${productIndex}`;
      const itemWhatsapp = `https://wa.me/593960855932?text=${encodeURIComponent(`Hola Maxmotor 4x4, vi ${item.name} en el catálogo para ${name}. Quiero confirmar disponibilidad y compatibilidad para año / cabina / versión:`)}`;
      return `<article class="inventory-compatible-card" id="${id}"><p>${escapeHtml(meta.label)}</p><h3>${escapeHtml(item.name)}</h3><span>Nombre comercial. Confirmamos aplicación exacta antes de cotizar.</span><a href="${itemWhatsapp}" target="_blank" rel="noopener">Consultar este accesorio <b>↗</b></a></article>`;
    }).join("\n");
    return `<details class="inventory-category"><summary><img src="${meta.image}" alt="${escapeHtml(meta.label)} para camionetas" width="190" height="110" loading="lazy" decoding="async"><span><small>${escapeHtml(meta.copy)}</small><strong>${escapeHtml(meta.label)}</strong><b>${productsInCategory.length} ${productsInCategory.length === 1 ? "opción" : "opciones"}</b></span><i aria-hidden="true">+</i></summary><div class="inventory-compatible-grid">${productMarkup}</div></details>`;
  }).join("\n");
  const whatsapp = `https://wa.me/593960855932?text=${encodeURIComponent(`Hola Maxmotor 4x4, quiero revisar los ${items.length} accesorios registrados para ${name}. Año / cabina / versión:`)}`;

  return `<section class="vehicle-inventory" id="catalogo-compatible" aria-labelledby="inventory-title"><div class="vehicle-inventory__intro"><div><p class="dmax-kicker">02 / CATÁLOGO COMPATIBLE</p><h2 id="inventory-title">${items.length} accesorios.<br>Una ${escapeHtml(pickup.model)}.</h2></div><div><p>Estas son las líneas comerciales disponibles para ${escapeHtml(name)}. Publicamos únicamente el nombre del producto y su familia; nunca datos internos del inventario.</p><a class="dmax-button" href="${whatsapp}" target="_blank" rel="noopener">Revisar con un asesor <b>↗</b></a></div></div><p class="vehicle-inventory__notice"><strong>Importante:</strong> año, generación, cabina, medidas y disponibilidad se validan de forma privada antes de confirmar la compra.</p><div class="inventory-category-list">${groupMarkup}</div></section>`;
}

function pageFor(pickup) {
  const name = pickupName(pickup);
  const inventoryItems = inventoryCatalog.vehicles[pickup.slug] || [];
  const selected = focusProducts[pickup.focus].map((key) => products[key]);
  const hero = heroMedia[pickup.focus];
  const searchTitle = `Tapas de Balde y Accesorios ${name} | Maxmotor`;
  const title = searchTitle.length <= 60 ? searchTitle : `Tapas y Accesorios ${name.replace("Mitsubishi ", "")} | Maxmotor`;
  const description = `Equipa tu ${name} con tapas de balde, suspensión, barras de tiro, protección y accesorios 4x4. Validamos compatibilidad e instalamos en Ecuador.`;
  const whatsapp = `https://wa.me/593960855932?text=${encodeURIComponent(`Hola Maxmotor 4x4, quiero equipar mi ${name}. Año / cabina / versión:`)}`;
  const accessoryAnchor = inventoryItems.length ? "#catalogo-compatible" : "#accesorios";
  const itemList = selected.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name, url: absolute(product.href) }));
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${absolute(`/camionetas/${pickup.slug}`)}#page`, name: title, description, url: absolute(`/camionetas/${pickup.slug}`), inLanguage: "es-EC", about: { "@type": "Vehicle", name, alternateName: pickup.aliases } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: absolute("/") },
        { "@type": "ListItem", position: 2, name: "Camionetas", item: absolute("/camionetas") },
        { "@type": "ListItem", position: 3, name, item: absolute(`/camionetas/${pickup.slug}`) },
      ] },
      { "@type": "ItemList", name: `Accesorios recomendados para ${name}`, itemListElement: itemList },
      ...(inventoryItems.length ? [{ "@type": "ItemList", name: `Referencias de catálogo para ${name}`, numberOfItems: inventoryItems.length, itemListElement: inventoryItems.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: `${absolute(`/camionetas/${pickup.slug}`)}#compatible-${index + 1}` })) }] : []),
      { "@type": "FAQPage", mainEntity: [
        { "@type": "Question", name: `¿Qué accesorios tienen para ${name}?`, acceptedAnswer: { "@type": "Answer", text: `Maxmotor trabaja soluciones de protección, carga, suspensión, remolque e iluminación para ${name}. La oferta final depende del año, cabina, versión y disponibilidad.` } },
        { "@type": "Question", name: `¿Cómo sé si una tapa de balde sirve para mi ${pickup.model}?`, acceptedAnswer: { "@type": "Answer", text: "Se verifican año, generación, tipo de cabina, medidas del balde y elementos instalados antes de confirmar compatibilidad." } },
        { "@type": "Question", name: `¿Dónde instalan accesorios para ${name}?`, acceptedAnswer: { "@type": "Answer", text: "Maxmotor realiza instalación profesional en Ambato y Quito y coordina envíos a otras ciudades del Ecuador según el producto." } },
      ] },
    ],
  };
  const cards = selected.map((product, index) => {
    const productWhatsapp = `https://wa.me/593960855932?text=${encodeURIComponent(`Hola Maxmotor 4x4, quiero cotizar ${product.name} para mi ${name}. Año / cabina / versión:`)}`;
    return `<article><a class="vehicle-card-media" href="${product.href}" aria-label="Ver ${escapeHtml(product.name)}"><img src="${product.image}" alt="${escapeHtml(product.name)} para camionetas 4x4" width="560" height="360" loading="lazy" decoding="async"></a><div class="vehicle-card-copy"><span>${String(index + 1).padStart(2, "0")}</span><h3><a href="${product.href}">${escapeHtml(product.name)}</a></h3><p>${escapeHtml(product.copy)}</p><a class="vehicle-card-cta" href="${productWhatsapp}" target="_blank" rel="noopener">Cotizar para ${escapeHtml(pickup.model)} <b>↗</b></a></div></article>`;
  }).join("\n");
  const inventorySection = inventorySectionFor(pickup, inventoryItems);
  const aliasText = pickup.aliases.length ? `También buscan este modelo como ${pickup.aliases.join(", ")}.` : `Confirmamos la aplicación exacta con el año, la cabina y la versión de tu camioneta.`;
  return `<!doctype html>
<html lang="es-EC">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${absolute(`/camionetas/${pickup.slug}`)}">
  <link rel="alternate" hreflang="es-EC" href="${absolute(`/camionetas/${pickup.slug}`)}">
  <link rel="icon" href="/assets/brand/favicon-maxmotor-v2.svg" type="image/svg+xml">
  <link rel="alternate icon" href="/assets/favicon-maxmotor.png" type="image/png">
  <link rel="apple-touch-icon" href="/assets/favicon-maxmotor.png">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_EC">
  <meta property="og:site_name" content="Maxmotor 4x4">
  <meta property="og:title" content="Accesorios para ${escapeHtml(name)} en Ecuador">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${absolute(`/camionetas/${pickup.slug}`)}">
  <meta property="og:image" content="${hero.src}">
  <meta name="twitter:card" content="summary_large_image">
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=Montserrat:wght@400;600;800&family=Teko:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/shared-shell.css?v=20260810-4">
  <link rel="stylesheet" href="/assets/type-system.css?v=20260805-2">
  <link rel="stylesheet" href="/assets/seo-product.css?v=20260810-8">
  <script src="/assets/site-shell.js?v=20260810-4"></script>
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  <maxmotor-header compact></maxmotor-header>
  <main class="dmax-page vehicle-page">
    <section class="dmax-hero vehicle-hero">
      <div class="dmax-hero__copy">
        <nav class="dmax-crumbs" aria-label="Migas de pan"><a href="/">Inicio</a><span>/</span><a href="/camionetas">Camionetas</a><span>/</span>${escapeHtml(name)}</nav>
        <p class="dmax-kicker">${escapeHtml(pickup.brand)} / EQUIPAMIENTO 4X4</p>
        <h1>Accesorios<br>para ${escapeHtml(pickup.model)}.</h1>
        <p class="dmax-lead">${escapeHtml(pickup.profile)} Maxmotor selecciona, fabrica e instala accesorios de alta durabilidad para uso real.</p>
        <div class="dmax-actions"><a class="dmax-button" href="${whatsapp}" target="_blank" rel="noopener">Equipar mi ${escapeHtml(pickup.model)} <b>↗</b></a><a class="dmax-text-link" href="${accessoryAnchor}">${inventoryItems.length ? `Ver ${inventoryItems.length} compatibles` : "Ver accesorios"} ↓</a></div>
      </div>
      <figure class="dmax-hero__media"><img src="${hero.src}" alt="Equipamiento premium para camionetas 4x4" width="890" height="933" style="object-position:${hero.position}"><figcaption>${escapeHtml(hero.credit)}. Imagen referencial; la aplicación se confirma para ${escapeHtml(name)} según año, cabina y versión.</figcaption></figure>
    </section>
    <section class="dmax-options" id="accesorios" aria-labelledby="accessory-title">
      <div class="dmax-section-title"><p class="dmax-kicker">01 / HOT SELLERS</p><h2 id="accessory-title">Herramientas.<br>No juguetes.</h2><p>${escapeHtml(aliasText)} No publicamos compatibilidades genéricas: primero entendemos el uso y después confirmamos el componente.</p></div>
      <div class="dmax-option-grid vehicle-accessory-grid">${cards}</div>
    </section>
    <aside class="vehicle-maxlining"><div><p class="dmax-kicker">MAXLINING / RECUBRIMIENTO DE POLIURETANO</p><h2>El balde de tu ${escapeHtml(pickup.model)} también trabaja.</h2><p>Protección aplicada para carga, fricción y humedad. Una alternativa profesional al protector plástico, la brea y el batepiedra, con evaluación previa del estado real del balde.</p><div><a class="dmax-button" href="/maxlining/vehiculos">Conocer Maxlining <b>→</b></a><a href="/maxlining/comparacion">Comparar soluciones ↓</a></div></div><img src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1500&q=82" alt="Recubrimiento de balde disponible para ${escapeHtml(name)}" width="1500" height="1000" loading="lazy" decoding="async"></aside>
${inventorySection ? `    ${inventorySection}\n` : ""}    <aside class="vehicle-sales-banner"><img src="https://images.pexels.com/photos/7326681/pexels-photo-7326681.jpeg?auto=compress&cs=tinysrgb&w=1800" alt="Experiencia overland con una camioneta 4x4" width="1600" height="900" loading="lazy" decoding="async"><div><p class="dmax-kicker">PROYECTO COMPLETO / UN SOLO EQUIPO</p><h2>De trabajo.<br>A inolvidable.</h2><p>No compres piezas sueltas sin una estrategia. Un asesor puede organizar protección, carga, suspensión e iluminación como un solo proyecto.</p><a class="dmax-button" href="${whatsapp}" target="_blank" rel="noopener">Diseñar mi proyecto <b>↗</b></a></div></aside>
    <section class="dmax-fit">
      <div><p class="dmax-kicker">${inventoryItems.length ? "03" : "02"} / COMPATIBILIDAD</p><h2>Tu versión.<br>La pieza correcta.</h2><p>Una misma ${escapeHtml(pickup.model)} puede cambiar entre generaciones, tipos de cabina y mercados. Envíanos año, cabina, versión y una fotografía para validar antes de instalar.</p></div>
      <div class="vehicle-checklist"><p><b>01</b><span>Marca y modelo</span><strong>${escapeHtml(name)}</strong></p><p><b>02</b><span>Datos necesarios</span><strong>Año, cabina y versión</strong></p><p><b>03</b><span>Instalación</span><strong>Ambato y Quito</strong></p><a class="dmax-button" href="${whatsapp}" target="_blank" rel="noopener">Validar por WhatsApp <b>↗</b></a></div>
    </section>
    <section class="dmax-faq"><div><p class="dmax-kicker">${inventoryItems.length ? "04" : "03"} / RESPUESTAS</p><h2>Antes de equipar.</h2></div><div><details><summary>¿Qué accesorios hay para ${escapeHtml(name)}?</summary><p>${inventoryItems.length ? `El catálogo registra ${inventoryItems.length} referencias que mencionan este modelo, además de nuestras soluciones fabricadas o configuradas a medida.` : "Trabajamos tapas de balde, poliuretano, suspensión, barras de tiro, bullbars, rollbars, sistemas de carga, estribos e iluminación."} La disponibilidad depende de la aplicación.</p></details><details><summary>¿Puedo aplicar recubrimiento de poliuretano al balde?</summary><p>Sí, Maxlining está disponible para el balde de ${escapeHtml(name)} después de revisar su estado, pintura y reparaciones previas. <a href="/maxlining/vehiculos">Conoce el proceso de recubrimiento de balde.</a></p></details><details><summary>¿La compatibilidad es igual para todos los años?</summary><p>No. El balde, chasis, puntos de anclaje y carrocería pueden cambiar. Por eso verificamos año, cabina y versión antes de cotizar.</p></details><details><summary>¿Pueden fabricar accesorios a medida?</summary><p>La línea MXR incluye soluciones fabricadas en Ecuador. Un asesor técnico confirma qué productos pueden desarrollarse o adaptarse de forma segura.</p></details></div></section>
    <section class="dmax-final"><p class="dmax-kicker">MAXMOTOR 4X4 / ECUADOR</p><h2>TOOLS<br>NOT TOYS.</h2><a class="dmax-button" href="${whatsapp}" target="_blank" rel="noopener">Cotizar para ${escapeHtml(pickup.model)} <b>↗</b></a></section>
  </main>
  <maxmotor-footer></maxmotor-footer>
</body>
</html>`;
}

const grouped = Map.groupBy(ECUADOR_PICKUPS, (pickup) => pickup.brand);
const brandSections = [...grouped].map(([brand, pickups]) => `<section class="vehicle-brand"><h2>${escapeHtml(brand)}</h2><div>${pickups.map((pickup) => `<a href="/camionetas/${pickup.slug}"><span>${escapeHtml(pickup.model)}</span><small>Accesorios, tapas y equipamiento ↗</small></a>`).join("")}</div></section>`).join("\n");
const hubSchema = { "@context": "https://schema.org", "@graph": [
  { "@type": "CollectionPage", name: "Accesorios para camionetas en Ecuador", url: absolute("/camionetas"), description: "Guías de accesorios y equipamiento 4x4 por marca y modelo de pickup en Ecuador." },
  { "@type": "ItemList", numberOfItems: ECUADOR_PICKUPS.length, itemListElement: ECUADOR_PICKUPS.map((pickup, index) => ({ "@type": "ListItem", position: index + 1, name: pickupName(pickup), url: absolute(`/camionetas/${pickup.slug}`) })) },
] };
const hub = `<!doctype html>
<html lang="es-EC"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Accesorios para Camionetas en Ecuador | Maxmotor 4x4</title><meta name="description" content="Encuentra tapas de balde, suspensión, barras de tiro, bullbars, rollbars y equipamiento para las principales camionetas de Ecuador."><meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="https://maxmotor4x4.com/camionetas"><link rel="alternate" hreflang="es-EC" href="https://maxmotor4x4.com/camionetas"><link rel="icon" href="/assets/brand/favicon-maxmotor-v2.svg" type="image/svg+xml"><link rel="alternate icon" href="/assets/favicon-maxmotor.png" type="image/png"><link rel="apple-touch-icon" href="/assets/favicon-maxmotor.png"><meta property="og:type" content="website"><meta property="og:locale" content="es_EC"><meta property="og:site_name" content="Maxmotor 4x4"><meta property="og:title" content="Accesorios para camionetas en Ecuador"><meta property="og:description" content="Busca tu pickup y descubre opciones de protección, carga, suspensión y aventura."><meta property="og:url" content="https://maxmotor4x4.com/camionetas"><meta property="og:image" content="https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_tapa_trifold.jpeg"><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=Montserrat:wght@400;600;800&family=Teko:wght@500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/shared-shell.css?v=20260810-4"><link rel="stylesheet" href="/assets/type-system.css?v=20260805-2"><link rel="stylesheet" href="/assets/seo-product.css?v=20260810-8"><script src="/assets/site-shell.js?v=20260810-4"></script><script type="application/ld+json">${JSON.stringify(hubSchema)}</script></head>
<body><maxmotor-header compact></maxmotor-header><main class="dmax-page vehicle-hub"><section class="vehicle-hub-hero"><div class="vehicle-hub-copy"><p class="dmax-kicker">CAMIONETAS / ECUADOR</p><h1>Encuentra<br>tu 4x4.</h1><p>Tapas de balde, suspensiones, barras de tiro, bullbars, recubrimiento de poliuretano y equipamiento de alta durabilidad para pickups nuevas y de amplio parque circulante.</p><div class="vehicle-hub-actions"><a class="dmax-button" href="#modelos">Buscar mi camioneta <b>↓</b></a><a href="/hibridos">¿Tienes un híbrido o eléctrico? Ver modelos ↗</a></div></div><div class="vehicle-hub-statement" aria-label="Directorio de camionetas Maxmotor"><span>${ECUADOR_PICKUPS.length}</span><strong>MODELOS</strong><small>TOOLS NOT TOYS.</small></div></section><section class="vehicle-directory" id="modelos"><div class="dmax-section-title"><p class="dmax-kicker">01 / POR MARCA</p><h2>Tu modelo.<br>Tu proyecto.</h2><p>Selecciona la camioneta. Cada aplicación se verifica por año, cabina, versión y medidas antes de confirmar.</p></div>${brandSections}<aside class="vehicle-missing"><p class="dmax-kicker">¿NO ENCUENTRAS TU MODELO?</p><h2>Igual podemos ayudarte.</h2><a class="dmax-button" href="https://wa.me/593960855932?text=Hola%20Maxmotor%204x4%2C%20quiero%20consultar%20accesorios%20para%20mi%20camioneta%3A" target="_blank" rel="noopener">Consultar otra camioneta <b>↗</b></a></aside></section></main><maxmotor-footer></maxmotor-footer></body></html>`;

await Promise.all([
  writeFile(resolve(output, "index.html"), hub, "utf8"),
  ...ECUADOR_PICKUPS.map((pickup) => writeFile(resolve(output, `${pickup.slug}.html`), pageFor(pickup), "utf8")),
]);

console.log(`Generated vehicle SEO hub and ${ECUADOR_PICKUPS.length} pickup pages`);
