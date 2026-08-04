(function () {
  const config = window.MAXMOTOR_CATALOG_CONFIG || {};
  let remoteProducts = [];
  let loaded = false;
  let timer;

  const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  function localProducts() {
    return (window.MAXMOTOR_FAMILIES || []).flatMap((family) => family.products.map((product) => ({
      id: product.slug,
      nombre: product.name,
      categoria: family.name,
      descripcion: product.summary,
      imagen: product.image,
      url: product.staticPage || `producto.html?producto=${encodeURIComponent(product.slug)}`,
      activo: true,
    })));
  }

  async function loadRemoteCatalog() {
    if (loaded) return remoteProducts;
    loaded = true;
    if (!config.sheetsEndpoint) return remoteProducts;
    const cacheKey = "maxmotor_catalog_v1";
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    if (cached && Date.now() - cached.savedAt < (config.cacheMinutes || 15) * 60000) {
      remoteProducts = cached.products;
      return remoteProducts;
    }
    try {
      const response = await fetch(config.sheetsEndpoint, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
      const payload = await response.json();
      remoteProducts = (payload.products || payload).filter((product) => product.activo !== false && product.activo !== "FALSE");
      localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), products: remoteProducts }));
    } catch (error) {
      console.warn("Catalogo remoto no disponible; se usa fallback local.", error);
    }
    return remoteProducts;
  }

  async function search(query) {
    const term = normalize(query);
    if (term.length < 2) return [];
    await loadRemoteCatalog();
    const source = remoteProducts.length ? remoteProducts : localProducts();
    return source.filter((product) => normalize([product.nombre, product.categoria, product.descripcion, product.sku, product.marca, product.compatibilidad].join(" ")).includes(term)).slice(0, 8);
  }

  async function renderSearch(query) {
    const container = document.getElementById("searchResults");
    if (!container) return;
    const products = await search(query);
    if (!products.length) {
      if (typeof window.buscarVehiculo === "function") window.buscarVehiculo(query);
      return;
    }
    container.innerHTML = products.map((product) => `
      <a class="catalog-search-result" href="${escapeHtml(product.url || `producto.html?producto=${encodeURIComponent(product.id || product.slug)}`)}">
        <img src="${escapeHtml(product.imagen)}" alt="" onerror="this.style.display='none'">
        <span><strong>${escapeHtml(product.nombre)}</strong><small>${escapeHtml(product.categoria || "Accesorios 4x4")}</small></span>
        <b>VER ↗</b>
      </a>`).join("");
    container.style.display = "block";
  }

  window.buscarCatalogo = (query) => {
    clearTimeout(timer);
    if (!query.trim()) {
      const container = document.getElementById("searchResults");
      if (container) container.style.display = "none";
      return;
    }
    timer = setTimeout(() => renderSearch(query), 180);
  };
  window.MaxmotorCatalog = { load: loadRemoteCatalog, search };
})();
