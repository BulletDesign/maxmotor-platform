// CONTROL DEL HEADER SCROLL
    const headerWrapper = document.getElementById('main-header-wrapper');
    const mainSearchInput = document.getElementById('mainSearchInput');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        headerWrapper.classList.add('active');
        // Contraer si no tiene el foco ni texto al hacer scroll
        if (document.activeElement !== mainSearchInput && mainSearchInput.value === '') {
          mainSearchInput.classList.remove('expanded');
          document.getElementById('searchResults').style.display = 'none';
        }
      } else {
        headerWrapper.classList.remove('active');
        mainSearchInput.classList.remove('expanded'); // Limpia la clase para estar siempre expandida visualmente arriba
      }
    });

    // --- LOGICA BUSCADOR EXPANDIBLE Y SCROLL ANIMATIONS ---
    function toggleSearch(e) {
      if (e) e.stopPropagation();
      const headerWrapper = document.getElementById('main-header-wrapper');
      // Solo togglear si el header esta scrolleado (contraída)
      if (!headerWrapper.classList.contains('active')) return;

      const input = document.getElementById('mainSearchInput');
      input.classList.toggle('expanded');
      if (input.classList.contains('expanded')) {
        input.focus();
      } else {
        input.value = '';
        document.getElementById('searchResults').style.display = 'none';
        resetPage();
      }
    }

    document.addEventListener('click', (e) => {
      const searchContainer = document.querySelector('.search-container');
      const input = document.getElementById('mainSearchInput');
      const headerWrapper = document.getElementById('main-header-wrapper');
      if (searchContainer && input && input.classList.contains('expanded') && headerWrapper.classList.contains('active')) {
        if (!searchContainer.contains(e.target)) {
          input.classList.remove('expanded');
          document.getElementById('searchResults').style.display = 'none';
        }
      }
    });

    document.addEventListener('DOMContentLoaded', () => {
      // Intersection Observer para scroll - fade-up animations
      const observerOptions = {
        threshold: 0.05,
        rootMargin: "0px 0px -50px 0px"
      };

      const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Solo animar la primera vez
          }
        });
      }, observerOptions);

      document.querySelectorAll('.fade-up').forEach(el => {
        scrollObserver.observe(el);
      });

      const offerLink = document.getElementById('offer-register-link');
      offerLink?.addEventListener('click', () => {
        localStorage.setItem('mxr_welcome_offer_opened', new Date().toISOString());
        localStorage.setItem('mxr_offer_dismissed_v1', new Date().toISOString());
      });
      setOfferOpen(false, false);
      const openOfferAfterIntro = () => {
        const popup = document.getElementById('offer-popup');
        if (popup && popup.getAttribute('aria-hidden') !== 'false' && !localStorage.getItem('mxr_offer_dismissed_v1')) setOfferOpen(true);
      };
      window.addEventListener('maxmotor:intro-complete', openOfferAfterIntro, { once: true });
      if (document.getElementById('intro-loader')?.classList.contains('is-hidden')) openOfferAfterIntro();

    });

    function setupSwipe(elementId, onSwipeLeft, onSwipeRight) {
      const el = document.getElementById(elementId);
      if (!el) return;
      let touchStartX = 0;
      el.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, { passive: true });
      el.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) onSwipeLeft();
        if (touchEndX - touchStartX > 50) onSwipeRight();
      }, { passive: true });
    }

    function setOfferOpen(opening, markSeen = true) {
      const popup = document.getElementById('offer-popup');
      const floatBtn = document.getElementById('floating-btn');
      if (!popup || !floatBtn) return;
      popup.style.display = opening ? 'flex' : 'none';
      popup.setAttribute('aria-hidden', String(!opening));
      floatBtn.style.display = opening ? 'none' : 'block';
      document.body.style.overflow = opening ? 'hidden' : '';
      if (!opening && markSeen) localStorage.setItem('mxr_offer_dismissed_v1', new Date().toISOString());
    }

    function togglePopup() {
      const popup = document.getElementById('offer-popup');
      setOfferOpen(popup?.getAttribute('aria-hidden') !== 'false');
    }

    document.getElementById('offer-popup')?.addEventListener('click', event => { if (event.target.id === 'offer-popup') togglePopup(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && document.getElementById('offer-popup')?.style.display === 'flex') togglePopup(); });

    function imgError(imgEl) {
      imgEl.onerror = null;
      imgEl.src = '/assets/brand/maxmotor-logo.svg';
      imgEl.style.objectFit = 'contain';
    }

    function addIconsToSubmenuButtons(root = document) {
      root.querySelectorAll('.sub-opt-btn').forEach(btn => {
        if (btn.querySelector('i, iconify-icon')) return;
        let key = '';
        const oc = btn.getAttribute('onclick') || '';
        const m = oc.match(/seleccionarSub\('([^']+)'\s*,/);
        key = (m && m[1]) ? m[1].trim() : (btn.textContent || '').trim();

        // Solo agregar ícono si está explícitamente definido en SUBMENU_ICONS
        let iconClass = null;
        if (SUBMENU_ICONS && SUBMENU_ICONS[key]) {
          iconClass = SUBMENU_ICONS[key];
        } else {
          if (key.includes('Espaciadores')) iconClass = 'fa-circle-notch';
          else if (key.includes('Mesas')) iconClass = 'fa-table';
          else if (key.includes('Over Fender')) iconClass = 'fa-car-side';
        }

        if (!iconClass) return; // Sin icono definido, no agregar nada

        // Check if it's an Iconify icon (contains colon separator like "mdi:spring")
        if (iconClass.includes(':')) {
          const iconifyIcon = document.createElement('iconify-icon');
          iconifyIcon.setAttribute('icon', iconClass);
          btn.insertBefore(iconifyIcon, btn.firstChild);
        } else {
          const i = document.createElement('i');
          if (!iconClass.startsWith('fa-')) iconClass = 'fa-' + iconClass;
          i.className = `fa-solid ${iconClass}`;
          btn.insertBefore(i, btn.firstChild);
        }
      });
    }

    // --- ESTADO Y GESTIÓN DE ZONAS ---
    const estadoPorZona = {
      'zone-main': {
        categoria: '', marca: '', modelo: '', anio: '', subtipo: '', subopcion: '', color: '', precio: 0, extras: [],
        carga_tipo: '', carga_cap: '', carga_marca: '', carga_modelo: '', carga_material: '', carga_subtipo: '', carga_talla: '', carga_addons: [], custom_req: ''
      },
      'zone-mxr': {
        categoria: '', marca: '', modelo: '', anio: '', subtipo: '', subopcion: '', color: '', precio: 0, extras: [],
        carga_tipo: '', carga_cap: '', carga_marca: '', carga_modelo: '', carga_material: '', carga_subtipo: '', carga_talla: '', carga_addons: [], custom_req: ''
      }
    };

    function getEstado(zone) { return estadoPorZona[zone.id]; }

    function resetEstado(zone, cat) {
      estadoPorZona[zone.id] = {
        categoria: cat, marca: '', modelo: '', anio: '', subtipo: '', subopcion: '', color: '', precio: 0, extras: [],
        carga_tipo: '', carga_cap: '', carga_marca: '', carga_modelo: '', carga_material: '', carga_subtipo: '', carga_talla: '', carga_addons: [], custom_req: ''
      };
    }

    function updateVisual(zone, cat, sub) {
      const visualArea = zone.querySelector('.visual-area');
      const st = getEstado(zone);
      let imgs = [];
      if (cat === 'overland') {
        if (!sub) imgs = imagenesPresentacion['overland'] ? [...imagenesPresentacion['overland']] : ['logo maxmotor.png'];
        else if (sub === 'Rampas') { const imgColor = RAMPAS_POR_COLOR[st.color]; imgs = imgColor ? [imgColor] : [RAMPAS_INTRO]; }
        else if (sub === 'Grilletes' && st.color) imgs = (galeria['overland']['Grilletes'][st.color]) ? [...galeria['overland']['Grilletes'][st.color]] : ['logo maxmotor.png'];
        else if (sub === 'Camping' && st.subopcion) imgs = (galeria['overland']['Camping'][st.subopcion]) ? [...galeria['overland']['Camping'][st.subopcion]] : ['logo maxmotor.png'];
        else if (sub && st.subopcion && (sub === 'Toldo 180' || sub === 'Toldo 270')) { const nivel = st.subopcion === 'Essential' ? 0 : 1; imgs = [galeria['overland'][sub][nivel]]; }
        else if (sub && galeria['overland'][sub] && Array.isArray(galeria['overland'][sub])) imgs = galeria['overland'][sub];
        else imgs = imagenesPresentacion['overland'];
      } else if (cat === 'suspension') {
        if (!sub) imgs = imagenesPresentacion['suspension'];
        else if (galeria['suspension'][sub]) imgs = galeria['suspension'][sub];
        else imgs = imagenesPresentacion['suspension'];
      } else if (galeria[cat] && !Array.isArray(galeria[cat]) && sub && galeria[cat][sub]) imgs = [...galeria[cat][sub]];
      else if (Array.isArray(galeria[cat])) imgs = [...galeria[cat]];
      else imgs = imagenesPresentacion[cat] ? (Array.isArray(imagenesPresentacion[cat]) ? [...imagenesPresentacion[cat]] : [imagenesPresentacion[cat]]) : [...galeria['default']];

      if (st.extras.some(e => e.nom === 'Seguro Compuerta')) imgs.push('foto_seguro.jpeg');
      if (st.extras.some(e => e.nom === 'Protección Doble Borde')) imgs.push('doble_borde_general.jpg');

      updateVisualDirect(zone, imgs);
    }

    function updateVisualDirect(zone, imgs) {
      const visualArea = zone.querySelector('.visual-area');
      if (!imgs || imgs.length === 0) imgs = ['logo maxmotor.png'];
      currentImages = imgs; currentVisualIndex = 0;
      let slidesHtml = currentImages.map((src, i) => `<img src="${src}" class="gallery-slide ${i === 0 ? 'active' : ''}" onerror="imgError(this)">`).join('');
      let controlsHtml = '';
      if (currentImages.length > 1) controlsHtml = `<button class="gallery-arrow gallery-prev" onclick="moveSlide(-1, this)"><i class="fa-solid fa-chevron-left"></i></button><button class="gallery-arrow gallery-next" onclick="moveSlide(1, this)"><i class="fa-solid fa-chevron-right"></i></button><div class="gallery-nav">${currentImages.map((_, i) => `<div class="gallery-dot ${i === 0 ? 'active' : ''}" onclick="setSlide(${i}, this)"></div>`).join('')}</div>`;
      visualArea.innerHTML = `<div class="gallery-container" id="gallery-${zone.id}">${slidesHtml}</div>${controlsHtml}`;
      if (currentImages.length > 1) setupSwipe(`gallery-${zone.id}`, () => moveSlide(1, visualArea.querySelector('.gallery-next')), () => moveSlide(-1, visualArea.querySelector('.gallery-prev')));
    }

    function moveSlide(dir, btn) { const zone = btn.closest('.dynamic-zone'); const slides = zone.querySelectorAll('.gallery-slide'); const dots = zone.querySelectorAll('.gallery-dot'); slides[currentVisualIndex].classList.remove('active'); if (dots.length) dots[currentVisualIndex].classList.remove('active'); currentVisualIndex += dir; if (currentVisualIndex >= slides.length) currentVisualIndex = 0; if (currentVisualIndex < 0) currentVisualIndex = slides.length - 1; slides[currentVisualIndex].classList.add('active'); if (dots.length) dots[currentVisualIndex].classList.add('active'); }
    function setSlide(idx, dot) { const zone = dot.closest('.dynamic-zone'); const slides = zone.querySelectorAll('.gallery-slide'); const dots = zone.querySelectorAll('.gallery-dot'); slides[currentVisualIndex].classList.remove('active'); dots[currentVisualIndex].classList.remove('active'); currentVisualIndex = idx; slides[currentVisualIndex].classList.add('active'); dots[currentVisualIndex].classList.add('active'); }

    function buscarVehiculo(query) {
      const resultsDiv = document.getElementById('searchResults');
      if (query.length < 2) { resultsDiv.style.display = 'none'; return; }

      const matches = vehiculosLista.filter(v => v.toLowerCase().includes(query.toLowerCase()));

      let html = '';
      if (matches.length > 0) {
        html = matches.map(car => `<div class="result-item" onclick="seleccionarVehiculoBusqueda('${car}')"><i class="fa-solid fa-car"></i><div><strong>${car}</strong><br><small style="color:#999;">Ver accesorios disponibles</small></div></div>`).join('');
      } else {
        // FALLBACK: Si no hay resultado, ofrecer opción universal
        html = `<div class="result-item" onclick="seleccionarVehiculoBusqueda('${query}', true)"><i class="fa-solid fa-circle-question"></i><div><strong>${query}</strong><br><small style="color:#999;">Ver accesorios universales para este modelo</small></div></div>`;
      }
      resultsDiv.innerHTML = html;
      resultsDiv.style.display = 'block';
    }

    function seleccionarVehiculoBusqueda(car, esUniversal) {
      document.getElementById('searchResults').style.display = 'none';
      document.querySelector('.search-input').value = car;
      if (esUniversal) mostrarResultadosUniversales(car);
      else mostrarResultadosBusqueda(car);
    }

    const CDN = 'https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/';

    function mostrarResultadosBusqueda(modelo) {
      // Ocultar secciones de forma null-safe
      const _hide = (sel) => { const el = sel ? document.querySelector(sel) : null; if (el) el.style.display = 'none'; };
      _hide('.promo-slider'); _hide('.hero'); _hide('.mxr-divider'); _hide('.brands-section');
      document.getElementById('main-catalog').style.display = 'none';
      const zoneMxrEl = document.querySelector('#zone-mxr');
      if (zoneMxrEl && zoneMxrEl.parentElement) zoneMxrEl.parentElement.style.display = 'none';

      const zone = document.getElementById('search-results-zone');
      const grid = document.getElementById('results-grid');
      document.getElementById('search-term-display').innerHTML = `${modelo}`;
      zone.style.display = 'block';
      window.scrollTo(0, 0);

      const productosEspecificos = [
        { tipo: 'Novedad', titulo: 'Tapa Rígida Eléctrica', cat: 'tapa-rigida', subtipo: 'Electrica', img: CDN + 'foto_tapa_electrica.jpg', desc: 'Apertura remota, aluminio reforzado.' },
        { tipo: 'Hot', titulo: 'Tapa Rígida Trifold', cat: 'tapa-rigida', subtipo: 'Trifold', img: CDN + 'foto_tapa_trifold.jpeg', desc: 'La favorita del mercado. Pliegue en 3.' },
        { tipo: 'Normal', titulo: 'Suspensión Pro', cat: 'suspension', subtipo: 'Suspension Pro', img: CDN + 'suspension_1.png', desc: 'Levanta tu 4x4 y mejora el confort.' },
        { tipo: 'Normal', titulo: 'Llantas Off-Road', cat: 'suspension', subtipo: 'Llantas', img: CDN + 'llanta_intro_1.jpg', desc: 'AT y MT para todos los terrenos.' },
        { tipo: 'Normal', titulo: 'Tapa de Lona', cat: 'tapa-lona', subtipo: null, img: CDN + 'lona_1.jpg', desc: 'Económica y funcional.' },
        { tipo: 'Normal', titulo: 'Rollbar MXR', cat: 'rollbar', subtipo: null, img: CDN + 'rollbar_1.jpg', desc: 'Estilo deportivo y seguridad.' }
      ];

      const universales = [
        { titulo: 'Luces LED / Iluminación', cat: 'iluminacion', img: CDN + 'iluminacion_1.jpg', desc: 'Barras LED, neblineros y luces de faena universales.' },
        { titulo: 'Winchas de Rescate', cat: 'overland', subtipo: 'Winchas', img: CDN + 'wincha_1.jpg', desc: 'Kits de rescate adaptables a cualquier defensa.' },
        { titulo: 'Carpas y Toldos', cat: 'overland', subtipo: 'Camping', img: CDN + 'toldo_180_essential.jpg', desc: 'Equipamiento de camping para cualquier vehículo.' },
        { titulo: 'Baúles de Techo', cat: 'carga', subtipo: 'Baules', img: CDN + 'baul_450_1.jpg', desc: 'Espacio extra de carga, montaje universal.' },
        { titulo: 'Audio / Interior', cat: 'interior', img: CDN + 'interior_1.jpg', desc: 'Mejoras de confort y sonido.' }
      ];

      let html = `<h3 class="section-title visible" style="grid-column:1/-1;font-size:2rem;margin-top:10px;color:var(--accent);">Accesorios Compatibles</h3>`;

      productosEspecificos.forEach(prod => {
        let badge = '';
        if (prod.tipo === 'Novedad') badge = `<span class="result-badge badge-novedad">NUEVO</span>`;
        if (prod.tipo === 'Hot') badge = `<span class="result-badge badge-hot">MÁS VENDIDO</span>`;
        const subtipoStr = prod.subtipo ? `'${prod.subtipo}'` : 'null';
        html += `<div class="result-card" onclick="irAProductoDesdeBusqueda('${prod.cat}', '${modelo}', ${subtipoStr})">${badge}<div class="result-img-box"><img src="${prod.img}" onerror="imgError(this)"></div><div class="result-info"><h3 class="result-title">${prod.titulo}</h3><p class="result-desc">${prod.desc}</p><button class="btn-card">COTIZAR AHORA</button></div></div>`;
      });

      html += `<h3 class="section-title" style="grid-column:1/-1;font-size:2rem;margin-top:30px;border-top:1px solid #eee;padding-top:20px;color:var(--text-main);">Accesorios Universales</h3>`;

      universales.forEach(prod => {
        const subtipoStr = prod.subtipo ? `'${prod.subtipo}'` : 'null';
        let onclick = `irAProductoDesdeBusqueda('${prod.cat}', '${modelo}', ${subtipoStr})`;
        if (prod.cat === 'carga') onclick = `configurar('carga', 'zone-main'); setTimeout(()=>{selCargaTipo('Baules', document.querySelector('.cat-btn'))}, 500)`;
        html += `<div class="result-card" onclick="${onclick}"><div class="result-img-box"><img src="${prod.img}" onerror="imgError(this)"></div><div class="result-info"><h3 class="result-title">${prod.titulo}</h3><p class="result-desc">${prod.desc}</p><button class="btn-card">VER OPCIONES</button></div></div>`;
      });

      grid.innerHTML = html;
    }

    // --- NUEVO: RESULTADOS UNIVERSALES (Solamente, por si falló la búsqueda) ---
    function mostrarResultadosUniversales(modelo) {
      const _hide = (sel) => { const el = document.querySelector(sel); if (el) el.style.display = 'none'; };
      _hide('.promo-slider'); _hide('.hero'); _hide('.mxr-divider'); _hide('.brands-section');
      document.getElementById('main-catalog').style.display = 'none';
      const zoneMxrEl = document.querySelector('#zone-mxr');
      if (zoneMxrEl && zoneMxrEl.parentElement) zoneMxrEl.parentElement.style.display = 'none';

      const zone = document.getElementById('search-results-zone');
      const grid = document.getElementById('results-grid');
      document.getElementById('search-term-display').innerHTML = `${modelo}<br><small style="font-size:1rem;color:#666;font-family:'Montserrat';text-transform:none;">Accesorios recomendados para tu vehículo:</small>`;
      zone.style.display = 'block';
      window.scrollTo(0, 0);

      const universales = [
        { titulo: 'Luces LED / Iluminación', cat: 'iluminacion', img: CDN + 'iluminacion_1.jpg', desc: 'Barras LED, neblineros y luces de faena universales.' },
        { titulo: 'Winchas de Rescate', cat: 'overland', subtipo: 'Winchas', img: CDN + 'wincha_1.jpg', desc: 'Kits de rescate adaptables a cualquier defensa.' },
        { titulo: 'Carpas y Toldos', cat: 'overland', subtipo: 'Camping', img: CDN + 'toldo_180_essential.jpg', desc: 'Equipamiento de camping para cualquier vehículo.' },
        { titulo: 'Baúles de Techo', cat: 'carga', subtipo: 'Baules', img: CDN + 'baul_450_1.jpg', desc: 'Espacio extra de carga, montaje universal.' },
        { titulo: 'Audio / Interior', cat: 'interior', img: CDN + 'interior_1.jpg', desc: 'Mejoras de confort y sonido.' }
      ];

      let html = '';
      universales.forEach(prod => {
        const subtipoStr = prod.subtipo ? `'${prod.subtipo}'` : 'null';
        let onclick = `irAProductoDesdeBusqueda('${prod.cat}', '${modelo}', ${subtipoStr})`;
        if (prod.cat === 'carga') onclick = `configurar('carga', 'zone-main'); setTimeout(()=>{selCargaTipo('Baules', document.querySelector('.cat-btn'))}, 500)`;
        html += `<div class="result-card" onclick="${onclick}"><div class="result-img-box"><img src="${prod.img}" onerror="imgError(this)"></div><div class="result-info"><h3 class="result-title">${prod.titulo}</h3><p class="result-desc">${prod.desc}</p><button class="btn-card">VER OPCIONES</button></div></div>`;
      });
      grid.innerHTML = html;
    }

    function irAProductoDesdeBusqueda(cat, searchModel, subtipoPre) {
      resetPage(); configurar(cat, 'zone-main');
      let foundMarca = '', foundModelo = '';
      for (const m in datosVehiculos) { if (searchModel.toLowerCase().includes(m.toLowerCase())) { foundMarca = m; for (const mod in datosVehiculos[m]) { if (searchModel.toLowerCase().includes(mod.toLowerCase())) { foundModelo = mod; break; } } break; } }
      setTimeout(() => { const zone = document.getElementById('zone-main'); if (subtipoPre) { const subBtns = Array.from(zone.querySelectorAll('.sub-opt-btn, .poly-opt')); const targetBtn = subBtns.find(b => b.textContent.includes(subtipoPre) || b.getAttribute('onclick')?.includes(subtipoPre)); if (targetBtn) targetBtn.click(); } if (foundMarca) { const selMarca = zone.querySelector('.selector-marca'); if (selMarca) { selMarca.value = foundMarca; cargarModelos(selMarca); if (foundModelo) { const selModelo = zone.querySelector('.selector-modelo'); if (selModelo) { selModelo.value = foundModelo; cargarAnios(selModelo); } } } } }, 200);
    }

    function resetPage() {
      window.scrollTo(0, 0);
      document.querySelector('.search-input').value = '';
      document.getElementById('searchResults').style.display = 'none';
      const _show = (sel, disp) => { const el = document.querySelector(sel); if (el) el.style.display = disp; };
      _show('.promo-slider', 'block');
      _show('.hero', 'flex');
      _show('.mxr-divider', 'block');
      _show('.brands-section', 'block');
      document.getElementById('main-catalog').style.display = 'block';
      document.getElementById('search-results-zone').style.display = 'none';
      const zoneMxrEl = document.querySelector('#zone-mxr');
      if (zoneMxrEl && zoneMxrEl.parentElement) zoneMxrEl.parentElement.style.display = 'block';
      document.querySelectorAll('.dynamic-zone').forEach(z => z.style.display = 'none');
      document.querySelectorAll('.cat-btn, .btn-poly, .mxr-btn').forEach(b => b.classList.remove('active'));
    }

    function configurar(cat, btnOrZoneId, zoneIdOpt) {
      let zoneID = zoneIdOpt || btnOrZoneId; if (typeof btnOrZoneId === 'object') { document.querySelectorAll('.cat-btn, .btn-poly, .mxr-btn').forEach(b => b.classList.remove('active')); if (btnOrZoneId.tagName === 'BUTTON') btnOrZoneId.classList.add('active'); } document.querySelectorAll('.dynamic-zone').forEach(z => z.style.display = 'none'); const zone = document.getElementById(zoneID); zone.style.display = 'block';
      resetEstado(zone, cat); updateVisual(zone, cat, null); renderizarControles(cat, zone);
      if (typeof openConfiguratorModal === 'function') openConfiguratorModal(zone, cat);
    }

    function renderizarControles(cat, zone) {
      const container = zone.querySelector('.controls-area'); const isMXR = (zone.id === 'zone-mxr'); let html = '';
      container.classList.remove('compact-ui');

      // --- SISTEMAS DE CARGA (LOGICA ESPECIAL) ---
      if (cat === 'carga') {
        renderizarCarga(zone);
        return;
      }

      // --- RESTO DE CATEGORIAS ---
      // CORRECCIÓN: Orden botones Tapa Rígida (Trifold -> QuadFold -> Enrollable -> Electrica)
      if (cat === 'tapa-rigida') html += `<h3 class="step-title">Tipo de Tapa</h3><div class="sub-options-grid"><button class="sub-opt-btn" onclick="seleccionarSub('Trifold', this)">Trifold</button><button class="sub-opt-btn" onclick="seleccionarSub('QuadFold', this)">QuadFold</button><button class="sub-opt-btn" onclick="seleccionarSub('Enrollable', this)">Enrollable</button><button class="sub-opt-btn btn-electrica" onclick="seleccionarSub('Electrica', this)">Eléctrica</button></div>${renderizarSelectorVehiculo(true)}<div id="addon-tapa" style="display:none;" class="addon-box"><label style="display:flex; align-items:center; gap:10px; width:100%; cursor:pointer;"><input type="checkbox" onchange="toggleExtra('Seguro Compuerta', 79.99, this)"> Añadir Seguro Compuerta (+$79.99)</label></div>`;
      else if (cat === 'tapa-lona') html += `<h3 class="step-title">Tapa de Lona</h3>${renderizarSelectorVehiculo(false)}<div class="addon-box"><label style="display:flex; align-items:center; gap:10px; width:100%; cursor:pointer;"><input type="checkbox" onchange="toggleExtra('Seguro Compuerta', 79.99, this)"> Añadir Seguro Compuerta (+$79.99)</label></div>`;
      else if (cat === 'overland') { html += `<h3 class="step-title">Overland</h3><p style="color:#aaa; margin-bottom:10px;">Selecciona el producto:</p><div class="sub-options-grid"><button class="sub-opt-btn" onclick="seleccionarSub('Toldo 180', this)">Toldo 180</button><button class="sub-opt-btn" onclick="seleccionarSub('Toldo 270', this)">Toldo 270</button><button class="sub-opt-btn" onclick="seleccionarSub('Winchas', this)">Winchas</button><button class="sub-opt-btn" onclick="seleccionarSub('Grilletes', this)">Grilletes</button><button class="sub-opt-btn" onclick="seleccionarSub('Camping', this)">Camping</button><button class="sub-opt-btn" onclick="seleccionarSub('Rampas', this)">Rampas</button></div>`; html += `<div id="wrapper-toldo" style="display:none;"><p style="color:#aaa; margin-bottom:10px;">Nivel:</p><div class="poly-btn-group"><div class="poly-opt" onclick="seleccionarNivelToldo('Essential', this)"><b>ESSENTIAL</b></div><div class="poly-opt" onclick="seleccionarNivelToldo('Premium', this)"><b>PREMIUM</b></div></div><div id="wrapper-toldo-size" style="display:none; margin-top:15px;"><select class="dark-select" onchange="seleccionarMedida(this.value, this)"><option value="">-- Tamaño --</option><option value="Pequeño">Pequeño ($230)</option><option value="Mediano">Mediano ($250)</option><option value="Grande">Grande ($280)</option></select></div></div>`; html += `<div id="wrapper-winchas" style="display:none;"><p style="color:#aaa; margin-bottom:10px;">Capacidad:</p><div class="poly-btn-group"><div class="poly-opt" onclick="seleccionarSubOpcionSimple('8000lb', this)"><b>8000 lbs</b></div><div class="poly-opt" onclick="seleccionarSubOpcionSimple('9500lb', this)"><b>9500 lbs</b></div><div class="poly-opt" onclick="seleccionarSubOpcionSimple('10000lb', this)"><b>10000 lbs</b></div></div></div>`; html += `<div id="wrapper-grilletes" style="display:none;"><p style="color:#aaa; margin-bottom:10px;">Color:</p><div class="poly-btn-group"><div class="poly-opt" onclick="seleccionarColorGrillete('Negro con Rojo', this)"><b>Negro/Rojo</b></div><div class="poly-opt" onclick="seleccionarColorGrillete('Rojo con Negro', this)"><b>Rojo/Negro</b></div><div class="poly-opt" onclick="seleccionarColorGrillete('Gris Premium', this)"><b>Gris Premium</b></div></div></div>`; html += `<div id="wrapper-camping" style="display:none;"><p style="color:#aaa; margin-bottom:10px;">Item:</p><div class="poly-btn-group"><div class="poly-opt" onclick="seleccionarCamping('Mesas', this)"><b>Mesas</b></div><div class="poly-opt" onclick="seleccionarCamping('Sillas', this)"><b>Sillas</b></div><div class="poly-opt" onclick="seleccionarCamping('Coolers', this)"><b>Coolers</b></div></div><div id="wrapper-cooler-size" style="display:none; margin-top:15px;"><select class="dark-select" onchange="seleccionarMedida(this.value, this)"><option value="">-- Tamaño --</option><option value="Pequeño">Pequeño</option><option value="Mediano">Mediano</option><option value="Grande">Grande</option></select></div></div>`; html += `<div id="wrapper-rampas" style="display:none;"><p style="color:#aaa; margin-bottom:10px;">Tamaño:</p><div class="poly-btn-group"><div class="poly-opt" onclick="seleccionarMedida('Pequeña', this)"><b>PEQUEÑA</b></div><div class="poly-opt" onclick="seleccionarMedida('Grande', this)"><b>GRANDE</b></div></div><div id="colores-rampas" style="display:none; margin-top:15px;"><p style="color:#aaa; margin-bottom:10px;">Color:</p><span class="color-btn" data-color="Rojo" onclick="seleccionarColor('Rojo', this)"></span><span class="color-btn" data-color="Naranja" onclick="seleccionarColor('Naranja', this)"></span><span class="color-btn" data-color="Verde" onclick="seleccionarColor('Verde', this)"></span><span class="color-btn" data-color="Azul" onclick="seleccionarColor('Azul', this)"></span></div></div>`; }
      else if (cat === 'suspension') {
        html += `<h3 class="step-title">Suspensiones</h3>
                 <p style="color:#aaa; margin-bottom:10px;">Elige la marca:</p>
                 <div class="sub-options-grid">
                   <button class="sub-opt-btn brand-ome" style="position:relative; padding-left:35px;" onclick="seleccionarSub('OLD MAN EMU', this)">OLD MAN EMU</button>
                   <button class="sub-opt-btn brand-toughdog" style="position:relative; padding-left:35px;" onclick="seleccionarSub('TOUGH DOG', this)">TOUGH DOG</button>
                   <button class="sub-opt-btn brand-bilstein" style="position:relative; padding-left:35px;" onclick="seleccionarSub('BILSTEIN', this)">
                     <span class="badge-novedad-pop">NUEVO</span>
                     BILSTEIN
                   </button>
                   <button class="sub-opt-btn brand-tjm" style="position:relative; padding-left:35px;" onclick="seleccionarSub('TJM', this)">TJM</button>
                 </div>
                 ${renderizarSelectorVehiculo(false)}`;
      }
      else if (cat === 'poliuretano') { updateVisual(zone, 'poliuretano', 'intro'); html += `<h3 class="step-title">Nivel de Protección</h3><p style="color:#aaa; margin-bottom:10px;">Elige una opción:</p><div class="poly-btn-group"><div class="poly-opt" onclick="mostrarPoliInfo('DOMESTICO', this)"><span class="badge-best">MÁS VENDIDO</span><b>DOMÉSTICO</b></div><div class="poly-opt" onclick="mostrarPoliInfo('COMERCIAL', this)"><span class="badge-rec">RECOMENDADO</span><b>COMERCIAL</b></div><div class="poly-opt" onclick="mostrarPoliInfo('INDUSTRIAL', this)"><b>INDUSTRIAL</b></div></div><div id="ventajas-DOMESTICO" class="ventajas-box"><b>Ideal para casa.</b> Resistente a arañazos leves, garantía limitada, alta durabilidad.</div><div id="ventajas-COMERCIAL" class="ventajas-box"><b>Perfecto para trabajo.</b> Resistencia a golpes, antiraspaduras, garantía extendida.</div><div id="ventajas-INDUSTRIAL" class="ventajas-box"><b>3200 micras.</b> Resistencia extrema a abrasión, tolerancia a deformaciones, garantía de por vida.</div><div class="addon-box"><label style="display:flex; align-items:center; gap:10px; width:100%; cursor:pointer;"><input type="checkbox" onchange="toggleExtra('Protección Doble Borde', 50, this)"> Añadir Protección Doble Borde (+50mm)</label></div><input class="dark-input" placeholder="Modelo de Camioneta..." oninput="actualizarSimple('modelo', this.value, this)">`; }
      else if (cat === 'rollbar' || cat === 'estribos' || cat === 'tiro') {
        if (isMXR) {
          // (Mantén la lógica que ya existe para isMXR, no la borres)
          if (cat === 'tiro') {
            html += `<h3 class="step-title" style="color:var(--accent);">MXR BARRA DE TIRO</h3><p style="color:#aaa; margin-bottom:10px;">Selecciona la capacidad:</p><div class="poly-btn-group"><div class="poly-opt" onclick="seleccionarTiroMXR('Estándar', 240, this)"><b>ESTÁNDAR ($240)</b><br><small>Remolques ligeros</small></div><div class="poly-opt" onclick="seleccionarTiroMXR('Reforzada', 420, this)"><b>REFORZADA ($420)</b><br><small>+5000kg / Alta Carga</small></div></div><div id="desc-tiro-std" class="ventajas-box">Ideal para remolques pequeños, cargas ligeras y portabicicletas. Precio incluye IVA.</div><div id="desc-tiro-ref" class="ventajas-box">Estructura reforzada, acoples de alta carga, capacidad de arrastre +5000kg. Precio incluye IVA.</div><div id="input-auto-mxr" style="display:none; margin-top:20px;"><p style="color:#aaa; margin-bottom:10px;">Datos del Vehículo (Fabricación a medida):</p><input class="dark-input" placeholder="Escribe Marca y Modelo..." oninput="actualizarSimple('modelo', this.value, this)"><input class="dark-input" placeholder="Año..." oninput="actualizarSimple('anio', this.value, this)"></div>`;
          } else {
            html += `<h3 class="step-title" style="color:var(--accent);">MXR ${cat.toUpperCase()}</h3><p style="color:#aaa; margin-bottom:10px;">Fabricación Nacional a Medida.</p>${renderizarSelectorVehiculo(false)}`;
          }
        } else {
          html += `<h3 class="step-title">${cat.toUpperCase()}</h3>
                   <p style="color:#aaa; margin-bottom:10px;">Elige la marca:</p>
                   <div class="sub-options-grid">
                     <button class="sub-opt-btn brand-mxr" style="position:relative;" onclick="seleccionarSub('MXR', this)">
                       <span class="badge-universal-pop">PARA TODO VEHICULO</span>
                       MXR
                       <br><small style="font-size:0.6rem; color:#aaa; font-weight:normal; display:block; margin-top:5px; line-height:1.2;">Producto 100% Ecuatoriano.<br>Fabricación a medida en 3 días.</small>
                     </button>
                     <button class="sub-opt-btn brand-keko" onclick="seleccionarSub('KEKO', this)">KEKO</button>
                   </div>
                   ${renderizarSelectorVehiculo(false)}`;
        }
      }
      else if (cat === 'interior') {
        html += `<h3 class="step-title">Interior y Confort</h3>
                 <p style="color:#aaa; margin-bottom:10px;">Elige el producto:</p>
                 <div class="sub-options-grid">
                   <button class="sub-opt-btn" onclick="seleccionarSub('Moquetas 5D', this)">Moquetas 5D</button>
                   <button class="sub-opt-btn" onclick="seleccionarSub('Sparco', this)">Sparco / Limpieza</button>
                   <button class="sub-opt-btn" onclick="seleccionarSub('Radios Android', this)">Radios y Audio</button>
                 </div>
                 ${renderizarSelectorVehiculo(false)}`;
      }
      else if (cat === 'iluminacion') {
        html += `<h3 class="step-title">Iluminación Avanzada</h3>
                 <p style="color:#aaa; margin-bottom:10px;">Elige la marca:</p>
                 <div class="sub-options-grid">
                   <button class="sub-opt-btn" onclick="seleccionarSub('Lightforce', this)">Lightforce</button>
                   <button class="sub-opt-btn" onclick="seleccionarSub('Hella', this)">Hella</button>
                   <button class="sub-opt-btn" onclick="seleccionarSub('LED', this)">Barras LED</button>
                 </div>
                 ${renderizarSelectorVehiculo(false)}`;
      }
      else { html += `<h3 class="step-title">PRODUCTO</h3>${renderizarSelectorVehiculo(false)}`; }

      html += `
        <div class="price-box">
          <div class="price-display">
            <span class="price-label">Precio estimado</span>
            <span id="display-price" class="final-price">Consultar</span>
          </div>

          <small style="text-align:center; display:block; margin-bottom:8px; color:var(--accent); font-weight:600; font-size:0.8rem;">
            &#128161; Tip: Ahorra dinero con envío directo + instalación propia.
          </small>

          <a href="#" id="wa-link" class="btn-wa" target="_blank" aria-label="Cotizar por WhatsApp">
            <span class="wa-left">
              <span class="wa-icon" aria-hidden="true"><i class="fa-brands fa-whatsapp"></i></span>
              <span class="wa-text">
                <span class="wa-title">Cotizar por WhatsApp</span>
                <span class="wa-sub">Te armamos la cotización en 1 min</span>
              </span>
            </span>

            <span class="wa-right" aria-hidden="true">
              <span class="wa-pill">Abrir</span>
              <i class="fa-solid fa-chevron-right"></i>
            </span>
          </a>
        </div>`;

      container.innerHTML = html; addIconsToSubmenuButtons(zone); actualizarPrecio(zone, 0); actualizarLink(zone);
    }

    // === LÓGICA ESPECÍFICA PARA SISTEMAS DE CARGA ===

    function renderizarCarga(zone) {
      const container = zone.querySelector('.controls-area');
      const st = getEstado(zone);
      let html = `<h3 class="step-title">Sistemas de Carga</h3>`;

      if (!st.carga_tipo) {
        html += `
            <p style="color:#aaa; margin-bottom:15px;">Selecciona una categoría:</p>
            <div class="cat-grid" style="grid-template-columns: repeat(2, 1fr); margin-bottom:20px;">
            <button class="cat-btn" onclick="selCargaTipo('Portabicicletas', this)"><iconify-icon icon="mdi:bike"></iconify-icon> Portabicicletas</button>
            <button class="cat-btn" onclick="selCargaTipo('Parrillas', this)"><iconify-icon icon="mdi:grid"></iconify-icon> Parrillas</button>
            <button class="cat-btn" onclick="selCargaTipo('Bed Slider', this)"><iconify-icon icon="mdi:dolly"></iconify-icon> Bed Slider</button>
            <button class="cat-btn" onclick="selCargaTipo('Bed Rack', this)"><iconify-icon icon="mdi:car-pickup"></iconify-icon> Bed Rack</button>
            <button class="cat-btn" onclick="selCargaTipo('Baules', this)"><iconify-icon icon="mdi:toolbox-outline"></iconify-icon> Baúles</button>
            <button class="cat-btn" onclick="selCargaTipo('Accesorios', this)"><iconify-icon icon="mdi:car-cog"></iconify-icon> Accesorios</button>
            </div>`;
        updateVisualDirect(zone, ['logo maxmotor.png']);
        container.innerHTML = html;
        addIconsToSubmenuButtons(container); // Agrega iconos al menu de carga
        return;
      }

      if (st.carga_tipo === 'Portabicicletas') {
        html += renderHeaderCarga('Portabicicletas', zone);
        html += `<p class="poly-sub">Capacidad:</p><div class="poly-btn-group">`;
        Object.keys(datosCarga.portabicicletas).forEach(cap => {
          const active = st.carga_cap === cap ? 'selected' : '';
          html += `<div class="poly-opt ${active}" onclick="selCargaCap('${cap}', this)"><b>${cap}</b></div>`;
        });
        html += `</div>`;

        if (st.carga_cap) {
          const dataCap = datosCarga.portabicicletas[st.carga_cap];
          html += `<div style="animation:fadeIn 0.3s;"><p class="poly-sub">Marca:</p><div class="sub-options-grid">`;
          dataCap.brands.forEach(brand => {
            let badge = brand === 'BAIKTRACKS' ? `<span class="badge-best">BEST SELLER</span>` : '';
            const active = st.carga_marca === brand ? 'selected' : '';
            html += `<button class="sub-opt-btn ${active}" onclick="selCargaMarca('${brand}', this)">${badge}${brand}</button>`;
          });
          html += `</div></div>`;
        }

        if (st.carga_marca) {
          const dataCap = datosCarga.portabicicletas[st.carga_cap];
          const modelos = dataCap.models.filter(m => !m.brand || m.brand === st.carga_marca);
          html += `<div style="animation:fadeIn 0.3s;"><p class="poly-sub">Modelos Disponibles:</p><div class="results-grid" style="grid-template-columns:1fr; margin-top:10px;">`;
          modelos.forEach(mod => {
            const active = st.carga_modelo === mod.nombre ? 'border:2px solid var(--accent);' : '';
            html += `
                    <div class="result-card" style="flex-direction:row; height:auto; padding:10px; cursor:pointer; ${active}" onclick="selCargaModelo('${mod.nombre}', ${mod.precio}, ['${mod.imgs.join("','")}'], this)">
                    <img src="${mod.imgs[0]}" style="width:80px; height:80px; object-fit:contain;" onerror="imgError(this)">
                    <div style="padding-left:15px; display:flex; flex-direction:column; justify-content:center;">
                    <h4 style="margin:0; font-family:'Teko'; font-size:1.2rem;">${mod.nombre}</h4>
                    <span style="font-weight:bold; color:var(--accent);">$${mod.precio}</span>
                    </div>
                    </div>`;
          });
          html += `</div></div>`;
        }
      }
      else if (st.carga_tipo === 'Parrillas') {
        html += renderHeaderCarga('Parrillas', zone);
        html += `<p class="poly-sub">Material:</p><div class="sub-options-grid">
            <button class="sub-opt-btn ${st.carga_material === 'Aluminio' ? 'selected' : ''}" onclick="selCargaMaterial('Aluminio', this)">Aluminio</button>
            <button class="sub-opt-btn ${st.carga_material === 'Acero' ? 'selected' : ''}" onclick="selCargaMaterial('Acero', this)">Acero</button>
            </div>`;

        if (st.carga_material) {
          const matData = datosCarga.parrillas[st.carga_material];
          html += `<div style="animation:fadeIn 0.3s;"><p class="poly-sub">Tipo:</p><div class="poly-btn-group">`;
          Object.keys(matData).forEach(tipo => {
            let badge = matData[tipo].tag ? `<span class="badge-rec">${matData[tipo].tag}</span>` : '';
            const active = st.carga_subtipo === tipo ? 'selected' : '';
            html += `<div class="poly-opt ${active}" onclick="selCargaSubtipo('${tipo}', this)">${badge}<b>${tipo}</b></div>`;
          });
          html += `</div></div>`;
        }

        if (st.carga_subtipo) {
          const subData = datosCarga.parrillas[st.carga_material][st.carga_subtipo];
          // Colores (si existen)
          if (subData.colores) {
            html += `<div style="margin-top:15px;"><p class="poly-sub">Color:</p>`;
            subData.colores.forEach(col => {
              const active = st.color === col ? 'selected' : '';
              html += `<span class="btn-color-circle ${active}" data-c="${col}" onclick="selCargaColor('${col}', this)"></span>`;
            });
            html += `</div>`;
          }

          html += `<div style="margin-top:15px;"><p class="poly-sub">Tamaño:</p><select class="dark-select" onchange="selCargaTalla(this.value, this)">
                <option value="">-- Selecciona Talla --</option>`;
          subData.tallas.forEach(t => {
            html += `<option value="${t}" ${st.carga_talla === t ? 'selected' : ''}>${t}</option>`;
          });
          html += `</select></div>`;
        }
      }
      else if (st.carga_tipo === 'Bed Rack') {
        html += renderHeaderCarga('Bed Rack', zone);
        html += `<p class="poly-sub">Complementos (Click para agregar):</p><div class="carga-grid-complementos" style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px;">`;
        datosCarga.bed_rack.complementos.forEach(item => {
          const isActive = st.carga_addons.some(x => x.id === item.id);
          const cls = isActive ? 'background:#f0f0f0; border-color:var(--accent);' : 'border:1px solid #ddd;';
          html += `<div class="complemento-item" style="padding:10px; text-align:center; cursor:pointer; ${cls}" onclick="toggleBedRackAddon('${item.id}', this)">
                <span style="font-size:0.8rem; font-weight:bold;">${item.nombre}</span>
                </div>`;
        });
        html += `</div>`;
      }
      else if (st.carga_tipo === 'Bed Slider') {
        html += renderHeaderCarga('Bed Slider', zone);
        html += `<p class="poly-sub">Uso:</p><div class="sub-options-grid">`;
        Object.keys(datosCarga.bed_slider).forEach(opt => {
          const active = st.carga_subtipo === opt ? 'selected' : '';
          html += `<button class="sub-opt-btn ${active}" onclick="selCargaSubtipo('${opt}', this, true)">${opt}</button>`;
        });
        html += `</div>`;
      }
      else if (st.carga_tipo === 'Baules') {
        html += renderHeaderCarga('Baúles de Techo', zone);
        html += `<p class="poly-sub">Capacidad:</p><div class="results-grid" style="grid-template-columns:repeat(2,1fr); gap:10px;">`;
        datosCarga.baules.forEach(baul => {
          const active = st.carga_subtipo === baul.cap ? 'border:2px solid var(--accent);' : '';
          html += `<div class="result-card" style="padding:10px; cursor:pointer; ${active}" onclick="selCargaBaul('${baul.cap}', ${baul.precio}, ['${baul.imgs.join("','")}'], this)">
            <div style="height:80px; display:flex; align-items:center; justify-content:center;"><img src="${baul.imgs[0]}" style="max-height:100%;" onerror="imgError(this)"></div>
            <h4 style="text-align:center; font-size:1rem; margin:5px 0;">${baul.cap}</h4>
            <div style="text-align:center; font-weight:bold; color:var(--accent);">$${baul.precio}</div>
            </div>`;
        });
        html += `</div>`;
      }
      else if (st.carga_tipo === 'Accesorios') {
        html += renderHeaderCarga('Accesorios Sueltos', zone);
        html += `<div class="results-grid" style="grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:10px;">`;
        datosCarga.accesorios_carga.forEach(acc => {
          const isSel = st.carga_addons.some(x => x.nombre === acc.nombre);
          const style = isSel ? 'border:2px solid var(--accent); background:#fff0f0;' : '';
          html += `<div class="result-card" style="padding:10px; cursor:pointer; ${style}" onclick="toggleAccesoriosSueltos('${acc.nombre}', ${acc.precio}, this)">
            <div style="height:60px; display:flex; align-items:center; justify-content:center;"><img src="${acc.img}" style="max-height:100%;" onerror="imgError(this)"></div>
            <p style="text-align:center; font-size:0.8rem; margin:5px 0; line-height:1.2;">${acc.nombre}</p>
            <p style="text-align:center; font-weight:bold; font-size:0.9rem;">$${acc.precio}</p>
            </div>`;
        });
        html += `</div>`;
      }


      html += `
        <div class="price-box">
        <div class="price-display"><span class="price-label">Total</span><span id="display-price" class="final-price">Consultar</span></div>
        <a href="#" id="wa-link" class="btn-wa" target="_blank"><span class="wa-left"><span class="wa-icon"><i class="fa-brands fa-whatsapp"></i></span><span class="wa-text"><span class="wa-title">Cotizar Configuración</span></span></span><span class="wa-right"><i class="fa-solid fa-chevron-right"></i></span></a>
        </div>`;

      container.innerHTML = html;
      addIconsToSubmenuButtons(container);
      actualizarPrecioCarga(zone);
      actualizarLink(zone);
    }

    function selCargaTipo(tipo, btn) {
      const zone = btn.closest('.dynamic-zone');
      const st = getEstado(zone);
      st.carga_tipo = tipo;
      st.carga_cap = ''; st.carga_marca = ''; st.carga_modelo = ''; st.carga_material = ''; st.carga_subtipo = ''; st.carga_addons = []; st.precio = 0;
      renderizarCarga(zone);
    }

    function renderHeaderCarga(titulo, zone) {
      return `<div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
        <button class="btn-back" onclick="selCargaTipo('', this)" style="margin:0;"><i class="fa-solid fa-chevron-left"></i> Volver</button>
        <h4 style="margin:0; font-family:'Teko'; font-size:1.5rem; color:var(--accent);">${titulo}</h4></div>`;
    }

    function selCargaCap(cap, el) { const zone = el.closest('.dynamic-zone'); getEstado(zone).carga_cap = cap; renderizarCarga(zone); }
    function selCargaMarca(m, el) { const zone = el.closest('.dynamic-zone'); getEstado(zone).carga_marca = m; renderizarCarga(zone); }
    function selCargaModelo(n, p, imgs, el) { const zone = el.closest('.dynamic-zone'); const st = getEstado(zone); st.carga_modelo = n; st.precio = p; updateVisualDirect(zone, imgs); renderizarCarga(zone); }

    // CORRECCIÓN BUG PARRILLAS: Limpia subtipo y talla al cambiar material
    function selCargaMaterial(m, el) {
      const zone = el.closest('.dynamic-zone');
      const st = getEstado(zone);
      st.carga_material = m;
      st.carga_subtipo = ''; // Reset subtipo
      st.carga_talla = '';   // Reset talla
      renderizarCarga(zone);
    }

    function selCargaSubtipo(s, el, isSlider) {
      const zone = el.closest('.dynamic-zone');
      const st = getEstado(zone);
      st.carga_subtipo = s;
      if (isSlider && datosCarga.bed_slider[s]) { st.precio = datosCarga.bed_slider[s].precio; updateVisualDirect(zone, datosCarga.bed_slider[s].imgs); }
      renderizarCarga(zone);
    }
    function selCargaTalla(t, el) {
      const zone = el.closest('.dynamic-zone');
      const st = getEstado(zone);
      st.carga_talla = t;
      // Calculo precio parrillas
      if (st.carga_material && st.carga_subtipo && st.carga_talla) {
        const base = datosCarga.parrillas[st.carga_material][st.carga_subtipo];
        if (base) {
          st.precio = base.precio_base;
          updateVisualDirect(zone, base.imgs);
        }
      }
      renderizarCarga(zone);
    }

    function selCargaBaul(cap, precio, imgs, el) {
      const zone = el.closest('.dynamic-zone');
      const st = getEstado(zone);
      st.carga_subtipo = cap;
      st.precio = precio;
      updateVisualDirect(zone, imgs);
      renderizarCarga(zone);
    }

    function toggleBedRackAddon(id, el) {
      const zone = el.closest('.dynamic-zone');
      const st = getEstado(zone);
      const exists = st.carga_addons.find(x => x.id === id);
      if (exists) { st.carga_addons = st.carga_addons.filter(x => x.id !== id); }
      else {
        const item = datosCarga.bed_rack.complementos.find(x => x.id === id);
        if (item) st.carga_addons.push(item);
      }
      // Recalcular precio BedRack
      let total = datosCarga.bed_rack.precio_base;
      st.carga_addons.forEach(ad => total += ad.precio);
      st.precio = total;
      renderizarCarga(zone);
    }

    function toggleAccesoriosSueltos(nombre, precio, el) {
      const zone = el.closest('.dynamic-zone');
      const st = getEstado(zone);
      const exists = st.carga_addons.find(x => x.nombre === nombre);
      if (exists) { st.carga_addons = st.carga_addons.filter(x => x.nombre !== nombre); st.precio -= precio; }
      else { st.carga_addons.push({ nombre: nombre, precio: precio }); st.precio += precio; }
      renderizarCarga(zone);
    }

    function actualizarPrecioCarga(zone) {
      const st = getEstado(zone);
      const d = zone.querySelector('#display-price');
      if (st.precio > 0) d.innerText = "$" + st.precio.toFixed(2);
      else d.innerText = "Consultar";
    }

    // --- FUNCIÓN MODIFICADA: Renderiza los contenedores para Selects y Tags ---
    function renderizarSelectorVehiculo(oculto) {
      const style = oculto ? 'display:none;' : 'display:block;';
      return `
        <div class="wrapper-vehiculo" style="${style} animation:fadeIn 0.5s; margin-top:20px; padding-top:20px; border-top:1px solid #eee;">
            <label style="display:block; color:#333; font-weight:600; margin-bottom:10px;">
                <i class="fa-solid fa-car-side" style="color:var(--accent); margin-right:8px;"></i>Escoge tu vehículo:
            </label>
            
            <div id="box-marca-select">
                <select class="dark-select selector-marca" onchange="cargarModelos(this)">
                    <option value="">-- Marca --</option>
                    ${Object.keys(datosVehiculos).map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
            </div>
            <div id="box-marca-tag" style="display:none;"></div>

            <div id="box-modelo-select" style="display:none;">
                <select class="dark-select selector-modelo" onchange="cargarAnios(this)">
                    <option value="">-- Modelo --</option>
                </select>
            </div>
            <div id="box-modelo-tag" style="display:none;"></div>

            <div id="box-anio-select" style="display:none;">
                <select class="dark-select selector-anio" onchange="seleccionarAnio(this.value, this)">
                    <option value="">-- Año --</option>
                </select>
            </div>
            <div id="box-anio-tag" style="display:none;"></div>

        </div>`;
    }

    // --- LÓGICA DE SELECCIÓN EN CASCADA (Select -> Tag) ---

    function cargarModelos(el) {
      const zone = el.closest('.dynamic-zone');
      const st = getEstado(zone);
      const val = el.value;

      if (!val) return;

      st.marca = val;
      st.modelo = '';
      st.anio = '';

      const wrap = el.closest('.wrapper-vehiculo');

      // 1. Ocultar Select Marca y Mostrar Tag
      wrap.querySelector('#box-marca-select').style.display = 'none';
      const tagBox = wrap.querySelector('#box-marca-tag');
      tagBox.innerHTML = `
            <div class="selection-tag">
                <span><i class="fa-solid fa-check" style="color:#4CAF50;"></i> ${val}</span>
                <button class="close-tag-btn" onclick="resetVehiculoSelection('marca', this)"><i class="fa-solid fa-times"></i></button>
            </div>`;
      tagBox.style.display = 'block';

      // 2. Preparar y Mostrar Select Modelo
      const selModDiv = wrap.querySelector('#box-modelo-select');
      const selMod = selModDiv.querySelector('.selector-modelo');

      if (st.marca && datosVehiculos[st.marca]) {
        selModDiv.style.display = 'block';
        selMod.innerHTML = '<option value="">-- Selecciona Modelo --</option>' + Object.keys(datosVehiculos[st.marca]).map(m => `<option value="${m}">${m}</option>`).join('');
      } else {
        selModDiv.style.display = 'none';
      }

      // Limpiar siguientes pasos
      wrap.querySelector('#box-anio-select').style.display = 'none';
      wrap.querySelector('#box-anio-tag').style.display = 'none';

      actualizarPrecioDesdeEstado(zone);
      actualizarLink(zone);
    }

    function cargarAnios(el) {
      const zone = el.closest('.dynamic-zone');
      const st = getEstado(zone);
      const val = el.value;

      if (!val) return;

      st.modelo = val;
      st.anio = '';

      const wrap = el.closest('.wrapper-vehiculo');

      // 1. Ocultar Select Modelo y Mostrar Tag
      wrap.querySelector('#box-modelo-select').style.display = 'none';
      const tagBox = wrap.querySelector('#box-modelo-tag');
      tagBox.innerHTML = `
            <div class="selection-tag">
                <span>${val}</span>
                <button class="close-tag-btn" onclick="resetVehiculoSelection('modelo', this)"><i class="fa-solid fa-times"></i></button>
            </div>`;
      tagBox.style.display = 'block';

      // 2. Preparar y Mostrar Select Año
      const selAnioDiv = wrap.querySelector('#box-anio-select');
      const selAnio = selAnioDiv.querySelector('.selector-anio');

      if (st.modelo) {
        selAnioDiv.style.display = 'block';
        selAnio.innerHTML = '<option value="">-- Año --</option>' + datosVehiculos[st.marca][st.modelo].map(a => `<option value="${a}">${a}</option>`).join('');
      } else {
        selAnioDiv.style.display = 'none';
      }

      if (st.categoria === 'suspension' && st.subtipo === 'Llantas' && st.subopcion) { actualizarListaLlantas(zone); }
      actualizarPrecioDesdeEstado(zone);
      actualizarLink(zone);
    }

    function seleccionarAnio(val, el) {
      const zone = el.closest('.dynamic-zone');
      const st = getEstado(zone);

      if (!val) return;
      st.anio = val;

      const wrap = el.closest('.wrapper-vehiculo');

      // 1. Ocultar Select Año y Mostrar Tag
      wrap.querySelector('#box-anio-select').style.display = 'none';
      const tagBox = wrap.querySelector('#box-anio-tag');
      tagBox.innerHTML = `
            <div class="selection-tag">
                <span>Año: ${val}</span>
                <button class="close-tag-btn" onclick="resetVehiculoSelection('anio', this)"><i class="fa-solid fa-times"></i></button>
            </div>`;
      tagBox.style.display = 'block';

      actualizarLink(zone);
    }

    // --- NUEVA FUNCIÓN: Resetea la selección al hacer click en la X ---
    function resetVehiculoSelection(nivel, btn) {
      const zone = btn.closest('.dynamic-zone');
      const wrap = btn.closest('.wrapper-vehiculo');
      const st = getEstado(zone);

      if (nivel === 'marca') {
        st.marca = ''; st.modelo = ''; st.anio = '';
        wrap.querySelector('#box-marca-tag').style.display = 'none';
        wrap.querySelector('#box-marca-select').style.display = 'block';
        wrap.querySelector('.selector-marca').value = ""; // Reset select

        // Ocultar hijos
        wrap.querySelector('#box-modelo-select').style.display = 'none';
        wrap.querySelector('#box-modelo-tag').style.display = 'none';
        wrap.querySelector('#box-anio-select').style.display = 'none';
        wrap.querySelector('#box-anio-tag').style.display = 'none';
      }
      else if (nivel === 'modelo') {
        st.modelo = ''; st.anio = '';
        wrap.querySelector('#box-modelo-tag').style.display = 'none';
        wrap.querySelector('#box-modelo-select').style.display = 'block';
        wrap.querySelector('.selector-modelo').value = ""; // Reset select

        // Ocultar hijos
        wrap.querySelector('#box-anio-select').style.display = 'none';
        wrap.querySelector('#box-anio-tag').style.display = 'none';
      }
      else if (nivel === 'anio') {
        st.anio = '';
        wrap.querySelector('#box-anio-tag').style.display = 'none';
        wrap.querySelector('#box-anio-select').style.display = 'block';
        wrap.querySelector('.selector-anio').value = ""; // Reset select
      }

      if (st.categoria === 'suspension' && st.subtipo === 'Llantas') { actualizarListaLlantas(zone); }
      actualizarPrecioDesdeEstado(zone);
      actualizarLink(zone);
    }

    function seleccionarSub(sub, el) {
      const zone = el.closest('.dynamic-zone');
      const controls = zone.querySelector('.controls-area');

      // ACTIVAR MODO COMPACTO (ZOOM OUT)
      controls.classList.add('compact-ui');

      const st = getEstado(zone);
      st.subtipo = sub;
      el.parentElement.querySelectorAll('.sub-opt-btn').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');

      updateVisual(zone, st.categoria, sub);

      if (st.categoria === 'tapa-rigida') { const w = zone.querySelector('.wrapper-vehiculo'); if (w) w.style.display = 'block'; const a = zone.querySelector('#addon-tapa'); if (a) a.style.display = 'block'; }
      if (st.categoria === 'overland') { zone.querySelectorAll('[id^="wrapper-"]').forEach(w => w.style.display = 'none'); if (sub.includes('Toldo')) zone.querySelector('#wrapper-toldo').style.display = 'block'; if (sub === 'Winchas') zone.querySelector('#wrapper-winchas').style.display = 'block'; if (sub === 'Grilletes') zone.querySelector('#wrapper-grilletes').style.display = 'block'; if (sub === 'Camping') zone.querySelector('#wrapper-camping').style.display = 'block'; if (sub === 'Rampas') { zone.querySelector('#wrapper-rampas').style.display = 'block'; updateVisual(zone, 'overland', 'Rampas'); } }
      if (st.categoria === 'suspension') { zone.querySelectorAll('[id^="wrapper-"]').forEach(w => w.style.display = 'none'); if (sub === 'Kit Altura') zone.querySelector('#wrapper-kit-altura').style.display = 'block'; if (sub === 'Suspension Pro') zone.querySelector('#wrapper-suspension-pro').style.display = 'block'; if (sub === 'Llantas') zone.querySelector('#wrapper-llantas').style.display = 'block'; if (sub === 'Accesorios') zone.querySelector('#wrapper-acc-susp').style.display = 'block'; }
      actualizarLink(zone);
    }

    function seleccionarSuspensionTipo(tipo, precio, el) { const zone = el.closest('.dynamic-zone'); const st = getEstado(zone); st.subopcion = tipo; st.precio = precio; el.parentElement.querySelectorAll('.btn-card').forEach(x => x.style.background = '#444'); el.style.background = 'var(--accent)'; actualizarPrecio(zone, precio); actualizarLink(zone); }
    function seleccionarTipoLlanta(tipo, el) { const zone = el.closest('.dynamic-zone'); const st = getEstado(zone); st.subopcion = tipo; el.parentElement.querySelectorAll('.poly-opt').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); actualizarListaLlantas(zone); actualizarLink(zone); }
    function actualizarListaLlantas(zone) { const st = getEstado(zone); const listContainer = zone.querySelector('#lista-medidas-llantas'); if (!st.subopcion) { listContainer.style.display = 'none'; return; } let categoriaLlanta = 'suv_chico'; const mod = (st.modelo || '').toLowerCase(); if (mod.includes('f-150') || mod.includes('tundra') || mod.includes('ram') || mod.includes('silverado')) { categoriaLlanta = 'pickup_full_size'; } else if (mod.includes('dmax') || mod.includes('hilux') || mod.includes('ranger') || mod.includes('colorado') || mod.includes('frontier') || mod.includes('amarok') || mod.includes('l200') || mod.includes('poer') || mod.includes('jac') || mod.includes('foton')) { categoriaLlanta = 'camioneta_mediana'; } const medidas = llantasData[categoriaLlanta][st.subopcion]; if (medidas) { listContainer.style.display = 'block'; listContainer.innerHTML = `<strong>Medidas Disponibles (${categoriaLlanta.replace(/_/g, ' ')}):</strong><br>` + medidas.map(m => `~> ${m}`).join('<br>'); } else { listContainer.style.display = 'none'; } actualizarPrecio(zone, 0); }
    function seleccionarAccSusp(item, el) { const zone = el.closest('.dynamic-zone'); const st = getEstado(zone); st.subopcion = item; el.parentElement.querySelectorAll('.poly-opt').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); const espOpt = zone.querySelector('#opt-espaciadores'); espOpt.style.display = (item === 'Espaciadores') ? 'block' : 'none'; actualizarPrecioDesdeEstado(zone); actualizarLink(zone); }
    function seleccionarEspaciador(huecos, el) { const zone = el.closest('.dynamic-zone'); const st = getEstado(zone); st.extras = [{ nom: `${huecos} Huecos`, val: 280 }]; el.parentElement.querySelectorAll('.poly-opt').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); actualizarPrecioDesdeEstado(zone); actualizarLink(zone); }
    function seleccionarSubOpcionSimple(val, el) { const zone = el.closest('.dynamic-zone'); const st = getEstado(zone); st.subopcion = val; el.parentElement.querySelectorAll('.poly-opt').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); actualizarPrecioDesdeEstado(zone); actualizarLink(zone); }
    function seleccionarColorGrillete(color, el) { const zone = el.closest('.dynamic-zone'); const st = getEstado(zone); st.color = color; el.parentElement.querySelectorAll('.poly-opt').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); updateVisual(zone, 'overland', 'Grilletes'); actualizarLink(zone); }
    function seleccionarCamping(item, el) { const zone = el.closest('.dynamic-zone'); const st = getEstado(zone); st.subopcion = item; el.parentElement.querySelectorAll('.poly-opt').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); const coolOpt = zone.querySelector('#wrapper-cooler-size'); coolOpt.style.display = (item === 'Coolers') ? 'block' : 'none'; updateVisual(zone, 'overland', 'Camping'); actualizarLink(zone); }
    function seleccionarNivelToldo(nivel, el) { const zone = el.closest('.dynamic-zone'); const st = getEstado(zone); st.subopcion = nivel; el.parentElement.querySelectorAll('.poly-opt').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); const wSize = zone.querySelector('#wrapper-toldo-size'); if (st.subtipo === 'Toldo 180' && nivel === 'Essential') { wSize.style.display = 'block'; } else { wSize.style.display = 'none'; } updateVisual(zone, st.categoria, st.subtipo); actualizarPrecioDesdeEstado(zone); actualizarLink(zone); }
    function seleccionarColor(color, el) { const zone = el.closest('.dynamic-zone'); const st = getEstado(zone); st.color = color; el.parentElement.querySelectorAll('.color-btn').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); updateVisual(zone, 'overland', 'Rampas'); actualizarLink(zone); }
    function seleccionarMedida(val, el) { const zone = el.closest('.dynamic-zone'); if (el.tagName === 'DIV') { el.parentElement.querySelectorAll('.poly-opt').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); const colorsDiv = zone.querySelector('#colores-rampas'); colorsDiv.style.display = 'block'; const green = colorsDiv.querySelector('[data-color="Verde"]'); const blue = colorsDiv.querySelector('[data-color="Azul"]'); if (val === 'Grande') { green.style.display = 'inline-block'; blue.style.display = 'inline-block'; } else { green.style.display = 'none'; blue.style.display = 'none'; } getEstado(zone).subopcion = val; } else { getEstado(zone).subopcion = val; } actualizarPrecioDesdeEstado(zone); actualizarLink(zone); }
    function toggleExtra(nombre, valor, el) { const zone = el.closest('.dynamic-zone'); const st = getEstado(zone); if (el.checked) { st.extras.push({ nom: nombre, val: valor }); } else { st.extras = st.extras.filter(e => e.nom !== nombre); } updateVisual(zone, st.categoria, st.subtipo); actualizarPrecioDesdeEstado(zone); actualizarLink(zone); }
    function mostrarPoliInfo(niv, el) { const zone = el.closest('.dynamic-zone'); const st = getEstado(zone); st.subtipo = niv; el.parentElement.querySelectorAll('.poly-opt').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); zone.querySelectorAll('.ventajas-box').forEach(b => b.style.display = 'none'); const v = zone.querySelector('#ventajas-' + niv); if (v) v.style.display = 'block'; updateVisual(zone, 'poliuretano', niv); actualizarPrecioDesdeEstado(zone); actualizarLink(zone); }
    function seleccionarTiroMXR(niv, p, el) { const zone = el.closest('.dynamic-zone'); const st = getEstado(zone); st.subtipo = niv; el.parentElement.querySelectorAll('.poly-opt').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); zone.querySelectorAll('.ventajas-box').forEach(b => b.style.display = 'none'); if (niv === 'Estándar') zone.querySelector('#desc-tiro-std').style.display = 'block'; if (niv === 'Reforzada') zone.querySelector('#desc-tiro-ref').style.display = 'block'; zone.querySelector('#input-auto-mxr').style.display = 'block'; actualizarPrecioDesdeEstado(zone); actualizarLink(zone); }
    function actualizarSimple(c, v, el) { const zone = el.closest('.dynamic-zone'); getEstado(zone)[c] = v; actualizarLink(zone); }
    function actualizarPrecio(zone, monto) { const d = zone.querySelector('#display-price'); if (!d) return; if (monto > 0) { getEstado(zone).precio = monto; d.innerText = "$" + monto.toFixed(2); } else { getEstado(zone).precio = 0; d.innerText = "Consultar"; } }

    function actualizarPrecioDesdeEstado(zone) {
      const st = getEstado(zone);
      let base = 0;
      let esDesde = false; // Bandera para mostrar "Desde"

      // 1. TAPA RÍGIDA
      if (st.categoria === 'tapa-rigida') {
        if (st.subtipo === 'Trifold') {
          base = (st.modelo && st.modelo.includes('Tasman')) ? PRECIOS_BASE.tapa_trifold_tasman : PRECIOS_BASE.tapa_trifold;
        }
        else if (st.subtipo === 'Enrollable') {
          base = (st.modelo && st.modelo.includes('F-150')) ? PRECIOS_BASE.tapa_enrollable_f150 : PRECIOS_BASE.tapa_enrollable;
        }
        else if (st.subtipo === 'QuadFold') {
          base = PRECIOS_BASE.tapa_quadfold;
        }
        else if (st.subtipo === 'Electrica') {
          base = (st.modelo && (st.modelo.includes('Tasman') || st.modelo.includes('F-150'))) ? 0 : PRECIOS_BASE.tapa_electrica;
        }
      }

      // 2. TAPA LONA
      if (st.categoria === 'tapa-lona') base = PRECIOS_BASE.tapa_lona;

      // 3. TIRO DE ARRASTRE
      // A) Sección MXR (Fábrica Nacional)
      if (st.categoria === 'tiro' && zone.id === 'zone-mxr') {
        if (st.subtipo === 'Estándar') base = PRECIOS_BASE.tiro_estandar;
        if (st.subtipo === 'Reforzada') base = PRECIOS_BASE.tiro_reforzada;
      }
      // B) Sección GENERAL/IMPORTADO (Aquí aplicamos el "Desde 190")
      if (st.categoria === 'tiro' && zone.id === 'zone-main') {
        base = 190;
        esDesde = true; // Activamos modo "Desde"
      }

      // 4. OVERLAND
      if (st.categoria === 'overland') {
        if (st.subtipo === 'Toldo 180') {
          if (st.subopcion === 'Premium') base = PRECIOS_BASE.toldo_180_premium;
          else if (st.subopcion === 'Pequeño') base = PRECIOS_BASE.toldo_180_essential_peque;
          else if (st.subopcion === 'Mediano') base = PRECIOS_BASE.toldo_180_essential_med;
          else if (st.subopcion === 'Grande') base = PRECIOS_BASE.toldo_180_essential_grande;
        }
        if (st.subtipo === 'Toldo 270') {
          base = (st.subopcion === 'Premium') ? PRECIOS_BASE.toldo_270_premium : PRECIOS_BASE.toldo_270_essential;
        }
      }

      // 5. SUSPENSIÓN
      if (st.categoria === 'suspension') {
        if (st.subtipo === 'Suspension Pro' && st.precio > 0) base = st.precio;
        if (st.subtipo === 'Accesorios' && st.subopcion === 'Espaciadores') base = PRECIOS_BASE.espaciadores;
      }

      // --- CÁLCULO DE EXTRAS ---
      let totalExtras = 0;
      st.extras.forEach(extra => {
        if (extra.nom === 'Seguro Compuerta') totalExtras += PRECIOS_BASE.extra_seguro_compuerta;
        else if (extra.nom === 'Protección Doble Borde') totalExtras += PRECIOS_BASE.extra_doble_borde;
        else totalExtras += (Number(extra.val) || 0);
      });

      const d = zone.querySelector('#display-price');

      if (base > 0) {
        const total = base + totalExtras;
        actualizarPrecio(zone, total); // Guardamos valor numérico en estado

        // Sobreescribimos visualmente si es modo "Desde"
        if (esDesde) {
          d.innerText = "Desde $" + total.toFixed(0);
        }
      } else {
        actualizarPrecio(zone, 0);
      }
    }

    function actualizarLink(zone) {
      const st = getEstado(zone);
      const btn = zone.querySelector('#wa-link');
      if (!btn) return;
      let txt = `Hola MXR. Quiero cotizar: *${(st.categoria || '').toUpperCase()}*. `;

      if (st.categoria === 'carga') {
        txt += `Tipo: ${st.carga_tipo || 'N/A'}. `;
        if (st.carga_cap) txt += `Capacidad: ${st.carga_cap}. `;
        if (st.carga_marca) txt += `Marca: ${st.carga_marca}. `;
        if (st.carga_modelo) txt += `Modelo: ${st.carga_modelo}. `;
        if (st.carga_material) txt += `Material: ${st.carga_material}. `;
        if (st.carga_subtipo) txt += `Subtipo: ${st.carga_subtipo}. `;
        if (st.carga_talla) txt += `Talla: ${st.carga_talla}. `;
        if (st.carga_addons.length > 0) {
          const names = st.carga_addons.map(a => a.nombre || a.id).join(', ');
          txt += `(Addons: ${names}) `;
        }
        if (st.custom_req) txt += `Nota Extra: ${st.custom_req}. `;
      } else {
        if (st.subtipo) txt += `Tipo: ${st.subtipo}. `;
        if (st.subopcion) txt += `Opción: ${st.subopcion}. `;
        if (st.color) txt += `Color: ${st.color}. `;
        if (st.marca) txt += `Marca: ${st.marca}. `;
        if (st.modelo) txt += `Modelo: ${st.modelo}. `;
        txt += `año: ${st.anio || "Por definir"} `;
        if (st.extras.length > 0) txt += `(Con: ${st.extras.map(e => e.nom).join(', ')}) `;
      }

      if (st.precio > 0) txt += `(Precio: $${st.precio.toFixed(2)})`;

      btn.href = `https://wa.me/593960855932?text=${encodeURIComponent(txt)}`;
    }

    // === BRANDS MARQUEE: TOUCH/DRAG SUPPORT ===
    (function () {
      const marquee = document.querySelector('.brands-marquee');
      const grid = document.querySelector('.brands-grid');
      if (!marquee || !grid) return;

      let isDragging = false;
      let startX = 0;
      let scrollLeft = 0;
      let currentOffset = 0;
      let animPaused = false;

      function getGridOffset() {
        const transform = window.getComputedStyle(grid).transform;
        if (transform === 'none') return 0;
        const mat = transform.match(/matrix.*\((.+)\)/);
        if (mat) return parseFloat(mat[1].split(', ')[4]);
        return 0;
      }

      function pauseAnim() {
        if (!animPaused) {
          currentOffset = getGridOffset();
          grid.style.animationPlayState = 'paused';
          grid.style.transform = `translateX(${currentOffset}px)`;
          animPaused = true;
        }
      }

      function resumeAnim() {
        grid.style.transform = '';
        grid.style.animationPlayState = 'running';
        animPaused = false;
      }

      // Touch events
      marquee.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].pageX;
        pauseAnim();
      }, { passive: true });

      marquee.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const dx = e.touches[0].pageX - startX;
        grid.style.transform = `translateX(${currentOffset + dx}px)`;
      }, { passive: true });

      marquee.addEventListener('touchend', () => {
        isDragging = false;
        const mat = window.getComputedStyle(grid).transform;
        if (mat !== 'none') {
          const x = parseFloat(mat.split(',')[4]);
          currentOffset = x;
        }
        setTimeout(resumeAnim, 1200);
      });

      // Mouse drag
      marquee.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX;
        marquee.style.cursor = 'grabbing';
        pauseAnim();
      });

      marquee.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.pageX - startX;
        grid.style.transform = `translateX(${currentOffset + dx}px)`;
      });

      marquee.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        marquee.style.cursor = '';
        const mat = window.getComputedStyle(grid).transform;
        if (mat !== 'none') {
          const x = parseFloat(mat.split(',')[4]);
          currentOffset = x;
        }
        setTimeout(resumeAnim, 1200);
      });

      marquee.addEventListener('mouseleave', () => {
        if (isDragging) {
          isDragging = false;
          marquee.style.cursor = '';
          setTimeout(resumeAnim, 1200);
        }
      });
    })();
