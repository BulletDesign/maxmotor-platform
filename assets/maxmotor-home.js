const maxmotorCategories = window.MAXMOTOR_FAMILIES;

function renderMaxmotorCategories() {
  const grid = document.getElementById("productCategoryGrid");
  if (!grid) return;
  grid.innerHTML = maxmotorCategories.map((category, index) => `
    <button class="cat-btn" type="button" data-category="${category.id}">
      ${category.featured ? '<span class="badge-new-item">NOVEDAD</span>' : ""}
      <i class="fa-solid ${category.icon} cat-icon" aria-hidden="true"></i>
      <span class="cat-copy">${category.name}<small>${category.description}</small></span>
      <span class="cat-number">${String(index + 1).padStart(2, "0")}</span>
    </button>
  `).join("") + `
    <button class="cat-btn cat-btn--poly" type="button" data-polyurethane>
      <i class="fa-solid fa-shield-halved cat-icon" aria-hidden="true"></i>
      <span class="cat-copy">Recubrimiento poliuretano<small>Proteccion definitiva aplicada en caliente.</small></span>
      <span class="cat-number">12</span>
    </button>`;
  grid.addEventListener("click", (event) => {
    const polyurethane = event.target.closest("[data-polyurethane]");
    if (polyurethane) {
      configurar("poliuretano", polyurethane, "zone-main");
      return;
    }
    const button = event.target.closest("[data-category]");
    if (button) openProductFamily(button.dataset.category, button);
  });
}

function openProductFamily(categoryId, trigger) {
  const family = maxmotorCategories.find((item) => item.id === categoryId);
  const explorer = document.getElementById("familyExplorer");
  if (!family || !explorer) return;

  document.querySelectorAll(".cat-btn").forEach((button) => button.classList.toggle("active", button === trigger));
  const first = family.products[0];
  explorer.innerHTML = `
    <div class="family-preview">
      <img data-family-preview src="${first.image}" alt="${first.name}">
      <div class="family-preview__overlay"><span>${family.code}</span><strong data-family-preview-name>${first.name}</strong></div>
    </div>
    <div class="family-options">
      <div class="family-options__head">
        <div><span class="catalog-kicker">${family.code} / Familia</span><h3>${family.name}</h3></div>
        <button type="button" class="family-close" aria-label="Cerrar opciones">&times;</button>
      </div>
      <p>${family.description}</p>
      <div class="family-option-list">
        ${family.products.map((product, index) => `
          <article class="family-option${index === 0 ? " is-active" : ""}" data-preview-image="${product.image}" data-preview-name="${product.name}">
            <button type="button" class="family-option__select" aria-label="Previsualizar ${product.name}">
              <span>${String(index + 1).padStart(2, "0")}</span><strong>${product.name}</strong><small>${product.summary}</small>
            </button>
            <div class="family-option__actions">
              <button type="button" data-configure-product="${product.slug}">Configurar</button>
              <a href="/fichas/${product.slug}">Ficha tecnica ↗</a>
            </div>
          </article>`).join("")}
      </div>
    </div>`;
  explorer.hidden = false;
  explorer.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => explorer.classList.add("is-open"));
  document.body.classList.add("has-family-explorer");

  const setPreview = (option) => {
    explorer.querySelectorAll(".family-option").forEach((item) => item.classList.toggle("is-active", item === option));
    explorer.querySelector("[data-family-preview]").src = option.dataset.previewImage;
    explorer.querySelector("[data-family-preview-name]").textContent = option.dataset.previewName;
  };
  explorer.querySelectorAll(".family-option").forEach((option) => {
    option.querySelector(".family-option__select").addEventListener("click", () => setPreview(option));
    option.addEventListener("mouseenter", () => setPreview(option));
  });
  explorer.querySelector(".family-close").addEventListener("click", () => closeProductFamily(explorer));
  explorer.querySelectorAll("[data-configure-product]").forEach((button) => button.addEventListener("click", () => {
    const product = family.products.find((item) => item.slug === button.dataset.configureProduct);
    if (product) openSpecificProductConfig(explorer, family, product);
  }));
}

