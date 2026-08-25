import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { firstMedia, mediaUrl } from "../catalog/maxmotor-media.mjs";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "maxlining");
await mkdir(output, { recursive: true });

const whatsapp = (message) => `https://wa.me/593960855932?text=${encodeURIComponent(message)}`;
const commonLinks = `
  <section class="maxlining-route-grid" aria-labelledby="route-grid-title">
    <div class="maxlining-shell"><p class="maxlining-kicker">CONTINÚA EXPLORANDO</p><h2 id="route-grid-title">Una solución para cada frente.</h2><div>
      <a href="/maxlining/vehiculos"><span>01</span><strong>Vehículos</strong><small>Baldes, flotas y restauración.</small></a>
      <a href="/maxlining/accesorios"><span>02</span><strong>Accesorios</strong><small>Protección aplicada a equipamiento.</small></a>
      <a href="/maxlining/industrial"><span>03</span><strong>Industria</strong><small>Superficies y activos operativos.</small></a>
      <a href="/maxlining/comparacion"><span>04</span><strong>Comparación</strong><small>Poliuretano, plástico y batepiedra.</small></a>
      <a href="/maxlining/aplicador"><span>05</span><strong>Aplicadores</strong><small>Opera bajo método Maxlining.</small></a>
      <a href="/maxlining/distribuidor"><span>06</span><strong>Sedes</strong><small>Representa la línea en tu ciudad.</small></a>
    </div></div>
  </section>`;

const page = ({ slug, title, description, kicker, headline, lead, image, imageAlt, primary, secondary, body, schemaType = "Service" }) => `<!DOCTYPE html>
<html lang="es-EC">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="https://maxmotor4x4.com/maxlining/${slug}">
  <link rel="alternate" hreflang="es-EC" href="https://maxmotor4x4.com/maxlining/${slug}">
  <link rel="icon" href="/assets/brand/favicon-maxmotor-v2.svg" type="image/svg+xml">
  <link rel="alternate icon" href="/assets/favicon-maxmotor.png" type="image/png">
  <link rel="apple-touch-icon" href="/assets/favicon-maxmotor.png">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_EC">
  <meta property="og:site_name" content="Maxlining by Maxmotor 4x4">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="https://maxmotor4x4.com/maxlining/${slug}">
  <meta property="og:image" content="${image}">
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=Montserrat:wght@400;500;700;900&family=Teko:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/shared-shell.css?v=20260825-1">
  <link rel="stylesheet" href="/assets/type-system.css?v=20260805-2">
  <link rel="stylesheet" href="/assets/maxlining.css?v=20260810-3">
  <script src="/assets/site-shell.js?v=20260825-1"></script>
  <script src="/assets/maxlining-shell.js?v=20260810-1"></script>
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": schemaType,
    name: title.split("|")[0].trim(),
    description,
    url: `https://maxmotor4x4.com/maxlining/${slug}`,
    image,
    areaServed: { "@type": "Country", name: "Ecuador" },
    provider: { "@type": "AutoPartsStore", name: "Maxmotor 4x4", url: "https://maxmotor4x4.com/", telephone: "+593960855932" },
  })}</script>
</head>
<body class="maxlining-page maxlining-subpage">
  <maxmotor-header compact></maxmotor-header>
  <maxlining-nav></maxlining-nav>
  <main>
    <section class="maxlining-route-hero" aria-labelledby="page-title">
      <img src="${image}" alt="${imageAlt}" width="1900" height="1267" fetchpriority="high">
      <div class="maxlining-shell"><p class="maxlining-kicker">${kicker}</p><h1 id="page-title">${headline}</h1><p>${lead}</p><div class="maxlining-actions"><a class="maxlining-button" href="${primary.href}"${primary.external ? ' target="_blank" rel="noopener"' : ""}>${primary.label} <b>↗</b></a><a class="maxlining-link" href="${secondary.href}">${secondary.label} ↓</a></div></div>
    </section>
    ${body}
    ${commonLinks}
  </main>
  <maxmotor-footer></maxmotor-footer>
