export const site = {
  name: "Maxmotor 4x4",
  legalName: "MXR Store",
  url: "https://maxmotor4x4.com",
  whatsapp: "593960855932",
  phoneAmbato: "0960855932",
  phoneQuito: "0987986672",
};

export const categories = {
  rollbars: {
    name: "Rollbars",
    eyebrow: "Proteccion posterior",
    description: "Estructuras tubulares fabricadas para elevar la presencia y funcionalidad de tu camioneta.",
  },
  frontal: {
    name: "Proteccion frontal",
    eyebrow: "Bullbars y winch bars",
    description: "Defensas de acero para mejorar proteccion, rescate y angulo de ataque fuera del asfalto.",
  },
  posterior: {
    name: "Proteccion posterior",
    eyebrow: "Enganche y remolque",
    description: "Soluciones de tiro para carga, portabicicletas y remolque segun la aplicacion del vehiculo.",
  },
  lateral: {
    name: "Proteccion lateral",
    eyebrow: "Rock sliders y estribos",
    description: "Proteccion estructural para zocalos y laterales en rutas tecnicas.",
  },
  inferior: {
    name: "Proteccion inferior",
    eyebrow: "Skid plates",
    description: "Planchas para proteger componentes criticos frente a piedras e impactos en ruta.",
  },
};

export const products = [
  {
    slug: "rollbar-hero",
    name: "Rollbar Hero",
    category: "rollbars",
    vehicle: "Hilux Revo",
    summary: "Diseno aerodinamico premium con estructura tubular de acero, base portafocos y placa insignia lateral.",
    details: [
      "Estructura tubular en acero de alta resistencia.",
      "Base portafocos integrada.",
      "Anclajes directos al balde.",
    ],
    images: [
      "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_overland.webp",
    ],
    variants: [
      { name: "Negro mate", price: 290 },
      { name: "Texturizado batepiedra", price: 340 },
    ],
  },
  {
    slug: "rollbar-rr1",
    name: "Rollbar RR1",
    category: "rollbars",
    vehicle: "D-Max 4x4",
    summary: "Rollbar overland de doble viga angular con parrilla superior para transportar equipo de aventura.",
    details: ["Doble viga angular.", "Parrilla superior de carga.", "Configuracion de perfil bajo."],
    images: [
      "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_overland.webp",
    ],
    variants: [
      { name: "Negro mate", price: 310 },
      { name: "Texturizado batepiedra", price: 360 },
    ],
  },
  {
    slug: "rollbar-hummer",
    name: "Rollbar Hummer",
    category: "rollbars",
    vehicle: "Ford Ranger",
    summary: "Formato tipo jaula con presencia extrema, tubos reforzados y acabado texturizado de alta densidad.",
    details: ["Formato tipo jaula.", "Tubos reforzados.", "Proteccion volumetrica para el balde."],
    images: ["https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_overland.webp"],
    variants: [
      { name: "Negro mate", price: 330 },
      { name: "Texturizado batepiedra", price: 380 },
    ],
  },
  {
    slug: "bullbar-overland",
    name: "Bullbar Overland",
    category: "frontal",
    vehicle: "Hilux Revo",
    summary: "Defensa integral de acero con tubo overrider, preparada para integrar wincha y puntos de recuperacion.",
    details: ["Acero al carbon plegado.", "Base para wincha de hasta 12.000 lb.", "Anclajes directos al chasis."],
    images: [
      "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_overland.webp",
    ],
    variants: [
      { name: "Negro mate", price: 650 },
      { name: "Texturizado batepiedra", price: 700 },
    ],
  },
  {
    slug: "bullbar-raptor",
    name: "Bullbar Raptor",
    category: "frontal",
    vehicle: "Ford F-150",
    summary: "Defensa de perfil bajo y apariencia agresiva para mejorar el angulo de ataque e integrar iluminacion.",
    details: ["Perfil bajo tipo stubby.", "Espacios para luces exploradoras.", "Diseno orientado a rutas tecnicas."],
    images: [
      "https://images.pexels.com/photos/9331954/pexels-photo-9331954.jpeg?auto=compress&cs=tinysrgb&w=1600",
    ],
    variants: [
      { name: "Negro mate", price: 720 },
      { name: "Texturizado batepiedra", price: 780 },
    ],
  },
  {
    slug: "tiro-estandar",
    name: "Barra de Tiro Estandar",
    category: "posterior",
    vehicle: "D-Max 2024",
    summary: "Barra de tiro clase III con receptor de 2 pulgadas para remolque ligero y portabicicletas.",
    details: ["Receptor estandarizado de 2 pulgadas.", "Tubo principal de acero.", "Aplicacion para carga y remolque ligero."],
    images: ["https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_seguro.jpeg"],
    variants: [{ name: "Estandar", price: 180 }],
  },
  {
    slug: "tiro-hd",
    name: "Barra de Tiro Heavy Duty",
    category: "posterior",
    vehicle: "Land Cruiser",
    summary: "Sistema reforzado para aplicaciones de arrastre exigentes con receptor estandarizado.",
    details: ["Configuracion clase IV.", "Orejas de arrastre reforzadas.", "Aplicacion para remolque pesado."],
    images: [
      "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_seguro.jpeg",
    ],
    variants: [{ name: "Tiro pesado", price: 250 }],
  },
  {
    slug: "estribos-rock",
    name: "Estribos Rock Sliders",
    category: "lateral",
    vehicle: "Toyota Tacoma",
    summary: "Rieles laterales estructurales para proteger paneles y apoyar maniobras en terrenos inclinados.",
    details: ["Estructura tubular.", "Proteccion de zocalos y puertas.", "Fabricacion segun aplicacion."],
    images: ["https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_seguro.jpeg"],
    variants: [{ name: "Tubular", price: 250 }],
  },
  {
    slug: "carter-acero",
    name: "Protector de Carter 3 mm",
    category: "inferior",
    vehicle: "Mazda BT-50",
    summary: "Plancha de acero para proteger el carter frente a piedras e impactos directos durante la ruta.",
    details: ["Acero de 3 mm.", "Pintura anticorrosiva.", "Aberturas de ventilacion."],
    images: ["https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_seguro.jpeg"],
    variants: [{ name: "Rojo o negro", price: 150 }],
  },
  {
    slug: "carter-aluminio",
    name: "Protector Inferior TRD",
    category: "inferior",
    vehicle: "Toyota TRD Pro",
    summary: "Proteccion inferior en aleacion ligera para reducir peso sin renunciar a cobertura en ruta.",
    details: ["Aleacion de aluminio.", "Diseno de bajo peso.", "Aplicacion para plataforma TRD."],
    images: [
      "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_seguro.jpeg",
    ],
    variants: [{ name: "Aluminio", price: 280 }],
  },
];
