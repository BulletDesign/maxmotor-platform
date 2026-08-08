export const INVENTORY_CATEGORIES = {
  covers: {
    label: "Tapas de balde",
    image: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_tapa_trifold.jpeg",
    copy: "Protección y cierre del balde según medida, cabina y generación.",
  },
  bedProtection: {
    label: "Protectores de balde",
    image: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_seguro.jpeg",
    copy: "Soluciones para proteger la zona de carga del trabajo y el clima.",
  },
  bedAccessories: {
    label: "Accesorios de balde",
    image: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/banner2.png",
    copy: "Apertura, seguridad y componentes funcionales para la zona de carga.",
  },
  suspension: {
    label: "Suspensión y control",
    image: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/suspension_2.jpeg",
    copy: "Componentes de altura, soporte de carga y respuesta del vehículo.",
  },
  towing: {
    label: "Tiro y remolque",
    image: "https://images.pexels.com/photos/33566025/pexels-photo-33566025.jpeg?auto=compress&cs=tinysrgb&w=1200",
    copy: "Accesorios para remolque y transporte con aplicación validada.",
  },
  steps: {
    label: "Estribos y acceso",
    image: "https://images.pexels.com/photos/12138568/pexels-photo-12138568.jpeg?auto=compress&cs=tinysrgb&w=1200",
    copy: "Acceso lateral y protección para uso diario, trabajo o aventura.",
  },
  lighting: {
    label: "Iluminación",
    image: "https://images.pexels.com/photos/7127593/pexels-photo-7127593.jpeg?auto=compress&cs=tinysrgb&w=1200",
    copy: "Faros, neblineros y soluciones auxiliares para mejorar visibilidad.",
  },
  electrical: {
    label: "Eléctrico y controles",
    image: "https://images.pexels.com/photos/7127593/pexels-photo-7127593.jpeg?auto=compress&cs=tinysrgb&w=1200",
    copy: "Controles e interfaces eléctricas para accesorios instalados.",
  },
  cargo: {
    label: "Carga y techo",
    image: "https://images.pexels.com/photos/28639111/pexels-photo-28639111.jpeg?auto=compress&cs=tinysrgb&w=1200",
    copy: "Organización de carga y soportes para trabajo, viaje y overland.",
  },
  rollbars: {
    label: "Rollbars",
    image: "https://images.pexels.com/photos/13644357/pexels-photo-13644357.jpeg?auto=compress&cs=tinysrgb&w=1200",
    copy: "Estructuras para el balde con configuración específica por camioneta.",
  },
  exterior: {
    label: "Exterior y carrocería",
    image: "https://images.pexels.com/photos/5628354/pexels-photo-5628354.jpeg?auto=compress&cs=tinysrgb&w=1200",
    copy: "Protección, aerodinámica y acabados exteriores para cada proyecto.",
  },
  interior: {
    label: "Interior y tecnología",
    image: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/banner3.png",
    copy: "Confort, conectividad y protección dentro de la cabina.",
  },
  performance: {
    label: "Motor y desempeño",
    image: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/suspension_2.jpeg",
    copy: "Componentes seleccionados para respiración y respuesta del vehículo.",
  },
  specific: {
    label: "Otros accesorios",
    image: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/banner2.png",
    copy: "Piezas identificadas en catálogo para una aplicación determinada.",
  },
};

const INVENTORY_CATEGORY_ORDER = [
  "covers", "bedProtection", "bedAccessories", "cargo", "rollbars", "steps",
  "towing", "suspension", "lighting", "electrical", "exterior", "interior",
  "performance", "specific",
];

