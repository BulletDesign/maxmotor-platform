import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const source = await readFile(resolve(root, "catalog/families.js"), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);
const families = context.window.MAXMOTOR_FAMILIES;
const output = resolve(root, "fichas");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

for (const family of families) {
  for (const product of family.products) {
    const description = `${product.summary} Cotiza compatibilidad e instalacion con Maxmotor 4x4 en Ecuador.`;
    const html = `<!doctype html>
<html lang="es-EC">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="../">
  <title>${escapeHtml(product.name)} | Maxmotor 4x4 Ecuador</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="https://maxmotor4x4.com/fichas/${product.slug}">
  <link rel="icon" href="https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/logo_16x16.png" type="image/png">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&family=Teko:wght@500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/shared-shell.css">
  <link rel="stylesheet" href="assets/product-detail.css?v=20260803-5">
  <script src="assets/site-shell.js?v=20260804-3"></script>
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.summary, image: product.image, brand: { "@type": "Brand", name: product.marca || "Maxmotor 4x4" }, url: `https://maxmotor4x4.com/fichas/${product.slug}` })}</script>
</head>
<body>
  <maxmotor-header compact></maxmotor-header>
  <main id="productDetail" class="detail-shell" aria-live="polite"></main>
  <maxmotor-footer></maxmotor-footer>
  <script src="catalog/families.js?v=20260803-5"></script>
  <script src="assets/product-detail.js?v=20260803-5"></script>
</body>
</html>`;
    await writeFile(resolve(output, `${product.slug}.html`), html, "utf8");
  }
}

console.log(`Generated accessory pages for ${families.flatMap(family => family.products).length} catalog products`);
