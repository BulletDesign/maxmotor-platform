export const INVENTORY_CATEGORIES = {
  covers: {
    label: "Tapas de balde",
    image: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_tapa_trifold.jpeg",
    copy: "Protección y cierre del balde según medida, cabina y generación.",
  },
  bedProtection: {
    label: "Protección de balde",
    image: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/foto_seguro.jpeg",
    copy: "Soluciones para proteger la zona de carga del trabajo y el clima.",
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
    label: "Protección exterior",
    image: "https://images.pexels.com/photos/5628354/pexels-photo-5628354.jpeg?auto=compress&cs=tinysrgb&w=1200",
    copy: "Protección e integración exterior para trabajo y conducción 4x4.",
  },
  interior: {
    label: "Interior y tecnología",
    image: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/banner3.png",
    copy: "Confort, conectividad y protección dentro de la cabina.",
  },
  specific: {
    label: "Componentes específicos",
    image: "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/banner2.png",
    copy: "Piezas identificadas en catálogo para una aplicación determinada.",
  },
};

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
  if (/\b(PROTECTOR(?:ES)? DE BALDE|BED ?LINER)\b/.test(value)) return "bedProtection";
  if (/\b(TAPA DE BALDE|TAPA RIGIDA|CUBRE BALDE)\b/.test(value)) return "covers";
  if (/\b(AMORT(?:IGUADOR(?:ES)?)?|SUSPENSION(?:ES)?|ESPIRALES?|PAQUETES?|BUJES?|BRAZOS? DE CONTROL|ESTABILIZADORA|SCHAKLE|ALZAS?|ALTURA|NIVELACION|COLGANTES?|OLD MAN EMU|TOUGH DOG|TJM)\b/.test(value)) return "suspension";
  if (/\b(BARRA DE TIRO|REMOLQUE|ACOPLES?|GANCHO DE BALDE)\b/.test(value)) return "towing";
  if (/\b(ESTRIBOS?|PISADERAS?|ROCK SLIDERS?)\b/.test(value)) return "steps";
  if (/\b(FAROS?|NEBLINEROS?|LUCES?|LED|HALOGENOS?|SWITCH)\b/.test(value)) return "lighting";
  if (/\b(THULE|BARRA DE TECHO|LARGUERO|CARGO|PORTA|BAUL|RACK)\b/.test(value)) return "cargo";
  if (/\b(ROLL BAR|ROLLBAR)\b/.test(value)) return "rollbars";
  if (/\b(OVERFENDERS?|DEFENSAS?|SNORKELS?|MASCARILLAS?|MOLDURAS?|CUBRELLUVIAS?|CROMADOS?|BODY KIT|PROTECTORES? DE ESTRIBOS?)\b/.test(value)) return "exterior";
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
      if (!matchesRule(normalizedName, rule) || seen[rule.slug].has(normalizedName)) continue;
      seen[rule.slug].add(normalizedName);
      vehicles[rule.slug].push({ name, category: classifyInventoryItem(name) });
    }
  }

  for (const items of Object.values(vehicles)) {
    items.sort((left, right) => left.category.localeCompare(right.category) || left.name.localeCompare(right.name, "es"));
  }
  return vehicles;
}