const PUBLIC_BRANDS = [
  ["OLD MAN EMU", "Old Man Emu"],
  ["TOUGH DOG", "Tough Dog"],
  ["ROLL N LOCK", "Roll-N-Lock"],
  ["AMP RESEARCH", "AMP Research"],
  ["LIGHTFORCE", "Lightforce"],
  ["MAXMOTOR", "Maxmotor"],
  ["MAXLINER", "Maxliner"],
  ["CARRYBOY", "Carryboy"],
  ["BULL RING", "Bull Ring"],
  ["SUS TEC", "Sus-Tec"],
  ["PROCOMP", "Pro Comp"],
  ["DAYSTAR", "Daystar"],
  ["MY ROAD", "My Road"],
  ["PENTAIR", "Pentair"],
  ["HUSKY", "Husky"],
  ["SPIDER", "Spider"],
  ["TUCCI", "Tucci"],
  ["RHINO", "Rhino"],
  ["WIMBO", "Wimbo"],
  ["THULE", "Thule"],
  ["RANCHO", "Rancho"],
  ["TJM", "TJM"],
  ["KEKO", "Keko"],
  ["DLAA", "DLAA"],
  ["K N", "K&N"],
  ["TNN", "TNN"],
];

const vehicleRules = [
  { slug: "chevrolet-dmax", any: ["DMAX", "D MAX"], none: ["ISUZU"] },
  { slug: "isuzu-dmax", all: ["ISUZU"], any: ["DMAX", "D MAX"] },
  { slug: "chevrolet-colorado", any: ["COLORADO"] },
  { slug: "chevrolet-silverado", any: ["SILVERADO"] },
  { slug: "toyota-hilux", any: ["HILUX", "REVO", "VIGO"] },
  { slug: "toyota-tacoma", any: ["TACOMA"] },
  { slug: "toyota-tundra", any: ["TUNDRA"] },
  { slug: "ford-ranger", any: ["RANGER", "RANGER23", "RANGER24"] },
  { slug: "ford-f150", any: ["F150", "F 150"] },
  { slug: "ford-maverick", any: ["MAVERICK"] },
  { slug: "nissan-frontier", any: ["FRONTIER", "NAVARA", "NP300"] },
  { slug: "mitsubishi-l200-triton", any: ["L200", "TRITON"] },
  { slug: "mazda-bt50", any: ["BT50", "BT 50"] },
  { slug: "gwm-poer", any: ["POER"] },
  { slug: "gwm-wingle", any: ["WINGLE"] },
  { slug: "jac-t6", all: ["JAC", "T6"] },
  { slug: "jac-t8", all: ["JAC", "T8"] },
  { slug: "jac-t9", all: ["JAC", "T9"] },
  { slug: "jmc-vigus", any: ["VIGUS"] },
  { slug: "foton-tunland", any: ["TUNLAND"] },
  { slug: "dongfeng-rich6", any: ["RICH6", "RICH 6"] },
  { slug: "dongfeng-rich7", any: ["RICH7", "RICH 7"] },
  { slug: "dongfeng-z9", all: ["DONGFENG", "Z9"] },
  { slug: "kia-tasman", any: ["TASMAN"] },
  { slug: "volkswagen-amarok", any: ["AMAROK"] },
  { slug: "ram-700", all: ["RAM", "700"] },
  { slug: "ram-1000", all: ["RAM", "1000"] },
  { slug: "ram-1500", all: ["RAM", "1500"] },
  { slug: "changan-hunter", any: ["HUNTER"] },
  { slug: "maxus-t60", any: ["T60"] },
  { slug: "maxus-t90", any: ["T90"] },
  { slug: "peugeot-landtrek", any: ["LANDTREK"] },
  { slug: "renault-oroch", any: ["OROCH"] },
  { slug: "fiat-titano", any: ["TITANO"] },
  { slug: "shineray-t30-t32", all: ["SHINERAY"], any: ["T30", "T32"] },
];

export function normalizeInventoryText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\uFFFD/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function publicBrand(value) {
  return PUBLIC_BRANDS.find(([marker]) => containsPhrase(value, marker))?.[1] || "";
}

function branded(label, value) {
  const brand = publicBrand(value);
  return brand ? `${label} ${brand}` : label;
}

