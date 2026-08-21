import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";
import { ECUADOR_PICKUPS, pickupName } from "../catalog/pickups.mjs";

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
  terms: [family.name, product.name, product.marca, ...(product.features || [])].filter(Boolean).join(" "),
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

const categoryEntries = [
  { type: "category", title: "Tapas de balde para camionetas", eyebrow: "Categoria", description: "Tapas rigidas, plegables, enrollables y de lona.", url: "/fichas/tapas-balde-camionetas", terms: "tapa balde cubrebalde lona trifold quadfold electrica enrollable" },
  { type: "category", title: "Recubrimiento de poliuretano Maxlining", eyebrow: "Servicio", description: "Proteccion profesional para baldes, carrocerias y superficies de trabajo.", url: "/maxlining/vehiculos", terms: "poliuretano recubrimiento balde protector batepiedra brea maxlining" },
  { type: "category", title: "Todas las camionetas", eyebrow: "Directorio", description: `${ECUADOR_PICKUPS.length} modelos organizados por marca.`, url: "/camionetas", terms: "camionetas vehiculos pickups modelos marcas ecuador" },
];

const payload = {
  counts: { vehicles: vehicleEntries.length, accessories: productEntries.length },
  entries: [...vehicleEntries, ...categoryEntries, ...productEntries],
};

await writeFile(resolve(root, "catalog/search-index.json"), JSON.stringify(payload), "utf8");
console.log(`Generated search index with ${payload.entries.length} entries`);
