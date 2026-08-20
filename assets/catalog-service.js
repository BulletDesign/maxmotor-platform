(function () {
  let entries = [];
  let loadingPromise;
  let timer;
  let activeIndex = -1;
  let currentResults = [];

  const normalize = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  function elements() {
    return {
      container: document.getElementById("searchResults"),
      input: document.getElementById("mainSearchInput"),
      button: document.getElementById("mainSearchBtn"),
    };
  }

  async function loadIndex() {
    if (entries.length) return entries;
    if (!loadingPromise) {
      loadingPromise = fetch("/catalog/search-index.json", { headers: { Accept: "application/json" } })
        .then((response) => {
          if (!response.ok) throw new Error(`Search index HTTP ${response.status}`);
          return response.json();
        })
        .then((payload) => {
          entries = (payload.entries || []).map((entry) => ({
            ...entry,
            normalizedTitle: normalize(entry.title),
            normalizedText: normalize(`${entry.title} ${entry.eyebrow} ${entry.description} ${entry.terms}`),
          }));
          return entries;
        })
        .catch((error) => {
          console.warn("No se pudo cargar el indice de busqueda.", error);
          return [];
        });
    }
    return loadingPromise;
  }

  function score(entry, term) {
    const tokens = term.split(" ").filter(Boolean);
    if (!tokens.every((token) => entry.normalizedText.includes(token))) return 0;
    let value = 30;
    if (entry.normalizedTitle === term) value += 120;
    else if (entry.normalizedTitle.startsWith(term)) value += 80;
    else if (entry.normalizedTitle.includes(term)) value += 55;
    value += tokens.filter((token) => entry.normalizedTitle.includes(token)).length * 18;
    if (entry.type === "vehicle" && tokens.some((token) => entry.normalizedTitle.includes(token))) value += 22;
    if (entry.type === "accessory") value += 8;
    return value;
  }

  async function search(query) {
    const term = normalize(query);
    if (term.length < 2) return [];
    const source = await loadIndex();
    return source
      .map((entry) => ({ entry, score: score(entry, term) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, "es"))
      .slice(0, 8)
      .map((result) => result.entry);
  }

  function iconFor(entry) {
    if (entry.type === "vehicle") return '<i class="fa-solid fa-truck-pickup" aria-hidden="true"></i>';
    if (entry.type === "category") return '<i class="fa-solid fa-layer-group" aria-hidden="true"></i>';
    return '<i class="fa-solid fa-wrench" aria-hidden="true"></i>';
  }

  function setOpen(open) {
    const { container, input } = elements();
    if (!container || !input) return;
    container.style.display = open ? "block" : "none";
    input.setAttribute("aria-expanded", String(open));
    if (!open) {
      activeIndex = -1;
      input.removeAttribute("aria-activedescendant");
    }
  }

  function setSearching(searching) {
    const { input } = elements();
    if (!input) return;
    input.classList.toggle("expanded", searching);
    input.closest(".search-container")?.classList.toggle("is-searching", searching);
  }

  function renderEmpty(query) {
    const { container } = elements();
    container.innerHTML = `<div class="search-empty"><span>Sin coincidencias para</span><strong>“${escapeHtml(query)}”</strong><p>Prueba con la marca, el modelo o una familia como tapas, suspensión o estribos.</p><div><a href="/camionetas">Ver camionetas</a><a href="https://wa.me/593960855932?text=${encodeURIComponent(`Hola Maxmotor 4x4, busco: ${query}`)}" target="_blank" rel="noopener">Preguntar por WhatsApp ↗</a></div></div>`;
    setOpen(true);
  }

  function renderResults(results, query) {
    const { container } = elements();
    currentResults = results;
    activeIndex = -1;
    if (!results.length) return renderEmpty(query);
    container.innerHTML = `<div class="search-results__header"><span>${results.length} coincidencias</span><small>Camionetas + accesorios reales</small></div>${results.map((entry, index) => `
      <a id="search-result-${index}" class="catalog-search-result" href="${escapeHtml(entry.url)}" role="option" aria-selected="false">
        <span class="catalog-search-result__icon">${iconFor(entry)}</span>
        <span class="catalog-search-result__copy"><small>${escapeHtml(entry.eyebrow)}</small><strong>${escapeHtml(entry.title)}</strong><em>${escapeHtml(entry.description)}</em></span>
        <b>${entry.type === "vehicle" && entry.count ? `${entry.count}<small>compatibles</small>` : "VER ↗"}</b>
      </a>`).join("")}<a class="search-results__all" href="/camionetas">Explorar todos los vehículos <b>→</b></a>`;
    setOpen(true);
  }

  async function renderSearch(query) {
    const term = normalize(query);
    if (term.length < 2) return setOpen(false);
    renderResults(await search(query), query);
  }

  function selectResult(index) {
    const { container, input } = elements();
    const options = [...container.querySelectorAll("[role=option]")];
    if (!options.length) return;
    activeIndex = (index + options.length) % options.length;
    options.forEach((option, optionIndex) => {
      const selected = optionIndex === activeIndex;
      option.classList.toggle("is-active", selected);
      option.setAttribute("aria-selected", String(selected));
    });
    input.setAttribute("aria-activedescendant", options[activeIndex].id);
    options[activeIndex].scrollIntoView({ block: "nearest" });
  }

  function setup() {
    const { container, input, button } = elements();
    if (!container || !input || !button) return;
    loadIndex();
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => renderSearch(input.value), 120);
    });
    input.addEventListener("focus", () => {
      setSearching(true);
      if (normalize(input.value).length >= 2) renderSearch(input.value);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") { event.preventDefault(); selectResult(activeIndex + 1); }
      if (event.key === "ArrowUp") { event.preventDefault(); selectResult(activeIndex - 1); }
      if (event.key === "Enter" && activeIndex >= 0 && currentResults[activeIndex]) { event.preventDefault(); location.href = currentResults[activeIndex].url; }
      if (event.key === "Escape") { setOpen(false); setSearching(false); input.blur(); }
    });
    button.addEventListener("click", () => {
      setSearching(true);
      input.focus();
      if (normalize(input.value).length >= 2) renderSearch(input.value);
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".search-container")) {
        setOpen(false);
        setSearching(false);
      }
    });
  }

  window.buscarCatalogo = (query) => renderSearch(query);
  window.MaxmotorCatalog = { load: loadIndex, search };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup, { once: true });
  else setup();
})();