export function publicInventoryName(name, category = classifyInventoryItem(name)) {
  const value = normalizeInventoryText(name);

  if (category === "covers") {
    let label = "Tapa de balde rígida";
    if (/\bCORREDIZA\b.*\bELECTRICA\b/.test(value)) label = "Tapa de balde corrediza eléctrica";
    else if (/\bCORREDIZA\b.*\bMANUAL\b/.test(value)) label = "Tapa de balde corrediza manual";
    else if (/\bLONA\b/.test(value)) label = "Tapa de balde de lona";
    else if (/\b4 PARTES?\b|\b4PARTES\b/.test(value)) label = "Tapa rígida plegable de 4 partes";
    else if (/\b3 PARTES?\b|\b3PARTES\b/.test(value)) label = "Tapa rígida plegable de 3 partes";
    else if (/\bPLEGABLE\b/.test(value)) label = "Tapa rígida plegable";
    if (/\bCON LUZ\b/.test(value)) label += " con iluminación integrada";
    return branded(label, value);
  }

  if (category === "bedProtection") {
    return branded(/\bPLASTICO\b/.test(value) ? "Protector plástico de balde" : "Protector de balde", value);
  }

  if (category === "bedAccessories") {
    if (/\bAMORT\w*\b.*\bCOMPUERTA\b/.test(value)) return branded("Amortiguador de compuerta", value);
    if (/\bSEGURO\b.*\bCOMPUERTA\b/.test(value)) return branded("Seguro de compuerta", value);
    if (/\bGANCHO DE BALDE\b/.test(value)) return branded("Anclaje para balde", value);
    if (/\bVIDRIO\b.*\bCORREDIZO\b/.test(value)) return branded("Vidrio posterior corredizo", value);
    if (/\bVIDRIO\b|\bCOMPUERTA DE CASETA\b/.test(value)) return branded("Compuerta de caseta", value);
    return branded("Accesorio funcional de balde", value);
  }

  if (category === "cargo") {
    if (/\bCARGO MANAGER\b|\bSEPARADOR DE CARGA\b/.test(value)) return branded("Separador de carga", value);
    if (/\bBARRA DE TECHO\b|\bLARGUERO\b/.test(value)) return branded("Barras de techo", value);
    if (/\bTHULE\b/.test(value)) return branded("Kit de montaje para barras de techo", value);
    return branded("Sistema de carga", value);
  }

  if (category === "suspension") {
    if (/\bSEMI KIT\b/.test(value)) return branded("Semi kit de suspensión", value);
    if (/\bKIT DE SUSPENSION\b|\bKIT SUSPENSION\b/.test(value)) return branded("Kit de suspensión", value);
    if (/\bKIT DE NIVELACION\b/.test(value)) return branded("Kit de nivelación", value);
    if (/\bKIT DE ALTURA\b|\bKIT DE ALZAS\b/.test(value)) return branded("Kit de altura", value);
    if (/\bBRAZOS? DE CONTROL\b/.test(value)) return branded("Brazos de control", value);
    if (/\bBARRA ESTABILIZADORA\b/.test(value)) return branded("Barra estabilizadora", value);
    if (/\bESPIRALES?\b/.test(value)) return branded("Espirales delanteros", value);
    if (/\bAMORT\w*\b.*\bDEL\w*\b/.test(value)) return branded("Amortiguadores delanteros", value);
    if (/\bAMORT\w*\b.*\bPOST\w*\b/.test(value)) return branded("Amortiguadores posteriores", value);
    if (/\bKIT DE BUJES\b/.test(value)) return branded("Kit de bujes de suspensión", value);
    if (/\bBUJE\b/.test(value)) return branded("Buje de suspensión", value);
    if (/\bABRAZADERA\b/.test(value)) return branded("Abrazaderas para paquetes", value);
    if (/\bPAQUETE\b/.test(value)) return branded("Paquetes de suspensión", value);
    if (/\bSCHAKLE\b|\bCOLGANTES?\b/.test(value)) return branded("Grilletes de suspensión", value);
    return branded("Componente de suspensión", value);
  }

  if (category === "towing") return branded("Barra de tiro", value);

  if (category === "steps") {
    if (/\bELECTRICO\b/.test(value)) return branded("Estribos eléctricos", value);
    if (/\bPISADERA POSTERIOR\b/.test(value)) return branded("Pisadera posterior lateral", value);
    if (/\bPROTECTORES? DE ESTRIBOS?\b/.test(value)) return branded("Protectores de estribos", value);
    if (/\bTUBULAR\b/.test(value)) return branded("Estribos tubulares", value);
    if (/\bINTEGRAL\b/.test(value)) return branded("Estribos integrales", value);
    if (/\bBASES?\b/.test(value)) return branded("Kit de bases para estribos", value);
    return branded("Estribos laterales", value);
  }

  if (category === "lighting") {
    if (/\bFARO POSTERIOR\b|\bFAROS POSTERIORES\b/.test(value)) return branded("Faros posteriores", value);
    if (/\bNEBLINERO\b|\bNEBLINEROS\b/.test(value)) return branded("Faros neblineros", value);
    if (/\bHALOGENO\b|\bHALOGENOS\b/.test(value)) return branded("Faros halógenos", value);
    return branded("Faros LED", value);
  }

  if (category === "electrical") return branded("Control eléctrico para accesorios", value);

  if (category === "rollbars") {
    if (/\bDOBLE TUBO\b/.test(value)) return branded("Rollbar de doble tubo", value);
    if (/\bK1\b/.test(value)) return branded("Rollbar K1", value);
    if (/\bK3\b/.test(value)) return branded("Rollbar K3", value);
    return branded("Rollbar", value);
  }

  if (category === "exterior") {
    if (/\bBODY KIT\b/.test(value)) return branded("Body kit", value);
    if (/\bCUBRELLUVIAS\b/.test(value)) return branded("Cubreluvias", value);
    if (/\bOVERFENDER\b|\bOVERFENDERS\b/.test(value)) return branded("Overfenders", value);
    if (/\bSNORKEL\b/.test(value)) return branded("Snorkel", value);
    if (/\bMASCARILLA\b/.test(value)) return branded("Mascarilla frontal", value);
    if (/\bMOLDURAS?\b/.test(value)) return branded("Molduras exteriores", value);
    if (/\bMANIJAS?\b|\bABREPUERTA\b/.test(value)) return branded("Apliques de manijas", value);
    if (/\bESPEJOS?\b/.test(value)) return branded("Apliques de espejos", value);
    if (/\bDEFENSA\b/.test(value)) return branded("Defensa delantera", value);
    if (/\bBARRA PORTA FAROS\b/.test(value)) return branded("Barra portafaros", value);
    if (/\bFAROS?\b|\bBISEL\b/.test(value)) return branded("Apliques exteriores de faros", value);
    return branded("Accesorio de carrocería", value);
  }

  if (category === "interior") {
    if (/\bRADIO\b/.test(value)) return branded("Radio multimedia", value);
    if (/\bBISEL DE TACOMETRO\b/.test(value)) return branded("Bisel de tacómetro", value);
    return branded("Moquetas termoformadas", value);
  }

  if (category === "performance") return branded("Filtro de aire de alto flujo", value);
  return "Accesorio específico";
}

