(() => {
  const items = [
    ["/maxlining", "Inicio"],
    ["/maxlining/vehiculos", "Vehículos"],
    ["/maxlining/accesorios", "Accesorios"],
    ["/maxlining/industrial", "Industria"],
    ["/maxlining/comparacion", "Comparar"],
    ["/maxlining/aplicador", "Ser aplicador"],
    ["/maxlining/distribuidor", "Abrir una sede"],
  ];

  class MaxliningNav extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      const current = window.location.pathname.replace(/\/$/, "") || "/";
      this.innerHTML = `<nav class="maxlining-subnav" aria-label="Navegación Maxlining">
        <a class="maxlining-subnav__brand" href="/maxlining" aria-label="Maxlining, inicio"><img src="/assets/brand/maxlining-white.svg" alt="Maxlining" width="743" height="311"></a>
        <div class="maxlining-subnav__links">${items.map(([href, label]) => `<a href="${href}"${current === href ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</div>
        <a class="maxlining-subnav__quote" href="https://wa.me/593960855932?text=Hola%20Maxmotor%204x4%2C%20quiero%20cotizar%20Maxlining." target="_blank" rel="noopener">Cotizar <b>↗</b></a>
      </nav>`;
      this.dataset.ready = "true";
    }
  }

  if (!customElements.get("maxlining-nav")) customElements.define("maxlining-nav", MaxliningNav);
})();
