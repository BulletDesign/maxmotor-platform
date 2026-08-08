(function () {
  const rootPrefix = /\/(productos|fichas|camionetas)(?:\/|$)/.test(location.pathname) ? "../" : "";
  const header = `
    <div id="main-header-wrapper">
      <div class="top-banner"><div class="marquee-container"><span class="marquee-content">ENVIOS A TODO EL PAIS &nbsp;•&nbsp; ASESORIA TECNICA PERSONALIZADA &nbsp;•&nbsp; INSTALACION PROFESIONAL &nbsp;•&nbsp; ENVIOS A TODO EL PAIS</span></div></div>
      <nav>
        <a class="header-brand" href="index.html" aria-label="Ir al inicio"><img src="https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/logo%20maxmotor.png" class="logo" alt="Maxmotor Accesorios 4x4"></a>
        <div class="header-actions">
          <div class="search-container">
            <input type="search" class="search-input" id="mainSearchInput" placeholder="Buscar accesorios o vehiculo..." oninput="buscarCatalogo(this.value)" onclick="if(!this.classList.contains('active')) toggleSearch(event)">
            <i class="fa-solid fa-search search-icon" id="mainSearchBtn" onclick="toggleSearch(event)" aria-hidden="true"></i>
            <div id="searchResults" class="search-results"></div>
          </div>
          <a class="portal-entry" href="/MiMaxmotor"><small>PORTAL 4X4</small><span>Mi Maxmotor</span><b aria-hidden="true">→</b></a>
        </div>
      </nav>
    </div>`;
  const footer = `
    <footer class="shared-footer">
      <div class="shared-footer__grid">
        <div class="shared-footer__brand"><img src="https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/logo%20maxmotor.png" alt="Maxmotor 4x4"><p>Equipamiento e ingenieria para camionetas, SUV y proyectos off-road.</p><div class="footer-actions"><a class="footer-action footer-action--primary" href="https://wa.me/593960855932?text=Hola%20Maxmotor%204x4%2C%20necesito%20asesoria." target="_blank" rel="noopener">Contactar por WhatsApp</a><a class="footer-action" href="/MiMaxmotor">Mi Maxmotor</a></div></div>
        <nav class="footer-nav" aria-label="Navegacion del pie"><small>NAVEGACION</small><a href="${rootPrefix}index.html">Inicio</a><a href="${rootPrefix}index.html#main-catalog">Accesorios 4x4</a><a href="${rootPrefix}camionetas/">Camionetas</a><a href="${rootPrefix}fichas/tough-dog.html">Suspensiones</a><a href="${rootPrefix}fichas/tapas-balde-camionetas.html">Tapas de balde</a><a href="${rootPrefix}fichas/tiro-hd.html">Barras de tiro</a><a href="${rootPrefix}fichas/bullbar-overland.html">Bullbars</a><a href="${rootPrefix}mxr.html">Linea MXR</a></nav>
        <div class="footer-locations"><small>SUCURSALES</small><p><b>Ambato</b><br>Av. Atahualpa 18-0202<br><a href="tel:+593960855932">096 085 5932</a></p><p><b>Quito</b><br>De Las Hiedras 428, Torre Oxford<br><a href="tel:+593987986672">098 798 6672</a></p></div>
      </div>
      <div class="footer-social"><a href="https://www.instagram.com/maxmotor4x4/" target="_blank" rel="noopener">Instagram ↗</a><a href="https://www.facebook.com/maxmotordelecuador/" target="_blank" rel="noopener">Facebook ↗</a><a href="https://www.tiktok.com/@maxmotordelecuador" target="_blank" rel="noopener">TikTok ↗</a><a href="https://wa.me/593960855932" target="_blank" rel="noopener">WhatsApp ↗</a></div>
      <div class="shared-footer__legal"><span>© 2026 Maxmotor 4x4. Todos los derechos reservados.</span><a class="bullet-credit" href="https://bulletdsgn.com" target="_blank" rel="noopener noreferrer">Diseño y desarrollo por <strong>Bullet Design ↗</strong></a></div>
    </footer><a class="floating-whatsapp" href="https://wa.me/593960855932?text=Hola%20Maxmotor%204x4%2C%20quiero%20cotizar%20un%20accesorio." target="_blank" rel="noopener" aria-label="Cotizar por WhatsApp"><span>WhatsApp</span><b>+</b></a>`;
  const compactHeader = `<header class="compact-header"><a class="compact-header__brand" href="${rootPrefix}index.html"><img src="https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/logo%20maxmotor.png" alt="Maxmotor 4x4"></a><a class="compact-header__back" href="${rootPrefix}index.html#main-catalog">Accesorios / Volver</a></header>`;
  class MaxmotorHeader extends HTMLElement { connectedCallback() { if (!this.dataset.ready) { this.innerHTML = this.hasAttribute("compact") ? compactHeader : header; this.dataset.ready = "true"; } } }
  class MaxmotorFooter extends HTMLElement { connectedCallback() { if (!this.dataset.ready) { this.innerHTML = footer; this.dataset.ready = "true"; } } }
  if (!customElements.get("maxmotor-header")) customElements.define("maxmotor-header", MaxmotorHeader);
  if (!customElements.get("maxmotor-footer")) customElements.define("maxmotor-footer", MaxmotorFooter);
})();
