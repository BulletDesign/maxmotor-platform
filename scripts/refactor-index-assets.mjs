import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const indexPath = resolve(root, "index.html");
let html = await readFile(indexPath, "utf8");

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
if (!styleMatch) throw new Error("No se encontro el bloque CSS principal");
await writeFile(resolve(root, "assets/index-legacy.css"), styleMatch[1].trim() + "\n", "utf8");
html = html.replace(styleMatch[0], '<link rel="stylesheet" href="assets/index-legacy.css">');

const scriptMatch = html.match(/<script>\s*(\/\/ CONTROL DEL HEADER SCROLL[\s\S]*?)<\/script>/i);
if (!scriptMatch) throw new Error("No se encontro el bloque JavaScript principal");
await writeFile(resolve(root, "assets/index-app.js"), scriptMatch[1].trim() + "\n", "utf8");
html = html.replace(scriptMatch[0], '<script src="assets/index-app.js"></script>');

await writeFile(indexPath, html, "utf8");
console.log("index.html separado en assets/index-legacy.css y assets/index-app.js");
