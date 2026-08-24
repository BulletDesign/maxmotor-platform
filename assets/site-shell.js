(function () {
  const rootPrefix = /\/(productos|fichas|camionetas|hibridos|maxlining)(?:\/|$)/.test(location.pathname) ? "../" : "";
  const header = `
    <div id="main-header-wrapper">
      <div class="top-banner"><div class="marquee-container"><span class="marquee-content">ENVIOS A TODO EL PAIS &nbsp;•&nbsp; ASESORIA TECNICA PERSONALIZADA &nbsp;•&nbsp; INSTALACION PROFESIONAL &nbsp;•&nbsp; ENVIOS A TODO EL PAIS</span></div></div>
      <nav>
        <a class="header-brand" href="/" aria-label="Ir al inicio"><img src="/assets/brand/maxmotor-logo.svg" class="logo" alt="Maxmotor Accesorios 4x4" width="2022" height="866"></a>
        <div class="header-actions">
          <div class="search-container" role="search">
            <label class="sr-only" for="mainSearchInput">Buscar camioneta o accesorio</label>
            <input type="search" class="search-input" id="mainSearchInput" placeholder="Busca tu camioneta o accesorio" autocomplete="off" spellcheck="false" aria-controls="searchResults" aria-expanded="false">
            <button class="search-icon" id="mainSearchBtn" type="button" aria-label="Buscar camioneta o accesorio"><i class="fa-solid fa-search" aria-hidden="true"></i></button>
            <div id="searchResults" class="search-results" role="listbox" aria-label="Resultados de busqueda"></div>
          </div>
          <a class="portal-entry" href="/MiMaxmotor"><small>PORTAL 4X4</small><span>Mi Maxmotor</span><b aria-hidden="true">→</b></a>
        </div>
      </nav>
    </div>`;
  const footer = `
    <footer class="shared-footer">
      <div class="shared-footer__eyebrow"><span>MAXMOTOR 4X4 / ECUADOR</span><strong>TOOLS NOT TOYS.</strong></div>
      <div class="shared-footer__grid">
        <div class="shared-footer__brand"><img src="/assets/brand/maxmotor-logo.svg" alt="Maxmotor 4x4" width="2022" height="866"><p>Equipamiento, manufactura e ingeniería para camionetas, SUV, flotas y proyectos off-road.</p><div class="footer-actions"><a class="footer-action footer-action--primary" href="https://wa.me/593960855932?text=Hola%20Maxmotor%204x4%2C%20necesito%20asesoria." target="_blank" rel="noopener">Contactar por WhatsApp</a><a class="footer-action" href="/MiMaxmotor">Mi Maxmotor</a></div></div>
        <nav class="footer-nav footer-nav--main" aria-label="Explorar Maxmotor"><small>EXPLORAR</small><a href="${rootPrefix}index.html">Inicio</a><a href="${rootPrefix}camionetas/">Camionetas</a><a href="/hibridos">Híbridos y eléctricos</a><a href="/productos/">Productos destacados</a><a href="${rootPrefix}index.html#main-catalog">Accesorios 4x4</a><a href="/ingenieria">Ingeniería B2B</a><a href="/tough-dog">Tough Dog Ecuador</a></nav>
        <nav class="footer-nav footer-nav--services" aria-label="Servicios y líneas"><small>LÍNEAS</small><a href="/tough-dog">Tough Dog Ecuador</a><a href="/fichas/toldo-180">Toldo lateral 180°</a><a href="/maxlining">Maxlining</a><a href="/maxlining/vehiculos">Recubrimiento de balde</a><a href="/maxlining/industrial">Poliuretano industrial</a><a href="${rootPrefix}fichas/tapas-balde-camionetas.html">Tapas de balde</a><a href="${rootPrefix}fichas/tiro-hd.html">Barras de tiro</a><a href="${rootPrefix}fichas/bullbar-overland.html">Bullbars</a></nav>
        <div class="footer-locations"><small>SEDES</small><p><b>Ambato</b><br><a class="footer-map-link" href="https://www.google.com/maps/search/?api=1&query=Av.+Atahualpa+18-0202%2C+Ambato%2C+Ecuador" target="_blank" rel="noopener">Av. Atahualpa 18-0202 ↗</a><br><a href="tel:+593960855932">096 085 5932</a></p><p><b>Quito</b><br><a class="footer-map-link" href="https://www.google.com/maps/search/?api=1&query=De+Las+Hiedras+428%2C+Torre+Oxford%2C+Quito%2C+Ecuador" target="_blank" rel="noopener">De Las Hiedras 428, Torre Oxford ↗</a><br><a href="tel:+593987986672">098 798 6672</a></p><p class="footer-coming-soon"><b>Muy pronto Guayaquil</b><br><span>Nueva sede Maxmotor 4x4</span></p></div>
      </div>
      <div class="footer-social"><a href="https://www.instagram.com/maxmotor4x4/" target="_blank" rel="noopener">Instagram ↗</a><a href="https://www.facebook.com/maxmotordelecuador/" target="_blank" rel="noopener">Facebook ↗</a><a href="https://www.tiktok.com/@maxmotordelecuador" target="_blank" rel="noopener">TikTok ↗</a><a href="https://wa.me/593960855932" target="_blank" rel="noopener">WhatsApp ↗</a></div>
      <div class="footer-proof"><div class="footer-campaign"><img src="/assets/partners/campaign/primero-ecuador.png" alt="Primero Ecuador" width="1861" height="2000" loading="lazy"><span><small>PRODUCCIÓN NACIONAL</small><strong>Parte de la campaña Primero Ecuador</strong></span></div><div><small>DISEÑO + FABRICACIÓN + INSTALACIÓN</small><strong>Un solo equipo responsable del proyecto.</strong></div></div>
      <div class="shared-footer__art" aria-hidden="true"><img src="/assets/brand/maxmotor-footer.svg" alt="" width="2284" height="746" loading="lazy"></div>
      <div class="shared-footer__legal"><span>© 2026 Maxmotor 4x4. Todos los derechos reservados.</span><a class="bullet-credit" href="https://bulletdsgn.com" target="_blank" rel="noopener noreferrer">Diseño y desarrollo por <strong>Bullet Design ↗</strong></a></div>
    </footer><a class="floating-whatsapp" href="https://wa.me/593960855932?text=Hola%20Maxmotor%204x4%2C%20quiero%20cotizar%20un%20accesorio." target="_blank" rel="noopener" aria-label="Cotizar por WhatsApp"><span>WhatsApp</span><b>+</b></a>`;
  const compactHeader = `
    <div class="shared-site-header">
      <div class="top-banner"><div class="marquee-container"><span class="marquee-content">ENVIOS A TODO EL PAIS &nbsp;•&nbsp; ASESORIA TECNICA PERSONALIZADA &nbsp;•&nbsp; INSTALACION PROFESIONAL &nbsp;•&nbsp; ENVIOS A TODO EL PAIS</span></div></div>
      <nav>
        <a class="header-brand" href="/" aria-label="Ir al inicio"><img src="/assets/brand/maxmotor-logo.svg" class="logo" alt="Maxmotor Accesorios 4x4" width="2022" height="866"></a>
        <div class="header-actions">
          <a class="shared-header-search" href="/#mainSearchInput"><span>Buscar accesorios o vehículo</span><b aria-hidden="true">⌕</b></a>
          <a class="portal-entry" href="/MiMaxmotor"><small>PORTAL 4X4</small><span>Mi Maxmotor</span><b aria-hidden="true">→</b></a>
        </div>
      </nav>
    </div>`;
  class MaxmotorHeader extends HTMLElement { connectedCallback() { if (!this.dataset.ready) { this.innerHTML = this.hasAttribute("compact") ? compactHeader : header; this.dataset.ready = "true"; } } }
  class MaxmotorFooter extends HTMLElement { connectedCallback() { if (!this.dataset.ready) { this.innerHTML = footer; this.dataset.ready = "true"; } } }
  if (!customElements.get("maxmotor-header")) customElements.define("maxmotor-header", MaxmotorHeader);
  if (!customElements.get("maxmotor-footer")) customElements.define("maxmotor-footer", MaxmotorFooter);
})();
