import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";
import { ECUADOR_PICKUPS, pickupName } from "../catalog/pickups.mjs";
import { ELECTRIFIED_VEHICLES, electrifiedName } from "../catalog/electrified-vehicles.mjs";

const root = resolve(import.meta.dirname, "..");
const familySource = await readFile(resolve(root, "catalog/families.js"), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(familySource, context);

const families = context.window.MAXMOTOR_FAMILIES;
const inventory = JSON.parse(await readFile(resolve(root, "catalog/inventory-compatible.json"), "utf8"));

const productEntries = families.flatMap((family) => family.products.map((product) => ({
  type: "accessory",
  title: product.name,
  eyebrow: family.name,
  description: product.summary,
  url: product.landing || `/fichas/${product.slug}`,
  image: product.image,
  terms: [family.name, product.name, product.seoName, product.marca, ...(product.searchTerms || []), ...(product.features || [])].filter(Boolean).join(" "),
})));

const vehicleEntries = ECUADOR_PICKUPS.map((pickup) => {
  const compatible = inventory.vehicles?.[pickup.slug] || [];
  return {
    type: "vehicle",
    title: pickupName(pickup),
    eyebrow: "Camioneta",
    description: compatible.length
      ? `${compatible.length} ${compatible.length === 1 ? "referencia compatible registrada" : "referencias compatibles registradas"} y equipamiento recomendado.`
      : "Accesorios y equipamiento recomendados con validacion por version.",
    url: `/camionetas/${pickup.slug}`,
    count: compatible.length,
    terms: [pickup.brand, pickup.model, ...(pickup.aliases || []), ...compatible.flatMap((item) => [item.name, item.category])].join(" "),
  };
});

const electrifiedEntries = ELECTRIFIED_VEHICLES.map((vehicle) => ({
  type: "electrified",
  title: electrifiedName(vehicle),
  eyebrow: vehicle.powertrain,
  description: "Barras de tiro, portabicicletas, carga, protección y accesorios con integración no invasiva.",
  url: `/hibridos/${vehicle.slug}`,
  image: vehicle.image,
  terms: [vehicle.brand, vehicle.model, vehicle.powertrain, "hibrido electrico accesorios barra tiro portabicicletas parrilla estribos proteccion"].join(" "),
}));

const categoryEntries = [
  { type: "category", title: "Tapas de balde para camionetas", eyebrow: "Categoria", description: "Tapas rigidas, plegables, enrollables y de lona.", url: "/fichas/tapas-balde-camionetas", terms: "tapa balde cubrebalde lona trifold quadfold electrica enrollable" },
  { type: "category", title: "Recubrimiento de poliuretano Maxlining", eyebrow: "Servicio", description: "Proteccion profesional para baldes, carrocerias y superficies de trabajo.", url: "/maxlining/vehiculos", terms: "poliuretano recubrimiento balde protector batepiedra brea maxlining" },
  { type: "category", title: "Todas las camionetas", eyebrow: "Directorio", description: `${ECUADOR_PICKUPS.length} modelos organizados por marca.`, url: "/camionetas", terms: "camionetas vehiculos pickups modelos marcas ecuador" },
  { type: "category", title: "Híbridos y eléctricos", eyebrow: "Directorio", description: `${ELECTRIFIED_VEHICLES.length} modelos electrificados organizados por marca.`, url: "/hibridos", terms: "hibridos electricos deepal geely suzuki changan byd ecuador" },
  { type: "category", title: "Bumpers, bullbars y guardachoques metálicos", eyebrow: "Protección frontal", description: "Soluciones de acero desarrolladas por vehículo para trabajo, flota y aventura.", url: "/fichas/bumpers-bullbars-guardachoques", terms: "bumper metalico bumpers metalicos bullbar bullbars metalicos guardachoque guardachoques parachoque defensa frontal acero 4x4 ecuador" },
];

const payload = {
  counts: { vehicles: vehicleEntries.length, electrified: electrifiedEntries.length, accessories: productEntries.length },
  entries: [...vehicleEntries, ...electrifiedEntries, ...categoryEntries, ...productEntries],
};

await writeFile(resolve(root, "catalog/search-index.json"), JSON.stringify(payload), "utf8");
console.log(`Generated search index with ${payload.entries.length} entries`);
