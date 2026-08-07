import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const crmRoot = path.join(root, "integrations", "google-apps-script", "crm");
const read = (name) => fs.readFileSync(path.join(crmRoot, name), "utf8");

test("CRM keeps clients, opportunities and activities in separate tables", () => {
  const config = read("Config.gs");
  assert.match(config, /clients: 'Clientes'/);
  assert.match(config, /opportunities: 'Oportunidades'/);
  assert.match(config, /activities: 'Actividades'/);
  assert.match(config, /CONSENTIMIENTO_WHATSAPP/);
});

test("CRM requires an authorized Google account for every data operation", () => {
  const code = read("Code.gs");
  assert.match(code, /Session\.getActiveUser\(\)\.getEmail\(\)/);
  assert.match(code, /Tu correo no esta autorizado en la hoja Equipo/);
  assert.match(code, /function saveOpportunity\(payload\) \{\s+const actor = assertAuthorized_\(\)/);
  assert.match(code, /function searchOpportunities\(query\) \{\s+assertAuthorized_\(\)/);
});

test("CRM mobile form records marketing consent only when explicitly selected", () => {
  const html = read("Index.html");
  const code = read("Code.gs");
  assert.match(html, /id="whatsappConsent"[^>]*type="checkbox"/);
  assert.doesNotMatch(html, /id="whatsappConsent"[^>]*checked/);
  assert.match(code, /whatsappConsent: data\.whatsappConsent === true/);
  assert.match(code, /data\.whatsappConsent \? now : ''/);
});