function containsPhrase(text, phrase) {
  return ` ${text} `.includes(` ${normalizeInventoryText(phrase)} `);
}

function matchesRule(normalizedName, rule) {
  if (rule.none?.some((phrase) => containsPhrase(normalizedName, phrase))) return false;
  if (rule.all?.some((phrase) => !containsPhrase(normalizedName, phrase))) return false;
  return rule.any?.some((phrase) => containsPhrase(normalizedName, phrase)) ?? true;
}

export function classifyInventoryItem(name) {
  const value = normalizeInventoryText(name);
  if (/\b(AMORT\w*.*COMPUERTA|VIDRIO.*CORREDIZO|VIDRIO COMPUERTA|COMPUERTA DE CASETA|SEGURO DE COMPUERTA|GANCHO DE BALDE)\b/.test(value)) return "bedAccessories";
  if (/\bFILTRO DE AIRE\b/.test(value)) return "performance";
  if (/\bBISEL DE TACOMETRO\b/.test(value)) return "interior";
  if (/\bSWITCH\b/.test(value)) return "electrical";
  if (/\b(PROTECTOR(?:ES)? DE BALDE|BED ?LINER)\b/.test(value)) return "bedProtection";
  if (/\b(TAPA DE BALDE|TAPA RIGIDA|CUBRE BALDE)\b/.test(value)) return "covers";
  if (/\b(CROMADOS? DE FAROS?|BISEL.*FAROS?|DEFENSA.*BARRA LED|BARRA PORTA FAROS|MASCARILLA.*HALOGENOS?)\b/.test(value)) return "exterior";
  if (/\b(AMORT(?:IGUADOR(?:ES)?)?|SUSPENSION(?:ES)?|ESPIRALES?|PAQUETES?|BUJES?|BRAZOS? DE CONTROL|ESTABILIZADORA|SCHAKLE|ALZAS?|ALTURA|NIVELACION|COLGANTES?|OLD MAN EMU|TOUGH DOG|TJM)\b/.test(value)) return "suspension";
  if (/\b(BARRA DE TIRO|REMOLQUE|ACOPLES?)\b/.test(value)) return "towing";
  if (/\b(ESTRIBOS?|PISADERAS?|ROCK SLIDERS?)\b/.test(value)) return "steps";
  if (/\b(FAROS?|NEBLINEROS?|LUCES?|LED|HALOGENOS?)\b/.test(value)) return "lighting";
  if (/\b(THULE|BARRA DE TECHO|LARGUERO|CARGO|PORTA|BAUL|RACK)\b/.test(value)) return "cargo";
  if (/\b(ROLL BAR|ROLLBAR)\b/.test(value)) return "rollbars";
  if (/\b(OVERFENDERS?|DEFENSAS?|SNORKELS?|MASCARILLAS?|MOLDURAS?|CUBRELLUVIAS?|CROMADOS?|BODY KIT|PROTECTORES? DE ESTRIBOS?|MANIJAS?|ABREPUERTA|ESPEJOS?)\b/.test(value)) return "exterior";
  if (/\b(RADIOS?|MOQUETAS?|ALFOMBRAS?|PANELES?)\b/.test(value)) return "interior";
  return "specific";
}

