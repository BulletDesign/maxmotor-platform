(function () {
  const params = new URLSearchParams(location.search);
  const pathSlug = location.pathname.split("/").filter(Boolean).pop().replace(/\.html$/i, "");
  const slug = params.get("producto") || (pathSlug !== "producto" ? pathSlug : "");
  const families = window.MAXMOTOR_FAMILIES || [];
  const family = families.find((item) => item.products.some((candidate) => candidate.slug === slug));
  const product = family?.products.find((candidate) => candidate.slug === slug);
  const target = document.getElementById("productDetail");

  if (!product) {
    target.innerHTML = '<section class="not-found"><p class="eyebrow">Ficha no encontrada</p><h1>Producto no disponible.</h1><a href="index.html#main-catalog">Volver al catalogo</a></section>';
    return;
  }

  document.title = `${product.name} | Maxmotor 4x4 Ecuador`;
  const related = family.products.filter((item) => item.slug !== product.slug).slice(0, 3);
  const detailUrl = (item) => `/fichas/${item.slug}`;
  const credit = product.photoCredit || "Fotografia del catalogo Maxmotor. Confirma la aplicacion exacta con un asesor.";
  const message = (vehicle) => encodeURIComponent(`Hola Maxmotor 4x4, quiero cotizar ${product.name}.\nVehiculo: ${vehicle || "por confirmar"}`);

  target.innerHTML = `
    <section class="product-hero" data-word="${family.code}">
      <div class="product-hero__copy">
        <nav class="detail-crumbs" aria-label="Migas de pan"><a href="index.html">Inicio</a> / <a href="index.html#main-catalog">Catalogo</a> / ${product.name}</nav>
        <span class="eyebrow">${family.code} / Serie Maxmotor</span>
        <h1>${product.name}</h1>
        <p class="lead">${product.summary}</p>
        <a class="hero-cta" href="#cotizar">Configurar para mi vehiculo <span>+</span></a>
      </div>
      <div class="product-hero__media">
        <img src="${product.image}" alt="${product.name} para camionetas y 4x4" referrerpolicy="no-referrer">
        <small class="photo-credit">${credit}</small>
        <div class="media-label"><span>${family.name}</span><strong>Hecho para salir</strong></div>
      </div>
    </section>
    <section class="product-body">
      <div class="section-head"><div><span class="eyebrow">01 / Ventajas</span><h2>Ingenieria que se siente.</h2></div><p>Seleccionamos cada configuracion segun marca, modelo, ano y uso real del vehiculo. No vendemos una pieza aislada: entregamos una aplicacion correctamente instalada.</p></div>
      <div class="feature-grid">${product.features.map((feature, index) => `<article class="feature-card"><b>0${index + 1}</b><h3>${feature}</h3><p>Configuracion validada por el equipo tecnico de Maxmotor antes de instalar.</p></article>`).join("")}</div>
      <div class="technical-band"><div class="technical-title"><span class="eyebrow">02 / Aplicacion</span><h2>Datos tecnicos.</h2><p>La especificacion final depende del vehiculo. Nuestro equipo confirma medidas, anclajes y disponibilidad.</p></div><div class="spec-list"><div class="spec-row"><span>Compatibilidad</span><strong>Marca, modelo y ano</strong></div><div class="spec-row"><span>Instalacion</span><strong>Maxmotor Ambato</strong></div><div class="spec-row"><span>Disponibilidad</span><strong>Confirmacion con ventas y bodega</strong></div><div class="spec-row"><span>Garantia</span><strong>Segun producto e instalacion</strong></div></div></div>
      <section class="quote-panel" id="cotizar"><div><span class="eyebrow">03 / Cotizacion</span><h2>Arma tu proyecto.</h2></div><div><p>Escribe tu vehiculo y abre una conversacion directa con un asesor tecnico.</p><div class="field"><label for="vehicle">Marca, modelo y ano</label><input id="vehicle" type="text" placeholder="Ej. Toyota Hilux 2024"></div><a class="quote-button" id="detailQuote" href="https://wa.me/593960855932?text=${message("")}">Cotizar por WhatsApp <span>↗</span></a></div></section>
    </section>
    ${related.length ? `<section class="related"><span class="eyebrow">Siguiente mejora</span><h2>Continua tu 4x4.</h2><div class="related-grid">${related.map((item) => `<a class="related-card" href="${detailUrl(item)}"><img src="${item.image}" alt="${item.name}"><span><strong>${item.name}</strong><small>Ver ficha ↗</small></span></a>`).join("")}</div></section>` : ""}`;

  const vehicle = document.getElementById("vehicle");
  const quote = document.getElementById("detailQuote");
  vehicle.addEventListener("input", () => { quote.href = `https://wa.me/593960855932?text=${message(vehicle.value)}`; });
})();
