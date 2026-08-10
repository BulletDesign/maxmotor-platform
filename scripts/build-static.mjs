import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const output = join(root, "dist");
if (basename(output) !== "dist" || !output.startsWith(root)) throw new Error("Unsafe output directory");

execFileSync(process.execPath, [join(root, "scripts", "generate-accessory-pages.mjs")], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, [join(root, "scripts", "generate-vehicle-pages.mjs")], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, [join(root, "scripts", "generate-sitemap.mjs")], { cwd: root, stdio: "inherit" });
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const files = [
  "_headers",
  "robots.txt",
  "sitemap.xml",
  "index.html",
  "ingenieria.html",
  "portal-admin.html",
  "mxr.html",
  "data.js",
];
const directories = ["assets", "catalog", "fichas", "camionetas"];

await Promise.all(files.map((file) => cp(join(root, file), join(output, file))));
await cp(join(root, "portal.html"), join(output, "MiMaxmotor.html"));
await cp(join(root, "portal-admin.html"), join(output, "portal-maxmotor.html"));
await cp(join(root, "portal-superadmin.html"), join(output, "console.html"));
await Promise.all(directories.map((directory) => cp(join(root, directory), join(output, directory), { recursive: true })));

// ASSET_ORIGIN is an emergency escape hatch for a poisoned custom-domain cache.
// Git previews and normal production builds should use same-origin assets.
const assetOrigin = process.env.ASSET_ORIGIN?.trim().replace(/\/?$/, "/") || "";
const rewriteHtmlAssets = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return rewriteHtmlAssets(file);
    if (!entry.name.endsWith(".html")) return;
    const html = await readFile(file, "utf8");
    if (!assetOrigin) return;
    const rewritten = html
      .replaceAll('href="../assets/', `href="${assetOrigin}assets/`)
      .replaceAll('src="../assets/', `src="${assetOrigin}assets/`)
      .replaceAll('href="assets/', `href="${assetOrigin}assets/`)
      .replaceAll('src="assets/', `src="${assetOrigin}assets/`)
      .replaceAll('src="../catalog/', `src="${assetOrigin}catalog/`)
      .replaceAll('src="catalog/', `src="${assetOrigin}catalog/`)
      .replaceAll('src="../data.js', `src="${assetOrigin}data.js`)
      .replaceAll('src="data.js', `src="${assetOrigin}data.js`);
    await writeFile(file, rewritten, "utf8");
  }));
};
await rewriteHtmlAssets(output);

const countFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries.reduce(async (totalPromise, entry) => {
    const total = await totalPromise;
    return total + (entry.isDirectory() ? await countFiles(join(directory, entry.name)) : 1);
  }, Promise.resolve(0));
};

console.log(`Cloudflare package ready: ${output} (${await countFiles(output)} files)`);