</body>
</html>`;

const pages = [
  {
    slug: "vehiculos",
    title: "Recubrimiento de Balde para Camionetas | Maxlining Ecuador",
    description: "Recubrimiento de poliuretano para baldes de camioneta, restauración y flotas. Alternativa aplicada al protector plástico, brea y batepiedra.",
    kicker: "MAXLINING / VEHÍCULOS Y FLOTAS",
    headline: "Tu balde trabaja.<span>Protégelo como herramienta.</span>",
    lead: "Protección aplicada para baldes nuevos, superficies con desgaste y camionetas que cargan todos los días. Evaluamos el estado real antes de definir preparación y alcance.",
    image: mediaUrl("recubrimiento_de_poliuretano.webp"),
    imageAlt: "Camioneta pickup de trabajo preparada para carga",
    primary: { label: "Cotizar mi balde", href: whatsapp("Hola Maxmotor 4x4, quiero cotizar recubrimiento Maxlining para el balde de mi camioneta. Modelo: ___ Año: ___"), external: true },
    secondary: { label: "Ver aplicaciones", href: "#aplicaciones" },
    body: `
      <section class="maxlining-story" id="aplicaciones"><div class="maxlining-shell maxlining-story__lead"><div><p class="maxlining-kicker">01 / LA NECESIDAD</p><h2>Recubrimiento de balde.<br>Sin piezas sueltas.</h2></div><p>Un balde plástico puede moverse y ocultar suciedad o humedad. La brea y el batepiedra cumplen funciones distintas y su resultado depende del producto y la preparación. Maxlining se aplica sobre la geometría del balde para crear una capa continua, texturizada y reparable por zonas después de una evaluación.</p></div><div class="maxlining-use-grid maxlining-shell"><article><span>01</span><h3>Balde nuevo</h3><p>Protección temprana frente a carga, fricción, tierra y humedad de uso cotidiano.</p></article><article><span>02</span><h3>Restauración de balde</h3><p>Revisión del desgaste, corrosión visible y reparaciones previas antes de preparar.</p></article><article><span>03</span><h3>Flotas</h3><p>Un proceso repetible para unidades de trabajo con operación y carga similares.</p></article></div></section>
      <section class="maxlining-split"><img src="${mediaUrl("recubrimiento_poliuretano_toyota.webp")}" alt="Recubrimiento de poliuretano Maxlining aplicado a camioneta" loading="lazy" width="1500" height="1000"><div><p class="maxlining-kicker">02 / ANTES DE APLICAR</p><h2>Primero vemos el balde.</h2><ul><li>Estado de pintura, golpes y corrosión visible.</li><li>Uso particular, carga frecuente o trabajo severo.</li><li>Elementos que deben desmontarse o protegerse.</li><li>Terminación y alcance acordados antes de ejecutar.</li></ul><a class="maxlining-button" href="/maxlining/comparacion">Comparar soluciones <b>→</b></a></div></section>
      <section class="maxlining-faq"><div class="maxlining-shell"><p class="maxlining-kicker">03 / BÚSQUEDAS FRECUENTES</p><h2>¿Poliuretano, plástico, brea o batepiedra?</h2><details><summary>¿Maxlining sirve como protector de balde?</summary><p>Sí. Es una alternativa aplicada directamente sobre el balde. La preparación y viabilidad se confirman después de revisar su condición.</p></details><details><summary>¿Se puede aplicar para restaurar un balde usado?</summary><p>Depende del daño. Primero se revisan corrosión, golpes, pintura suelta y reparaciones previas para definir qué debe corregirse antes del recubrimiento.</p></details><details><summary>¿Es lo mismo que brea o batepiedra?</summary><p>No necesariamente. Esos nombres agrupan productos y usos diferentes. Maxlining es un sistema de poliuretano aplicado profesionalmente; conviene comparar sustrato, preparación, uso esperado y mantenimiento.</p></details></div></section>`,
  },
  {
    slug: "accesorios",
    title: "Poliuretano para Accesorios 4x4 | Maxlining Ecuador",
    description: "Protección Maxlining para accesorios 4x4 seleccionados: bumpers, rollbars, estribos, racks y piezas metálicas. Evaluación y aplicación profesional.",
    kicker: "MAXLINING / ACCESORIOS 4X4",
    headline: "El accesorio recibe golpes.<span>La protección también.</span>",
    lead: "Evaluamos piezas metálicas de uso real para definir si Maxlining es compatible con su geometría, sustrato, anclajes y función.",
    image: firstMedia("frontProtection"),
    imageAlt: "Fabricación y acabado de componentes metálicos",
    primary: { label: "Evaluar mi accesorio", href: whatsapp("Hola Maxmotor 4x4, quiero evaluar un accesorio para recubrimiento Maxlining. Accesorio: ___ Material: ___"), external: true },
    secondary: { label: "Ver piezas", href: "#piezas" },
    body: `
      <section class="maxlining-story" id="piezas"><div class="maxlining-shell maxlining-story__lead"><div><p class="maxlining-kicker">01 / EQUIPAMIENTO</p><h2>Protección donde<br>sí tiene sentido.</h2></div><p>No todo accesorio debe recubrirse. Revisamos zonas de montaje, roscas, tolerancias, soldaduras y superficies funcionales para proteger únicamente lo que puede recibir la aplicación sin comprometer el ensamble.</p></div><div class="maxlining-use-grid maxlining-shell"><article><span>01</span><h3>Bumpers y defensas</h3><p>Superficies expuestas a roce, trabajo y condiciones exteriores.</p></article><article><span>02</span><h3>Rollbars y racks</h3><p>Acabado texturizado para componentes de carga y estructura auxiliar.</p></article><article><span>03</span><h3>Estribos y sliders</h3><p>Evaluación de áreas de apoyo, anclajes y zonas que deben quedar libres.</p></article></div></section>
      <section class="maxlining-split"><img src="${mediaUrl("recubrimiento_de_poliuretano.webp")}" alt="Accesorio protegido con recubrimiento de poliuretano Maxlining" loading="lazy" width="1500" height="1000"><div><p class="maxlining-kicker">02 / CRITERIO TÉCNICO</p><h2>Función antes que apariencia.</h2><ul><li>Confirmamos material y recubrimientos existentes.</li><li>Protegemos roscas, alojamientos y puntos de ajuste.</li><li>Definimos desmontaje e instalación antes de aplicar.</li><li>Inspeccionamos cobertura y función al terminar.</li></ul><a class="maxlining-button" href="/maxlining/industrial">Ver aplicaciones industriales <b>→</b></a></div></section>`,
  },
  {
    slug: "industrial",
    title: "Recubrimientos de Poliuretano Industrial | Maxlining Ecuador",
    description: "Evaluación de recubrimiento Maxlining para flotas, rampas, contenedores, maquinaria y superficies industriales expuestas a fricción y humedad.",
    kicker: "MAXLINING / INDUSTRIA Y FLOTAS",
    headline: "Protección para activos.<span>No decoración industrial.</span>",
    lead: "Analizamos sustrato, exposición, operación y mantenimiento antes de proponer una aplicación para superficies o equipos de trabajo.",
    image: mediaUrl("recubrimiento_de_poliuretano_industrial.webp"),
    imageAlt: "Planta industrial con maquinaria y superficies operativas",
    primary: { label: "Solicitar evaluación B2B", href: whatsapp("Hola Maxmotor 4x4, necesito evaluar una aplicación industrial Maxlining. Superficie: ___ Uso: ___ Ubicación: ___"), external: true },
    secondary: { label: "Ver aplicaciones", href: "#industria" },
    body: `
      <section class="maxlining-story" id="industria"><div class="maxlining-shell maxlining-story__lead"><div><p class="maxlining-kicker">01 / ALCANCE INDUSTRIAL</p><h2>El sustrato decide<br>el proceso.</h2></div><p>Metal, concreto, madera u otros materiales no se preparan igual. Tampoco es lo mismo una rampa, un contenedor o una zona de carga. La visita técnica define compatibilidad, preparación, límites y condiciones de servicio.</p></div><div class="maxlining-use-grid maxlining-shell"><article><span>01</span><h3>Transporte y flotas</h3><p>Áreas de carga y componentes expuestos a operación repetitiva.</p></article><article><span>02</span><h3>Maquinaria</h3><p>Piezas y zonas no críticas seleccionadas después de revisar función y mantenimiento.</p></article><article><span>03</span><h3>Infraestructura</h3><p>Rampas, contenedores y superficies que requieren diagnóstico en sitio.</p></article></div></section>
      <section class="maxlining-split"><img src="${mediaUrl("recubrimiento_de_poliuretano_industrial.webp")}" alt="Aplicación industrial de recubrimiento de poliuretano Maxlining" loading="lazy" width="1500" height="1000"><div><p class="maxlining-kicker">02 / BRIEFING B2B</p><h2>Cuatro datos para empezar.</h2><ul><li>Material y dimensiones aproximadas.</li><li>Tipo de desgaste o exposición.</li><li>Condición actual y reparaciones previas.</li><li>Volumen, ubicación y ventana de trabajo.</li></ul><a class="maxlining-button" href="/ingenieria">Conocer ingeniería Maxmotor <b>→</b></a></div></section>`,
  },
  {
    slug: "comparacion",
    title: "Maxlining vs Balde Plástico, Brea y Batepiedra",
    description: "Compara recubrimiento de poliuretano Maxlining, protector plástico, pintura, brea y batepiedra para elegir la protección adecuada para tu balde.",
    kicker: "MAXLINING / GUÍA DE DECISIÓN",
    headline: "No toda protección<span>resuelve lo mismo.</span>",
    lead: "Compara por integración, preparación, inspección y uso esperado. Una decisión honesta empieza por entender qué problema necesitas resolver.",
    image: mediaUrl("recubrimiento_poliuretano_mitsubishi.webp"),
    imageAlt: "Camioneta 4x4 utilizada en condiciones exigentes",
    primary: { label: "Pedir recomendación", href: whatsapp("Hola Maxmotor 4x4, quiero comparar opciones de protección para el balde de mi camioneta. Uso: ___ Modelo: ___"), external: true },
    secondary: { label: "Ver comparación", href: "#comparar" },
    body: `
      <section class="maxlining-comparison" id="comparar"><div class="maxlining-shell"><p class="maxlining-kicker">01 / COMPARACIÓN FUNCIONAL</p><h2>Elige por tu uso.</h2><div class="maxlining-table-wrap"><table><thead><tr><th>Criterio</th><th>Plástico / cobertor</th><th>Brea, pintura o batepiedra</th><th>Maxlining</th></tr></thead><tbody><tr><td>Integración</td><td>Pieza independiente o removible.</td><td>Capa aplicada; desempeño variable según producto.</td><td>Capa de poliuretano aplicada a la geometría.</td></tr><tr><td>Preparación</td><td>Depende del montaje y limpieza.</td><td>Depende del sistema y del aplicador.</td><td>Diagnóstico, preparación y enmascarado definidos.</td></tr><tr><td>Inspección</td><td>Puede requerir desmontaje para revisar debajo.</td><td>Revisión visual de adherencia y desgaste.</td><td>Revisión visual; reparabilidad se evalúa por daño.</td></tr><tr><td>Mejor escenario</td><td>Quien prioriza una pieza desmontable.</td><td>Protección básica o uso específico del producto.</td><td>Quien busca una superficie continua para carga y trabajo.</td></tr></tbody></table></div><p class="maxlining-table-note">La tabla describe diferencias generales, no reemplaza la inspección del vehículo ni la ficha técnica de cada producto.</p></div></section>
      <section class="maxlining-faq"><div class="maxlining-shell"><p class="maxlining-kicker">02 / DECISIÓN INFORMADA</p><h2>Preguntas antes de elegir.</h2><details><summary>¿Un balde plástico es siempre una mala opción?</summary><p>No. Puede ser útil si buscas una solución desmontable. Conviene revisar ajuste, movimiento y limpieza debajo de la pieza.</p></details><details><summary>¿Batepiedra y poliuretano son lo mismo?</summary><p>No debe asumirse. “Batepiedra” se usa para productos de composiciones y prestaciones distintas. Pide siempre la ficha técnica y el proceso de preparación.</p></details><details><summary>¿Maxlining se aplica sobre óxido?</summary><p>No se debe ocultar corrosión activa. El balde se inspecciona y se define la corrección necesaria antes de aplicar.</p></details></div></section>`,
    schemaType: "WebPage",
  },
  {
    slug: "aplicador",
    title: "Ser Aplicador Maxlining en Ecuador | Red Técnica",
    description: "Postula para operar como aplicador Maxlining. Evaluamos infraestructura, seguridad, disciplina de proceso y capacidad de atención en tu ciudad.",
    kicker: "RED MAXLINING / APLICADORES",
    headline: "Aplica el sistema.<span>Respeta el proceso.</span>",
    lead: "Buscamos talleres con infraestructura, orden operativo y compromiso técnico. Ser aplicador no es comprar material: es ejecutar un método controlado.",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1900&q=84",
    imageAlt: "Técnico trabajando con equipo de protección en un taller",
    primary: { label: "Postular como aplicador", href: whatsapp("Hola Maxmotor 4x4, quiero postular como aplicador Maxlining. Ciudad: ___ Taller/empresa: ___ Experiencia: ___"), external: true },
    secondary: { label: "Conocer requisitos", href: "#requisitos" },
    body: `
      <section class="maxlining-story" id="requisitos"><div class="maxlining-shell maxlining-story__lead"><div><p class="maxlining-kicker">01 / PERFIL OPERATIVO</p><h2>No buscamos volumen.<br>Buscamos consistencia.</h2></div><p>La evaluación considera espacio de trabajo, preparación de superficies, control de contaminación, protección personal, disciplina de registro y capacidad de atención. La aprobación depende de una revisión técnica y comercial.</p></div><div class="maxlining-use-grid maxlining-shell"><article><span>01</span><h3>Infraestructura</h3><p>Zona de preparación y aplicación compatible con el proceso y la seguridad.</p></article><article><span>02</span><h3>Equipo humano</h3><p>Responsables capaces de seguir procedimientos y documentar cada trabajo.</p></article><article><span>03</span><h3>Mercado local</h3><p>Capacidad real de atender vehículos, flotas o industria en su zona.</p></article></div></section>
      <section class="maxlining-network"><div class="maxlining-shell"><p class="maxlining-kicker">02 / RUTA DE EVALUACIÓN</p><h2>De la postulación<br>a la primera aplicación.</h2><ol><li><span>01</span><strong>Perfil</strong><p>Ciudad, experiencia, taller y capacidad comercial.</p></li><li><span>02</span><strong>Evaluación</strong><p>Revisión técnica, seguridad e infraestructura disponible.</p></li><li><span>03</span><strong>Formación</strong><p>Proceso, preparación, aplicación, control y registro.</p></li><li><span>04</span><strong>Seguimiento</strong><p>Acompañamiento inicial y control de consistencia.</p></li></ol><p class="maxlining-disclosure">La red Maxlining es independiente. Esta invitación no constituye una franquicia LINE-X ni una promesa de territorio, rentabilidad o aprobación automática.</p></div></section>`,
  },
  {
    slug: "distribuidor",
    title: "Abrir una Sede Maxlining | Distribución en Ecuador",
    description: "Postula para abrir una sede o representar Maxlining en tu ciudad. Modelo para talleres, concesionarios y empresas con capacidad comercial y técnica.",
    kicker: "RED MAXLINING / SEDES Y DISTRIBUCIÓN",
    headline: "Tu ciudad.<span>Una sede de protección real.</span>",
    lead: "Evaluamos aliados que puedan desarrollar mercado, atender clientes y sostener una experiencia coherente. El modelo se define según capacidad técnica y comercial.",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1900&q=84",
    imageAlt: "Taller automotriz profesional preparado para atender clientes",
    primary: { label: "Proponer mi ciudad", href: whatsapp("Hola Maxmotor 4x4, quiero evaluar una sede o distribución Maxlining. Ciudad: ___ Empresa: ___ Tipo de operación: ___"), external: true },
    secondary: { label: "Ver modelos", href: "#modelos" },
    body: `
      <section class="maxlining-story" id="modelos"><div class="maxlining-shell maxlining-story__lead"><div><p class="maxlining-kicker">01 / DOS FORMAS DE CRECER</p><h2>Sede operativa<br>o aliado comercial.</h2></div><p>Una sede ejecuta y atiende. Un distribuidor identifica oportunidades y coordina con un punto técnico aprobado. No asignamos un modelo hasta entender la ciudad, la infraestructura y la capacidad de servicio.</p></div><div class="maxlining-use-grid maxlining-shell"><article><span>01</span><h3>Sede aplicadora</h3><p>Cuenta con operación técnica, atención y capacidad de ejecutar el proceso.</p></article><article><span>02</span><h3>Distribuidor</h3><p>Desarrolla clientes y coordina la ejecución con una sede o equipo autorizado.</p></article><article><span>03</span><h3>Alianza B2B</h3><p>Concesionarios, flotas o industrias con proyectos recurrentes y alcance definido.</p></article></div></section>
      <section class="maxlining-network"><div class="maxlining-shell"><p class="maxlining-kicker">02 / FILTRO DE RED</p><h2>Crecer sin perder<br>el estándar.</h2><ol><li><span>01</span><strong>Ciudad</strong><p>Demanda, cobertura actual y perfil del mercado.</p></li><li><span>02</span><strong>Capacidad</strong><p>Equipo, infraestructura, ventas y servicio posventa.</p></li><li><span>03</span><strong>Modelo</strong><p>Sede, distribución o alianza según la evaluación.</p></li><li><span>04</span><strong>Acuerdo</strong><p>Alcance, responsabilidades y lanzamiento definidos por escrito.</p></li></ol><p class="maxlining-disclosure">La postulación no garantiza exclusividad, territorio, rentabilidad ni aprobación. Maxlining es una línea independiente de Maxmotor y no una franquicia LINE-X.</p></div></section>`,
  },
];

await Promise.all(pages.map(({ slug, ...config }) => {
  const html = page({ slug, ...config }).replace(/^[ \t]+$/gm, "");
  return writeFile(resolve(output, `${slug}.html`), html, "utf8");
}));
console.log(`Generated ${pages.length} Maxlining ecosystem pages`);
