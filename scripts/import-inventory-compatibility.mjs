import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { matchInventoryToVehicles, parseInventoryNames } from "./inventory-compatibility.mjs";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, process.argv[2] || "CSV_MAXMOTOR.csv");
const destination = resolve(root, "catalog", "inventory-compatible.json");
const names = parseInventoryNames(await readFile(source, "utf8"));
const vehicles = matchInventoryToVehicles(names);
const matchedReferences = Object.values(vehicles).reduce((total, items) => total + items.length, 0);
const matchedVehicles = Object.values(vehicles).filter((items) => items.length).length;

await writeFile(destination, `${JSON.stringify({ vehicles }, null, 2)}\n`, "utf8");
console.log(`Sanitized ${matchedReferences} product references for ${matchedVehicles} vehicle pages from ${names.length} inventory names`);
