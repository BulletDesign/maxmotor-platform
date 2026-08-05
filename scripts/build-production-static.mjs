import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = join(root, "dist");
const output = join(root, "dist-production");
const releaseVersion = "20260804-static1";

if (basename(output) !== "dist-production" || !output.startsWith(root)) throw new Error("Unsafe production output directory");

process.env.ASSET_ORIGIN = "https://maxmotor4x4.com/";
await import("./build-static.mjs");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const files = ["_headers", "robots.txt", "sitemap.xml", "index.html", "mxr.html", "data.js"];
const assetFiles = [
  "catalog-service.js",
  "index-app.js",
  "index-legacy.css",
  "maxmotor-home.js",
  "maxmotor-mxr.css",
  "product-detail.css",
  "product-detail.js",
  "shared-shell.css",
  "site-shell.js",
];
const directories = ["catalog", "fichas"];

await Promise.all(files.map((file) => cp(join(source, file), join(output, file))));
await mkdir(join(output, "assets"), { recursive: true });
await Promise.all(assetFiles.map((file) => cp(join(source, "assets", file), join(output, "assets", file))));
await Promise.all(directories.map((directory) => cp(join(source, directory), join(output, directory), { recursive: true })));

async function versionStaticReferences(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return versionStaticReferences(path);
    if (!entry.name.endsWith(".html")) return;

    const html = await readFile(path, "utf8");
    const versioned = html.replace(
      /(href|src)="(https:\/\/maxmotor4x4\.com\/(?:assets\/|catalog\/|data\.js)[^"]*)"/g,
      (match, attribute, url) => `${attribute}="${url}${url.includes("?") ? "&" : "?"}release=${releaseVersion}"`,
    );
    await writeFile(path, versioned);
  }));
}

await versionStaticReferences(output);

console.log(`Static production package ready: ${output}`);