export function parseInventoryNames(csv) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (quoted) {
        quoted = false;
      } else if (field.length === 0) {
        quoted = true;
      } else {
        field += '"';
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift()?.map((header) => header.trim().toLowerCase()) ?? [];
  const nameIndex = headers.indexOf("nomart");
  if (nameIndex === -1) throw new Error("The inventory CSV does not contain the nomart column");

  return rows
    .map((columns) => String(columns[nameIndex] ?? "").replace(/\uFFFD/g, "").replace(/[\u0000-\u001F]+/g, " ").trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

export function matchInventoryToVehicles(names) {
  const vehicles = Object.fromEntries(vehicleRules.map(({ slug }) => [slug, []]));
  const seen = Object.fromEntries(vehicleRules.map(({ slug }) => [slug, new Set()]));

  for (const name of names) {
    const normalizedName = normalizeInventoryText(name);
    for (const rule of vehicleRules) {
      if (!matchesRule(normalizedName, rule)) continue;
      const category = classifyInventoryItem(name);
      const publicName = publicInventoryName(name, category);
      const publicKey = `${category}:${normalizeInventoryText(publicName)}`;
      if (seen[rule.slug].has(publicKey)) continue;
      seen[rule.slug].add(publicKey);
      vehicles[rule.slug].push({ name: publicName, category });
    }
  }

  for (const items of Object.values(vehicles)) {
    items.sort((left, right) => INVENTORY_CATEGORY_ORDER.indexOf(left.category) - INVENTORY_CATEGORY_ORDER.indexOf(right.category) || left.name.localeCompare(right.name, "es"));
  }
  return vehicles;
}
