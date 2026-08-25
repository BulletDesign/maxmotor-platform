(() => {
  const cards = [...document.querySelectorAll("[data-media-lightbox]")];
  if (!cards.length || typeof HTMLDialogElement === "undefined") return;

  const dialog = document.createElement("dialog");
  dialog.className = "media-lightbox";
  dialog.setAttribute("aria-label", "Vista ampliada del producto");
  dialog.innerHTML = `
    <button class="media-lightbox__close" type="button" aria-label="Cerrar imagen">×</button>
    <div class="media-lightbox__shell">
      <div class="media-lightbox__stage">
        <button class="media-lightbox__zoom" type="button" aria-label="Activar zoom" aria-pressed="false">
          <img alt="">
        </button>
      </div>
      <div class="media-lightbox__panel">
        <p class="media-lightbox__eyebrow">Proyecto real / Maxmotor 4x4</p>
        <h2 class="media-lightbox__title"></h2>
        <p class="media-lightbox__hint">Toca la imagen para ampliar. Confirmamos año, versión y aplicación antes de cotizar.</p>
        <a class="media-lightbox__quote is-waiting" aria-disabled="true"><span>Preparando cotización…</span><b>↗</b></a>
      </div>
    </div>`;
  document.body.append(dialog);

  const image = dialog.querySelector("img");
  const title = dialog.querySelector(".media-lightbox__title");
  const zoom = dialog.querySelector(".media-lightbox__zoom");
  const quote = dialog.querySelector(".media-lightbox__quote");
  const quoteLabel = quote.querySelector("span");
  let activationTimer;

  const resetZoom = () => {
    zoom.classList.remove("is-zoomed");
    zoom.setAttribute("aria-pressed", "false");
    zoom.setAttribute("aria-label", "Activar zoom");
    zoom.scrollTo({ top: 0, left: 0 });
  };

  const open = (card) => {
    clearTimeout(activationTimer);
    resetZoom();
    image.src = card.dataset.mediaSrc || card.querySelector("img")?.currentSrc || card.querySelector("img")?.src || "";
    image.alt = card.querySelector("img")?.alt || card.dataset.mediaTitle || "Producto Maxmotor 4x4";
    title.textContent = card.dataset.mediaTitle || card.querySelector("strong, h3")?.textContent || "Producto Maxmotor 4x4";
    quote.removeAttribute("href");
    quote.classList.remove("is-ready");
    quote.classList.add("is-waiting");
    quote.setAttribute("aria-disabled", "true");
    quoteLabel.textContent = "Preparando cotización…";
    dialog.showModal();

    activationTimer = window.setTimeout(() => {
      quote.href = card.dataset.mediaQuote || card.href;
      quote.target = "_blank";
      quote.rel = "noopener";
      quote.classList.remove("is-waiting");
      quote.classList.add("is-ready");
      quote.removeAttribute("aria-disabled");
      quoteLabel.textContent = "Cotizar este modelo por WhatsApp";
    }, 1000);
  };

  cards.forEach((card) => card.addEventListener("click", (event) => {
    event.preventDefault();
    open(card);
  }));

  zoom.addEventListener("click", () => {
    const active = zoom.classList.toggle("is-zoomed");
    zoom.setAttribute("aria-pressed", String(active));
    zoom.setAttribute("aria-label", active ? "Desactivar zoom" : "Activar zoom");
  });
  dialog.querySelector(".media-lightbox__close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    clearTimeout(activationTimer);
    image.removeAttribute("src");
    resetZoom();
  });
})();