function openSpecificProductConfig(explorer, family, product) {
  const panel = explorer.querySelector(".family-options");
  const message = () => encodeURIComponent([
    "Hola Maxmotor 4x4, quiero configurar este accesorio.",
    `Producto: ${product.name}`,
    `Vehiculo: ${panel.querySelector("[data-config-vehicle]")?.value || "por confirmar"}`,
    `Uso: ${panel.querySelector("[data-config-use]")?.value || "por confirmar"}`,
  ].join("\n"));

  explorer.querySelector("[data-family-preview]").src = product.image;
  explorer.querySelector("[data-family-preview-name]").textContent = product.name;
  panel.innerHTML = `
    <div class="family-options__head">
      <div><span class="catalog-kicker">${family.code} / Configuracion directa</span><h3>${product.name}</h3></div>
      <button type="button" class="family-close" aria-label="Cerrar configuracion">&times;</button>
    </div>
    <button class="config-back" type="button" data-config-back>← Cambiar producto</button>
    <p>${product.summary}</p>
    <div class="specific-features">${product.features.map((feature, index) => `<div><b>0${index + 1}</b><span>${feature}</span></div>`).join("")}</div>
    <div class="specific-form">
      <label>Marca, modelo y ano<input type="text" data-config-vehicle placeholder="Ej. Toyota Hilux 2024"></label>
      <label>Uso principal<select data-config-use><option value="Uso diario">Uso diario</option><option value="Trabajo y carga">Trabajo y carga</option><option value="Aventura off-road">Aventura off-road</option><option value="Viajes overland">Viajes overland</option></select></label>
    </div>
    <div class="specific-actions"><a href="/fichas/${product.slug}">Ver ficha tecnica</a><a class="specific-quote" data-config-quote target="_blank" rel="noopener">Cotizar configuracion ↗</a></div>`;

  const quote = panel.querySelector("[data-config-quote]");
  const updateQuote = () => { quote.href = `https://wa.me/593960855932?text=${message()}`; };
  panel.querySelectorAll("input,select").forEach((field) => field.addEventListener("input", updateQuote));
  panel.querySelector(".family-close").addEventListener("click", () => closeProductFamily(explorer));
  panel.querySelector("[data-config-back]").addEventListener("click", () => openProductFamily(family.id, document.querySelector(`[data-category="${family.id}"]`)));
  updateQuote();
}

function closeProductFamily(explorer = document.getElementById("familyExplorer")) {
  explorer.classList.remove("is-open");
  explorer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("has-family-explorer");
  window.setTimeout(() => { explorer.hidden = true; }, 350);
}

function openConfiguratorModal(zone, category) {
  document.querySelectorAll(".dynamic-zone.configurator-modal").forEach((item) => item.classList.remove("configurator-modal"));
  zone.classList.add("configurator-modal");
  zone.dataset.category = category;
  document.body.classList.add("has-configurator");
  const layout = zone.querySelector(".split-layout");
  let close = layout.querySelector(".config-close");
  if (!close) {
    close = document.createElement("button");
    close.type = "button";
    close.className = "config-close";
    close.setAttribute("aria-label", "Cerrar configurador");
    close.innerHTML = "&times;";
    layout.appendChild(close);
  }
  close.onclick = () => closeConfiguratorModal(zone);
  zone.onclick = (event) => { if (event.target === zone) closeConfiguratorModal(zone); };
}

function closeConfiguratorModal(zone = document.querySelector(".configurator-modal")) {
  if (!zone) return;
  zone.classList.remove("configurator-modal");
  zone.style.display = "none";
  document.body.classList.remove("has-configurator");
}

window.openConfiguratorModal = openConfiguratorModal;
window.closeConfiguratorModal = closeConfiguratorModal;
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeConfiguratorModal();
  if (!document.getElementById("familyExplorer")?.hidden) closeProductFamily();
});

function initMaxmotorIntro() {
  const loader = document.getElementById("intro-loader");
  if (!loader) {
    window.dispatchEvent(new CustomEvent("maxmotor:intro-complete"));
    return;
  }
  const duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 1250;
  window.setTimeout(() => loader.classList.add("is-leaving"), duration);
  window.setTimeout(() => {
    loader.classList.add("is-hidden");
    window.dispatchEvent(new CustomEvent("maxmotor:intro-complete"));
  }, duration + 700);
}

function initMaxmotorHero() {
  const track = document.getElementById("promoSlides");
  const slides = [...document.querySelectorAll(".mxr-hero .slide")];
  const dots = document.getElementById("sliderDots");
  if (!track || !slides.length || !dots) return;

  let active = 0;
  let timer;
  dots.innerHTML = slides.map((_, index) => `<button class="dot${index === 0 ? " active" : ""}" type="button" aria-label="Ir a promocion ${index + 1}"></button>`).join("");

  const show = (next) => {
    active = (next + slides.length) % slides.length;
    track.style.transform = `translateX(-${active * 100}%)`;
    dots.querySelectorAll(".dot").forEach((dot, index) => {
      dot.classList.toggle("active", index === active);
      dot.setAttribute("aria-current", index === active ? "true" : "false");
    });
  };
  const restart = () => {
    clearInterval(timer);
    timer = setInterval(() => show(active + 1), 6500);
  };

  dots.addEventListener("click", (event) => {
    const index = [...dots.children].indexOf(event.target);
    if (index >= 0) { show(index); restart(); }
  });
  document.querySelector("[data-hero-prev]")?.addEventListener("click", () => { show(active - 1); restart(); });
  document.querySelector("[data-hero-next]")?.addEventListener("click", () => { show(active + 1); restart(); });
  let touchStartX = 0;
  track.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
  track.addEventListener("touchend", (event) => {
    const distance = touchStartX - event.changedTouches[0].screenX;
    if (Math.abs(distance) > 50) { show(active + (distance > 0 ? 1 : -1)); restart(); }
  }, { passive: true });
  restart();
}

function initMaxmotorHome() {
  renderMaxmotorCategories();
  initMaxmotorIntro();
  initMaxmotorHero();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMaxmotorHome, { once: true });
} else {
  initMaxmotorHome();
}
