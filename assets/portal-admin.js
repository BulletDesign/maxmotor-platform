import { vehicleBrandOptions } from "./vehicle-brands.js";
import { setupGuidedTour } from "./guided-tour.js";
import { showAdminToast } from "./admin-feedback.js";

const loginView = document.querySelector("#admin-login");
const appView = document.querySelector("#admin-app");
const loginMessage = document.querySelector("#admin-login-message");
const fileMessage = document.querySelector("#customer-file-message");
let operationalCatalog = [];
let catalogFamilies = [];
let rewardsCatalog = [];
let activeCustomerId = null;
let onboardedCustomerId = null;

async function api(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", ...options, headers: options.body ? { "content-type": "application/json", ...options.headers } : options.headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "No pudimos completar la operacion");
  return data;
}

function escapeHtml(value) { const node = document.createElement("span"); node.textContent = String(value ?? ""); return node.innerHTML; }
function setMessage(element, text, success = false) { element.textContent = text; element.classList.toggle("is-success", success); element.hidden = !text; if (text && element !== loginMessage) showAdminToast(text, success); }
function report(selector, text, success = false) { setMessage(document.querySelector(selector), text, success); }
function money(cents) { return `USD ${Number((cents || 0) / 100).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function resetManagedForm(form) { form.reset(); form.elements.id.value = ""; if (form.elements.active) form.elements.active.checked = true; form.querySelector("[data-cancel-form]").hidden = true; }
const trackingLabels = { none: "Sin seguimiento", time: "Solo tiempo", mileage: "Solo kilometraje", both: "Tiempo y kilometraje" };
function productOption(product) { return `<option value="${product.id}" data-coverage="${Number(product.coverageAvailable)}" data-tracking="${product.trackingMode}">${escapeHtml(product.familyName)} / ${escapeHtml(product.name)}</option>`; }
function syncProductTrackingForm(form) {
  const coverage = form.elements.coverageAvailable.value === "yes";
  const mode = coverage ? form.elements.trackingMode.value : "none";
  form.elements.trackingMode.disabled = !coverage;
  form.querySelector("[data-tracking-choice]").classList.toggle("is-disabled", !coverage);
  const timeField = form.querySelector("[data-tracking-time]");
  const mileageField = form.querySelector("[data-tracking-mileage]");
  timeField.hidden = !coverage || !["time", "both"].includes(mode);
  mileageField.hidden = !coverage || !["mileage", "both"].includes(mode);
  timeField.querySelector("input").required = !timeField.hidden;
  mileageField.querySelector("input").required = !mileageField.hidden;
}
function syncSaleItemCoverage(item) {
  const form = item.closest("form");
  const product = item.querySelector("[name='productId']").selectedOptions[0];
  const coverageAvailable = product?.dataset.coverage === "1";
  const trackingMode = coverageAvailable ? product?.dataset.tracking || "none" : "none";
  const coverageSelect = item.querySelector("[name='appliesWarranty']");
  const hint = item.querySelector(".coverage-hint");
  if (!coverageAvailable) coverageSelect.value = "no";
  coverageSelect.disabled = !coverageAvailable;
  hint.textContent = coverageAvailable ? `Seguimiento configurado: ${trackingLabels[trackingMode] || trackingMode}.` : "Este producto solo admite garantia limitada.";
  const details = item.querySelector(".warranty-details");
  const showDetails = coverageAvailable && coverageSelect.value === "yes" && trackingMode !== "none";
  details.hidden = !showDetails;
  const timeField = details.querySelector("[data-warranty-time]");
  const mileageField = details.querySelector("[data-warranty-mileage]");
  timeField.hidden = !showDetails || !["time", "both"].includes(trackingMode);
  mileageField.hidden = !showDetails || !["mileage", "both"].includes(trackingMode);
  timeField.querySelector("input").required = !timeField.hidden;
  mileageField.querySelector("input").required = !mileageField.hidden;
  if (!showDetails) details.querySelectorAll("input").forEach((input) => { input.value = ""; });
  const vehicle = form.elements.vehicleId.selectedOptions[0];
  mileageField.querySelector("input").placeholder = vehicle?.dataset.km || "0";
  syncSaleItemSummary(item);
}
function syncSaleItemSummary(item) {
  const product = item.querySelector("[name='productId']")?.selectedOptions[0];
  const label = item.querySelector("[data-sale-item-label]");
  if (label) label.textContent = product?.value ? product.textContent : "Producto por seleccionar";
}
function saleItemMarkup() {
  const options = operationalCatalog.filter((product) => Number(product.active) && Number(product.familyActive)).map(productOption).join("");
  return `<details class="sale-item" data-sale-item open><summary><span>Accesorio <b data-sale-item-number></b></span><strong data-sale-item-label>Producto por seleccionar</strong><em>Editar</em></summary><div class="sale-item-body"><button class="sale-item-remove" type="button" data-remove-sale-item>Quitar accesorio</button><label>Producto vendido<select name="productId" required><option value="">Selecciona un accesorio</option>${options}</select></label><label class="warranty-choice"><span>Tipo de cobertura</span><select name="appliesWarranty" required><option value="yes">Cobertura con seguimiento</option><option value="no">Garantia limitada</option></select><small class="coverage-hint">El catalogo define los seguimientos disponibles.</small></label><div class="field-row warranty-details"><label data-warranty-time>Fecha de instalacion<input name="installedAt" type="date"></label><label data-warranty-mileage>Kilometraje<input name="installedKm" type="number" min="0"></label></div></div></details>`;
}
function renumberSaleItems(form) {
  const items = [...form.querySelectorAll("[data-sale-item]")];
  items.forEach((item, index) => {
    item.querySelector("[data-sale-item-number]").textContent = String(index + 1).padStart(2, "0");
    item.querySelector("[data-remove-sale-item]").disabled = items.length === 1;
  });
}
function addSaleItem(form, values = {}) {
  const container = form.querySelector("[data-sale-items]");
  if (container.children.length >= 25) return setMessage(form.querySelector(".form-message") || fileMessage, "Maximo 25 accesorios por factura.");
  container.querySelectorAll("[data-sale-item]").forEach((item) => { item.open = false; });
  container.insertAdjacentHTML("beforeend", saleItemMarkup());
  const item = container.lastElementChild;
  if (values.productId) item.querySelector("[name='productId']").value = values.productId;
  item.querySelector("[name='appliesWarranty']").value = values.appliesWarranty === false ? "no" : "yes";
  item.querySelector("[name='installedAt']").value = values.installedAt || "";
  item.querySelector("[name='installedKm']").value = values.installedKm ?? "";
  syncSaleItemCoverage(item);
  renumberSaleItems(form);
  if (container.children.length > 1) item.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function resetSaleItems(form) {
  form.querySelector("[data-sale-items]").innerHTML = "";
  addSaleItem(form);
}
function refreshSaleItems(form) {
  const items = [...form.querySelectorAll("[data-sale-item]")];
  if (!items.length) return addSaleItem(form);
  const options = `<option value="">Selecciona un accesorio</option>${operationalCatalog.filter((product) => Number(product.active) && Number(product.familyActive)).map(productOption).join("")}`;
  items.forEach((item) => {
    const select = item.querySelector("[name='productId']");
    const selected = select.value;
    select.innerHTML = options;
    if ([...select.options].some((option) => option.value === selected)) select.value = selected;
    syncSaleItemCoverage(item);
  });
}
function openAdminView(view) { document.querySelector(`[data-admin-view="${view}"]`)?.click(); }
function initializeAdminTour() {
  setupGuidedTour({
    id: "employee",
    trigger: "#admin-tour-button",
    steps: [
      { target: ".admin-stats", title: "Resumen operativo", body: "Revisa facturas del mes, nuevos clientes, canjes pendientes y actividad auditada.", before: () => openAdminView("overview") },
      { target: "#customer-onboarding-form", title: "Ingreso de clientes", body: "Crea la cuenta, genera credenciales temporales y abre el mensaje de bienvenida en WhatsApp. Despues continua a la factura y los accesorios.", before: () => openAdminView("onboarding") },
      { target: "#customers-browser", title: "Ficha completa del cliente", body: "Busca por Maxmotor ID, nombre, correo, telefono o placa. Desde la ficha se administran vehiculos, ventas, puntos y mantenimientos.", before: () => openAdminView("customers") },
      { target: "#award-points-form", title: "Factura multiaccesorio", body: "Registra una sola factura y agrega todos los accesorios instalados. Cada item conserva su propia cobertura y puedes decidir si la venta acumula TP.", before: () => openAdminView("points") },
      { target: ".catalog-explainer", title: "Catalogo operativo", body: "Las familias ordenan productos y permiten medir demanda; cada producto define sus intervalos de mantenimiento.", before: () => openAdminView("catalog") },
      { target: ".rewards-management", title: "Recompensas", body: "Publica, edita, limita o elimina beneficios canjeables con Traction Points.", before: () => openAdminView("rewards") },
      { target: "#redemption-list", title: "Canjes", body: "Aprueba, rechaza y marca como entregadas las solicitudes realizadas por clientes.", before: () => openAdminView("redemptions") },
      { target: "#notification-form", title: "Comunicacion", body: "Publica avisos generales que apareceran durante 30 dias en todos los portales de propietarios.", before: () => openAdminView("notifications") }
    ]
  });
}

async function loadOverview() {
  const data = await api("/api/admin/overview");
  Object.entries(data.stats).forEach(([key, value]) => { const node = document.querySelector(`#stat-${key}`); if (node) node.textContent = Number(value || 0).toLocaleString("es-EC"); });
  const monthly = data.month?.chart || [];
  const max = Math.max(...monthly.map((item) => Number(item.invoices)), 1);
  document.querySelector("#month-sales-total").textContent = money(data.month?.amountCents);
  document.querySelector("#sales-chart").innerHTML = monthly.length ? monthly.map((item) => `<div class="chart-column"><span style="height:${Math.max(8, Number(item.invoices) / max * 100)}%"></span><b>${item.invoices}</b><small>${String(item.day).padStart(2, "0")}</small></div>`).join("") : '<p class="empty-state">No hay facturas registradas este mes.</p>';
  document.querySelector("#recent-activity").innerHTML = data.recent.length ? data.recent.map((item) => `<article class="admin-list-row"><strong>${escapeHtml(item.action)}</strong><span>${escapeHtml(item.entityType)}</span><small>${new Date(item.createdAt).toLocaleString("es-EC")}</small><em>Auditado</em></article>`).join("") : '<p class="empty-state">Aun no existen operaciones auditadas.</p>';
}

async function loadCatalog() {
  const data = await api("/api/catalog/operational");
  operationalCatalog = data.products || [];
  catalogFamilies = data.families || [];
  document.querySelector("#product-form [name='familyId']").innerHTML = catalogFamilies.filter((item) => Number(item.active)).map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("");
  document.querySelector("#family-list").innerHTML = catalogFamilies.length ? catalogFamilies.map((item) => `<article class="admin-list-row"><strong>${escapeHtml(item.name)}</strong><span>Familia operativa</span><small>${Number(item.active) ? "Visible" : "Inactiva"}</small><button type="button" data-edit-family="${item.id}">Editar</button></article>`).join("") : '<p class="empty-state">No hay familias creadas.</p>';
  document.querySelector("#product-list").innerHTML = operationalCatalog.length ? operationalCatalog.map((item) => `<article class="admin-list-row"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.familyName)}</span><small>${Number(item.coverageAvailable) ? `${trackingLabels[item.trackingMode] || item.trackingMode}${item.serviceDays ? ` / ${item.serviceDays} dias` : ""}${item.serviceKm ? ` / ${Number(item.serviceKm).toLocaleString("es-EC")} km` : ""}` : "Garantia limitada"}</small><button type="button" data-edit-product="${item.id}">${Number(item.active) ? "Editar" : "Inactivo / Editar"}</button></article>`).join("") : '<p class="empty-state">No hay productos creados.</p>';
  const options = operationalCatalog.filter((product) => Number(product.active) && Number(product.familyActive)).map(productOption).join("");
  document.querySelectorAll(".sale-form").forEach((form) => refreshSaleItems(form));
  const rewardProduct = document.querySelector("#reward-form [name='productId']");
  if (rewardProduct) rewardProduct.innerHTML = `<option value="">Selecciona un producto</option>${options}`;
}

async function loadRewards() {
  const data = await api("/api/rewards?manage=1");
  rewardsCatalog = data.rewards || [];
  document.querySelector("#reward-list").innerHTML = rewardsCatalog.length ? rewardsCatalog.map((item) => `<article class="admin-list-row"><strong>${escapeHtml(item.name)}</strong><span>${money(item.priceCents)} / ${money(item.cashAfterPointsCents)} + ${Number(item.pointsCost).toLocaleString("es-EC")} TP</span><small>${item.fulfillmentType === "install" ? "Instalacion en vehiculo" : "Venta sin instalacion"} / Limite ${item.stockLimit || "sin limite"} / ${item.reserved || 0} reservados</small><div class="row-actions"><button type="button" data-edit-reward="${item.id}">${Number(item.active) ? "Editar" : "Inactiva / Editar"}</button><button class="danger-inline" type="button" data-delete-reward="${item.id}">Eliminar definitivamente</button></div></article>`).join("") : '<p class="empty-state">No hay recompensas publicadas.</p>';
}

async function loadRedemptions(code = "") {
  const [data, couponData] = await Promise.all([api("/api/redemptions?role=employee"), api(`/api/coupons?role=employee${code ? `&code=${encodeURIComponent(code)}` : ""}`)]);
  const statusLabel = { requested: "Solicitado", pending_delivery: "Por entregar", rejected: "Rechazado", claimed: "Reclamado", cancelled: "Cancelado" };
  const couponStatus = { available: "Disponible", requested: "Solicitado", accepted: "Aceptado", redeemed: "Redimido", rejected: "Rechazado", expired: "Vencido", void: "Anulado" };
  document.querySelector("#coupon-redemption-list").innerHTML = couponData.coupons.length ? couponData.coupons.map((item) => {
    const actions = ["available", "requested"].includes(item.status) ? `<div class="redemption-actions"><button type="button" data-coupon-id="${item.id}" data-status="accepted">Aceptar 10% OFF</button><button type="button" data-coupon-id="${item.id}" data-status="rejected">Rechazar</button></div>` : item.status === "accepted" ? `<div class="redemption-actions"><button type="button" data-coupon-id="${item.id}" data-status="redeemed">Marcar redimido</button><button type="button" data-coupon-id="${item.id}" data-status="rejected">Rechazar</button></div>` : `<em>${couponStatus[item.status] || escapeHtml(item.status)}</em>`;
    return `<article class="admin-list-row coupon-admin-row"><strong>${escapeHtml(item.code)}<small>${escapeHtml(item.customerCode)}</small></strong><span>${escapeHtml(item.fullName)}<br>${item.discountPercent}% OFF</span><small>${couponStatus[item.status] || escapeHtml(item.status)} / ${item.requestedAt ? new Date(item.requestedAt).toLocaleString("es-EC") : "Presentado por codigo"}</small>${actions}</article>`;
  }).join("") : `<p class="empty-state">${code ? "No existe un cupon con ese codigo." : "No existen solicitudes de descuento."}</p>`;
  document.querySelector("#redemption-list").innerHTML = data.redemptions.length ? data.redemptions.map((item) => {
    const vehicles = (data.vehicles || []).filter((vehicle) => vehicle.userId === item.userId);
    const vehicleSelect = item.fulfillmentType === "install" ? `<select data-redemption-vehicle aria-label="Vehiculo para instalar">${vehicles.map((vehicle) => `<option value="${vehicle.id}">${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)} / ${escapeHtml(vehicle.plate || "sin placa")}</option>`).join("")}</select>` : "";
    const actions = item.status === "requested" ? `<div class="redemption-actions"><button type="button" data-redemption-id="${item.id}" data-status="pending_delivery">Aceptar</button><button type="button" data-redemption-id="${item.id}" data-status="rejected">Rechazar</button></div>` : item.status === "pending_delivery" ? `<div class="redemption-actions">${vehicleSelect}<button type="button" data-redemption-id="${item.id}" data-status="claimed">${item.fulfillmentType === "install" ? "Marcar instalado" : "Marcar entregado"}</button><button type="button" data-redemption-id="${item.id}" data-status="rejected">Rechazar y devolver TP</button></div>` : `<em>${statusLabel[item.status] || escapeHtml(item.status)}</em>`;
    return `<article class="admin-list-row"><strong>${escapeHtml(item.fullName)}<small>${escapeHtml(item.customerCode)}</small></strong><span>${escapeHtml(item.name)}<br>${Number(item.pointsCost).toLocaleString("es-EC")} TP + ${money(item.cashAfterPointsCents)}</span><small>${new Date(item.createdAt).toLocaleString("es-EC")} / ${item.fulfillmentType === "install" ? "Instalacion" : "Venta"}</small>${actions}</article>`;
  }).join("") : '<p class="empty-state">No existen solicitudes de canje.</p>';
}

async function loadNotifications() {
  const data = await api("/api/notifications?role=employee");
  document.querySelector("#notification-list").innerHTML = data.notifications.length ? data.notifications.map((item) => `<article class="admin-list-row notification-admin-row"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span><small>Publicado ${new Date(item.publishedAt).toLocaleDateString("es-EC")}<br>Vence ${new Date(item.expiresAt).toLocaleDateString("es-EC")}</small><button class="danger-inline" type="button" data-delete-notification="${item.id}">Eliminar</button></article>`).join("") : '<p class="empty-state">No hay avisos vigentes.</p>';
}

async function loadCustomers(query) {
  const data = await api(`/api/admin/customers?q=${encodeURIComponent(query)}`);
  document.querySelector("#customers-table").innerHTML = data.customers.length ? data.customers.map((item) => `<button class="admin-list-row customer-row" type="button" data-customer-id="${item.id}"><strong>${escapeHtml(item.fullName)}<small>${escapeHtml(item.customerCode)}</small></strong><span>${escapeHtml(item.email)}<br>${escapeHtml(item.phone)}</span><span>${item.vehicleCount} vehiculo(s)</span><em>${Number(item.points || 0).toLocaleString("es-EC")} TP</em></button>`).join("") : '<p class="empty-state">No encontramos clientes.</p>';
}

async function openCustomerFile(id) {
  const data = await api(`/api/admin/customers/${encodeURIComponent(id)}`);
  const { customer, vehicles, installations } = data;
  activeCustomerId = customer.id;
  document.querySelector("#customers-browser").hidden = true;
  document.querySelector("#customer-file").hidden = false;
  document.querySelector("#file-customer-name").textContent = customer.fullName;
  document.querySelector("#file-customer-code").textContent = customer.customerCode;
  document.querySelector("#file-points").textContent = `${Number(customer.points || 0).toLocaleString("es-EC")} TP`;
  const editForm = document.querySelector("#customer-edit-form");
  editForm.elements.id.value = customer.id; editForm.elements.fullName.value = customer.fullName; editForm.elements.email.value = customer.email; editForm.elements.phone.value = customer.phone || "";
  const invoiceForm = document.querySelector("#customer-invoice-form"); invoiceForm.elements.customerCode.value = customer.customerCode; invoiceForm.elements.issuedAt.value = new Date().toISOString().slice(0, 10); invoiceForm.elements.awardPoints.checked = true;
  invoiceForm.elements.vehicleId.innerHTML = vehicles.map((vehicle) => `<option value="${vehicle.id}" data-km="${vehicle.odometerKm || 0}">${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)} - ${escapeHtml(vehicle.plate || "sin placa")}</option>`).join("");
  resetSaleItems(invoiceForm);
  document.querySelector("#file-vehicles").innerHTML = vehicles.length ? vehicles.map((vehicle) => `<article class="admin-list-row"><strong>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</strong><span>${vehicle.modelYear || "Ano pendiente"} / ${escapeHtml(vehicle.plate || "Sin placa")}</span><small>VIN ${escapeHtml(vehicle.vin || "no registrado")} / ${Number(vehicle.odometerKm || 0).toLocaleString("es-EC")} km</small><button type="button" data-delete-vehicle="${vehicle.id}">Eliminar vehiculo</button></article>`).join("") : '<p class="empty-state">Este cliente no tiene vehiculos vinculados.</p>';
  const maintenanceByInstallation = new Map();
  (data.maintenanceHistory || []).forEach((event) => maintenanceByInstallation.set(event.installationId, [...(maintenanceByInstallation.get(event.installationId) || []), event]));
  document.querySelector("#file-installations").innerHTML = installations.length ? installations.map((item) => {
    const history = maintenanceByInstallation.get(item.id) || [];
    const lastDate = item.lastServiceAt || item.installedAt;
    const lastKm = item.lastServiceKm ?? item.installedKm;
    const historyMarkup = history.length ? `<details class="maintenance-history"><summary>Ver historial (${history.length})</summary>${history.map((entry) => `<div><time>${new Date(entry.servicedAt).toLocaleDateString("es-EC")}</time><strong>${Number(entry.odometerKm || 0).toLocaleString("es-EC")} km</strong><span>${escapeHtml(entry.notes || "Revision completada")}</span></div>`).join("")}</details>` : '<p class="empty-state compact">Sin revisiones completadas.</p>';
    const coverage = { full: "Garantia completa", limited: "Garantia limitada", reward: "Recompensa instalada" }[item.coverageType] || "Garantia completa";
    if (item.coverageType === "limited" || item.trackingMode === "none") return `<article class="installation-card is-limited"><header><div><span>${escapeHtml(item.familyName)}</span><h3>${escapeHtml(item.productName)}</h3></div><strong>${escapeHtml(item.brand)} ${escapeHtml(item.model)}<small>${escapeHtml(item.plate || "Sin placa")}</small></strong></header><div class="limited-maintenance">Garantia limitada</div><div class="installation-actions"><button class="danger-inline" type="button" data-delete-installation="${item.id}">Eliminar accesorio</button></div></article>`;
    const tracksTime = ["time", "both"].includes(item.trackingMode);
    const tracksMileage = ["mileage", "both"].includes(item.trackingMode);
    const lastParts = [tracksTime && lastDate ? new Date(lastDate).toLocaleDateString("es-EC") : null, tracksMileage ? `${Number(lastKm || 0).toLocaleString("es-EC")} km` : null].filter(Boolean);
    const nextParts = [tracksTime && item.nextServiceAt ? new Date(item.nextServiceAt).toLocaleDateString("es-EC") : null, tracksMileage && item.nextServiceKm ? `${Number(item.nextServiceKm).toLocaleString("es-EC")} km` : null].filter(Boolean);
    return `<article class="installation-card"><header><div><span>${escapeHtml(item.familyName)} / ${coverage}</span><h3>${escapeHtml(item.productName)}</h3></div><strong>${escapeHtml(item.brand)} ${escapeHtml(item.model)}<small>${escapeHtml(item.plate || "Sin placa")}</small></strong></header><div class="tracking-mode-pill">${trackingLabels[item.trackingMode] || item.trackingMode}</div><div class="maintenance-facts"><p><span>Ultima revision o instalacion</span><b>${lastParts.join(" / ")}</b></p><p><span>Proxima revision</span><b>${nextParts.join(" / ")}</b></p></div>${historyMarkup}<div class="installation-actions"><button class="primary-inline" type="button" data-complete-installation="${item.id}" data-tracking-mode="${item.trackingMode}" data-min-km="${lastKm || 0}">Completado</button>${tracksTime ? `<button type="button" data-extend-installation="${item.id}">Extender garantia</button>` : ""}<button class="danger-inline" type="button" data-delete-installation="${item.id}">Eliminar accesorio</button></div></article>`;
  }).join("") : '<p class="empty-state">Este cliente aun no tiene accesorios instalados.</p>';
}

async function openAdmin(user) {
  if (user?.role === "superadmin") return location.replace("/console");
  if (user?.role === "customer") return location.replace("/MiMaxmotor");
  if (!user || user.role !== "employee") throw new Error("Esta cuenta no tiene acceso al Portal Maxmotor");
  loginView.hidden = true; appView.hidden = false;
  document.querySelector("#admin-name").textContent = user.fullName;
  document.querySelector("#admin-role").textContent = "Empleado Maxmotor";
  document.querySelector("#vehicle-form [name='brand']").innerHTML = vehicleBrandOptions();
  document.querySelector("#customer-onboarding-form [name='brand']").innerHTML = vehicleBrandOptions();
  await Promise.all([loadOverview(), loadCustomers(""), loadCatalog(), loadRewards(), loadRedemptions(), loadNotifications()]);
  const awardForm = document.querySelector("#award-points-form");
  awardForm.elements.issuedAt.value = new Date().toISOString().slice(0, 10);
  awardForm.elements.awardPoints.checked = true;
  refreshSaleItems(awardForm);
  initializeAdminTour();
}

document.querySelector("#admin-login-form").addEventListener("submit", async (event) => { event.preventDefault(); try { await openAdmin((await api("/api/auth/login", { method: "POST", body: JSON.stringify({ ...Object.fromEntries(new FormData(event.currentTarget)), expectedRole: "employee" }) })).user); } catch (error) { setMessage(loginMessage, error.message); } });
document.querySelectorAll("[data-admin-view]").forEach((button) => button.addEventListener("click", () => { const view = button.dataset.adminView; document.querySelectorAll("[data-admin-view]").forEach((item) => item.classList.toggle("is-active", item === button)); document.querySelectorAll(".admin-view").forEach((section) => { section.hidden = section.dataset.view !== view; }); document.querySelector("#admin-title").textContent = button.textContent; }));

document.querySelector("#customer-onboarding-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type='submit']");
  const values = Object.fromEntries(new FormData(form));
  onboardedCustomerId = null;
  document.querySelector("#onboarding-result").hidden = true;
  document.querySelector("#onboarding-password").textContent = "";
  const whatsappWindow = window.open("about:blank", "maxmotor-onboarding-whatsapp");
  submitButton.disabled = true;
  report("#onboarding-message", "Creando cuenta y credenciales...");
  try {
    const data = await api("/api/admin/customers", {
      method: "POST",
      body: JSON.stringify({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        originProvince: values.originProvince,
        accountConsent: form.elements.accountConsent.checked,
        marketingConsent: form.elements.marketingConsent.checked,
        vehicle: { brand: values.brand, model: values.model, modelYear: values.modelYear, plate: values.plate },
      }),
    });
    onboardedCustomerId = data.customer.id;
    document.querySelector("#onboarding-customer-name").textContent = data.customer.fullName;
    document.querySelector("#onboarding-customer-code").textContent = data.customer.customerCode;
    document.querySelector("#onboarding-login").textContent = data.credentials.login;
    document.querySelector("#onboarding-password").textContent = data.credentials.temporaryPassword;
    document.querySelector("#onboarding-benefit").textContent = data.welcomePoints > 0
      ? `${Number(data.welcomePoints).toLocaleString("es-EC")} TP de bienvenida${data.welcomeCoupon ? ` + cupon 10% OFF ${data.welcomeCoupon}` : ""}`
      : "Cuenta Mi Maxmotor activa";
    document.querySelector("#onboarding-whatsapp").href = data.whatsappUrl;
    document.querySelector("#onboarding-result").hidden = false;
    report("#onboarding-message", "Cuenta creada. WhatsApp esta listo; confirma el envio y continua con los accesorios.", true);
    form.reset();
    if (whatsappWindow) whatsappWindow.location.href = data.whatsappUrl;
    document.querySelector("#onboarding-result").scrollIntoView({ behavior: "smooth", block: "start" });
    await Promise.all([loadCustomers(""), loadOverview()]);
  } catch (error) {
    whatsappWindow?.close();
    report("#onboarding-message", error.message);
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelector("#continue-onboarding-sale").addEventListener("click", async () => {
  if (!onboardedCustomerId) return;
  openAdminView("customers");
  try {
    await openCustomerFile(onboardedCustomerId);
    document.querySelector("#onboarding-result").hidden = true;
    document.querySelector("#onboarding-password").textContent = "";
    onboardedCustomerId = null;
    document.querySelector("#customer-invoice-form").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) { setMessage(fileMessage, error.message); }
});

let searchTimer;
document.querySelector("#customer-search").addEventListener("input", (event) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => loadCustomers(event.target.value), 250); });
document.querySelector("#customers-table").addEventListener("click", (event) => { const row = event.target.closest("[data-customer-id]"); if (row) openCustomerFile(row.dataset.customerId).catch((error) => setMessage(fileMessage, error.message)); });
document.querySelector("#close-customer-file").addEventListener("click", () => { document.querySelector("#customer-file").hidden = true; document.querySelector("#customers-browser").hidden = false; activeCustomerId = null; });
document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-sale-item]");
  if (addButton) return addSaleItem(addButton.closest("form"));
  const removeButton = event.target.closest("[data-remove-sale-item]");
  if (!removeButton) return;
  const form = removeButton.closest("form");
  if (form.querySelectorAll("[data-sale-item]").length <= 1) return;
  removeButton.closest("[data-sale-item]").remove();
  renumberSaleItems(form);
});
document.addEventListener("change", (event) => {
  const form = event.target.closest(".sale-form");
  if (!form) return;
  if (event.target.matches("[name='vehicleId']")) form.querySelectorAll("[data-sale-item]").forEach(syncSaleItemCoverage);
  if (event.target.matches("[name='productId'],[name='appliesWarranty']")) syncSaleItemCoverage(event.target.closest("[data-sale-item]"));
});
document.addEventListener("wheel", (event) => { const select = event.target.closest?.(".sale-form select"); if (select && document.activeElement === select) select.blur(); }, { passive: true });

document.querySelector("#customer-edit-form").addEventListener("submit", async (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); try { await api(`/api/admin/customers/${values.id}`, { method: "PATCH", body: JSON.stringify(values) }); setMessage(fileMessage, "Ficha actualizada correctamente.", true); await Promise.all([openCustomerFile(values.id), loadCustomers("")]); } catch (error) { setMessage(fileMessage, error.message); } });
document.querySelector("#customer-invoice-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; try { const data = await api("/api/admin/sales", { method: "POST", body: JSON.stringify(salePayload(form)) }); const pointsText = data.awardPoints ? `${Number(data.points).toLocaleString("es-EC")} TP acreditados` : "sin TP por descuento"; setMessage(fileMessage, `Factura registrada: ${data.itemCount} accesorio(s) y ${pointsText}.`, true); form.elements.invoiceNumber.value = ""; form.elements.amount.value = ""; await Promise.all([openCustomerFile(activeCustomerId), loadOverview()]); } catch (error) { setMessage(fileMessage, error.message); } });
document.querySelector("#vehicle-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; try { await api(`/api/admin/customers/${activeCustomerId}/vehicles`, { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); setMessage(fileMessage, "Vehiculo vinculado correctamente.", true); form.reset(); await Promise.all([openCustomerFile(activeCustomerId), loadCustomers("")]); } catch (error) { setMessage(fileMessage, error.message); } });
document.querySelector("#file-vehicles").addEventListener("click", async (event) => { const button = event.target.closest("[data-delete-vehicle]"); if (!button || prompt("Escribe ELIMINAR VEHICULO para confirmar") !== "ELIMINAR VEHICULO") return; try { await api(`/api/admin/vehicles/${button.dataset.deleteVehicle}`, { method: "DELETE", body: JSON.stringify({ customerId: activeCustomerId, confirmation: "ELIMINAR VEHICULO" }) }); setMessage(fileMessage, "Vehiculo, instalaciones y garantias eliminados. Los puntos se conservaron.", true); await Promise.all([openCustomerFile(activeCustomerId), loadCustomers("")]); } catch (error) { setMessage(fileMessage, error.message); } });
document.querySelector("#suspend-customer").addEventListener("click", async () => { if (!activeCustomerId || !confirm("Suspender el acceso de este cliente? Su historial se conservara.")) return; try { const form = document.querySelector("#customer-edit-form"); await api(`/api/admin/customers/${activeCustomerId}`, { method: "PATCH", body: JSON.stringify({ fullName: form.elements.fullName.value, email: form.elements.email.value, phone: form.elements.phone.value, status: "suspended" }) }); setMessage(fileMessage, "Cuenta suspendida y sesiones cerradas.", true); await loadCustomers(""); } catch (error) { setMessage(fileMessage, error.message); } });
document.querySelector("#delete-customer").addEventListener("click", async () => { if (!activeCustomerId || prompt("Esta accion elimina credenciales, vehiculos, puntos y todo el historial. Escribe ELIMINAR CLIENTE") !== "ELIMINAR CLIENTE") return; try { await api(`/api/admin/customers/${activeCustomerId}`, { method: "DELETE", body: JSON.stringify({ confirmation: "ELIMINAR CLIENTE" }) }); activeCustomerId = null; document.querySelector("#customer-file").hidden = true; document.querySelector("#customers-browser").hidden = false; await Promise.all([loadCustomers(""), loadOverview()]); } catch (error) { setMessage(fileMessage, error.message); } });

document.querySelector("#file-installations").addEventListener("click", async (event) => {
  const completeButton = event.target.closest("[data-complete-installation]");
  const extendButton = event.target.closest("[data-extend-installation]");
  const deleteButton = event.target.closest("[data-delete-installation]");
  if (completeButton) {
    const form = document.querySelector("#maintenance-form");
    const trackingMode = completeButton.dataset.trackingMode || "both";
    const tracksMileage = ["mileage", "both"].includes(trackingMode);
    form.reset();
    form.elements.installationId.value = completeButton.dataset.completeInstallation;
    form.elements.trackingMode.value = trackingMode;
    form.elements.servicedAt.value = new Date().toISOString().slice(0, 10);
    form.elements.odometerKm.min = completeButton.dataset.minKm || 0;
    form.elements.odometerKm.value = tracksMileage ? completeButton.dataset.minKm || 0 : "";
    form.elements.odometerKm.required = tracksMileage;
    form.querySelector("[data-maintenance-mileage]").hidden = !tracksMileage;
    form.hidden = false;
    document.querySelector("#warranty-extension-form").hidden = true;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (extendButton) {
    const form = document.querySelector("#warranty-extension-form");
    form.reset();
    form.elements.installationId.value = extendButton.dataset.extendInstallation;
    form.hidden = false;
    document.querySelector("#maintenance-form").hidden = true;
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (!deleteButton || prompt("Escribe RETIRAR ACCESORIO para eliminar la instalacion y su garantia") !== "RETIRAR ACCESORIO") return;
  try {
    await api(`/api/admin/installations/${deleteButton.dataset.deleteInstallation}`, { method: "DELETE", body: JSON.stringify({ confirmation: "RETIRAR ACCESORIO" }) });
    setMessage(fileMessage, "Accesorio retirado del vehiculo y garantia cerrada.", true);
    await openCustomerFile(activeCustomerId);
  } catch (error) { setMessage(fileMessage, error.message); }
});
document.querySelector("#cancel-maintenance").addEventListener("click", () => { document.querySelector("#maintenance-form").hidden = true; });
document.querySelector("#maintenance-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  try {
    const data = await api(`/api/admin/installations/${values.installationId}/services`, { method: "POST", body: JSON.stringify({ servicedAt: new Date(`${values.servicedAt}T12:00:00`).toISOString(), odometerKm: values.odometerKm === "" ? null : Number(values.odometerKm), notes: values.notes }) });
    const nextReview = [data.nextServiceAt ? new Date(data.nextServiceAt).toLocaleDateString("es-EC") : null, data.nextServiceKm ? `${Number(data.nextServiceKm).toLocaleString("es-EC")} km` : null].filter(Boolean).join(" / ");
    setMessage(fileMessage, `Mantenimiento registrado. Proxima revision: ${nextReview}.`, true);
    form.hidden = true;
    form.reset();
    await openCustomerFile(activeCustomerId);
  } catch (error) { setMessage(fileMessage, error.message); }
});
document.querySelector("#cancel-extension").addEventListener("click", () => { document.querySelector("#warranty-extension-form").hidden = true; });
document.querySelector("#warranty-extension-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); try { await api(`/api/admin/installations/${values.installationId}`, { method: "PATCH", body: JSON.stringify({ additionalDays: Number(values.additionalDays), notes: values.notes }) }); setMessage(fileMessage, "Extension pagada de garantia registrada.", true); form.hidden = true; form.reset(); await openCustomerFile(activeCustomerId); } catch (error) { setMessage(fileMessage, error.message); } });

function salePayload(form) {
  const values = Object.fromEntries(new FormData(form));
  const items = [...form.querySelectorAll("[data-sale-item]")].map((item) => {
    const productId = item.querySelector("[name='productId']").value;
    const appliesWarranty = item.querySelector("[name='appliesWarranty']").value === "yes";
    const installedAt = item.querySelector("[name='installedAt']").value;
    const installedKm = item.querySelector("[name='installedKm']").value;
    return { productId, appliesWarranty, installedAt: installedAt ? new Date(`${installedAt}T12:00:00`).toISOString() : null, installedKm: installedKm === "" ? null : Number(installedKm) };
  });
  return { customerCode: values.customerCode, invoiceNumber: values.invoiceNumber, amountCents: Math.round(Number(values.amount) * 100), issuedAt: new Date(`${values.issuedAt}T12:00:00`).toISOString(), vehicleId: values.vehicleId, awardPoints: form.elements.awardPoints.checked, items };
}

async function loadAwardCustomer(customerCode) {
  const form = document.querySelector("#award-points-form");
  const status = document.querySelector("#award-customer-status");
  const code = String(customerCode || "").trim().toUpperCase();
  if (code.length < 4) return;
  status.textContent = "Buscando cliente..."; status.classList.remove("is-ready");
  const matches = await api(`/api/admin/customers?q=${encodeURIComponent(code)}`);
  const customer = matches.customers.find((item) => item.customerCode === code);
  if (!customer) throw new Error("No existe un cliente activo con ese Maxmotor ID");
  const detail = await api(`/api/admin/customers/${customer.id}`);
  form.elements.vehicleId.innerHTML = detail.vehicles.map((vehicle) => `<option value="${vehicle.id}" data-km="${vehicle.odometerKm || 0}">${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)} - ${escapeHtml(vehicle.plate || "sin placa")}</option>`).join("");
  form.elements.vehicleId.disabled = detail.vehicles.length === 0;
  form.querySelectorAll("[data-sale-item]").forEach(syncSaleItemCoverage);
  status.textContent = `${customer.fullName} / ${detail.vehicles.length} vehiculo(s)`; status.classList.add("is-ready");
}

let awardLookupTimer;
document.querySelector("#award-points-form [name='customerCode']").addEventListener("input", (event) => { clearTimeout(awardLookupTimer); const status = document.querySelector("#award-customer-status"); status.textContent = "Ingresa el Maxmotor ID para cargar sus vehiculos."; status.classList.remove("is-ready"); document.querySelector("#award-points-form [name='vehicleId']").disabled = true; awardLookupTimer = setTimeout(() => loadAwardCustomer(event.target.value).catch((error) => { status.textContent = error.message; }), 350); });

document.querySelector("#award-points-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; const customerCode = form.elements.customerCode.value; report("#points-message", ""); try { const data = await api("/api/admin/sales", { method: "POST", body: JSON.stringify(salePayload(form)) }); const pointsText = data.awardPoints ? `${Number(data.points).toLocaleString("es-EC")} TP acreditados` : "TP no acreditados"; report("#points-message", `Factura completa: ${data.itemCount} accesorio(s), ${pointsText}.`, true); form.reset(); form.elements.customerCode.value = customerCode; form.elements.awardPoints.checked = true; form.elements.issuedAt.value = new Date().toISOString().slice(0, 10); resetSaleItems(form); await Promise.all([loadAwardCustomer(customerCode), loadOverview(), loadCustomers("")]); } catch (error) { report("#points-message", error.message); } });

document.querySelector("#family-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; const id = form.elements.id.value; try { await api(id ? `/api/catalog/families/${id}` : "/api/catalog/families", { method: id ? "PATCH" : "POST", body: JSON.stringify({ name: form.elements.name.value, active: form.elements.active.checked }) }); report("#family-message", id ? "Familia actualizada." : "Familia creada.", true); resetManagedForm(form); await loadCatalog(); } catch (error) { report("#family-message", error.message); } });
document.querySelector("#product-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); const id = values.id; const coverageAvailable = form.elements.coverageAvailable.value === "yes"; try { await api(id ? `/api/catalog/operational/${id}` : "/api/catalog/operational", { method: id ? "PATCH" : "POST", body: JSON.stringify({ ...values, coverageAvailable, trackingMode: coverageAvailable ? form.elements.trackingMode.value : "none", active: form.elements.active.checked }) }); report("#product-message", id ? "Producto actualizado." : "Producto creado.", true); resetManagedForm(form); syncProductTrackingForm(form); await loadCatalog(); if (activeCustomerId) await openCustomerFile(activeCustomerId); } catch (error) { report("#product-message", error.message); } });
document.querySelector("#family-list").addEventListener("click", (event) => { const button = event.target.closest("[data-edit-family]"); if (!button) return; const item = catalogFamilies.find((entry) => entry.id === button.dataset.editFamily); const form = document.querySelector("#family-form"); form.elements.id.value = item.id; form.elements.name.value = item.name; form.elements.active.checked = Boolean(Number(item.active)); form.querySelector("[data-cancel-form]").hidden = false; form.scrollIntoView({ behavior: "smooth" }); });
document.querySelector("#product-list").addEventListener("click", (event) => { const button = event.target.closest("[data-edit-product]"); if (!button) return; const item = operationalCatalog.find((entry) => entry.id === button.dataset.editProduct); const form = document.querySelector("#product-form"); form.elements.id.value = item.id; form.elements.familyId.value = item.familyId; form.elements.name.value = item.name; form.elements.coverageAvailable.value = Number(item.coverageAvailable) ? "yes" : "no"; form.elements.trackingMode.value = item.trackingMode || "none"; form.elements.serviceDays.value = item.serviceDays || 0; form.elements.serviceKm.value = item.serviceKm || 0; form.elements.active.checked = Boolean(Number(item.active)); syncProductTrackingForm(form); form.querySelector("[data-cancel-form]").hidden = false; form.scrollIntoView({ behavior: "smooth" }); });
document.querySelector("#product-form [name='coverageAvailable']").addEventListener("change", (event) => syncProductTrackingForm(event.currentTarget.form));
document.querySelector("#product-form [name='trackingMode']").addEventListener("change", (event) => syncProductTrackingForm(event.currentTarget.form));

document.querySelector("#reward-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); const id = values.id; try { await api(id ? `/api/rewards/${id}` : "/api/rewards", { method: id ? "PATCH" : "POST", body: JSON.stringify({ ...values, active: form.elements.active.checked }) }); report("#reward-message", id ? "Recompensa actualizada." : "Recompensa publicada.", true); resetManagedForm(form); await loadRewards(); } catch (error) { report("#reward-message", error.message); } });
document.querySelector("#reward-form [name='fulfillmentType']").addEventListener("change", (event) => { const field = document.querySelector(".reward-product-field"); field.hidden = event.target.value !== "install"; field.querySelector("select").required = !field.hidden; });
document.querySelector("#reward-list").addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-reward]");
  if (deleteButton) {
    if (!confirm("Eliminar definitivamente esta recompensa? Los canjes historicos conservaran su nombre y estado.")) return;
    try { await api(`/api/rewards/${deleteButton.dataset.deleteReward}`, { method: "DELETE" }); report("#reward-message", "Recompensa eliminada definitivamente.", true); await loadRewards(); } catch (error) { report("#reward-message", error.message); }
    return;
  }
  const button = event.target.closest("[data-edit-reward]");
  if (!button) return;
  const item = rewardsCatalog.find((entry) => entry.id === button.dataset.editReward);
  const form = document.querySelector("#reward-form");
  form.elements.id.value = item.id; form.elements.name.value = item.name; form.elements.description.value = item.description || ""; form.elements.fulfillmentType.value = item.fulfillmentType || "sale"; form.elements.productId.value = item.productId || ""; form.elements.fulfillmentType.dispatchEvent(new Event("change")); form.elements.price.value = Number(item.priceCents || 0) / 100; form.elements.pointsCost.value = item.pointsCost; form.elements.cashAfterPoints.value = Number(item.cashAfterPointsCents || 0) / 100; form.elements.stockLimit.value = item.stockLimit; form.elements.active.checked = Boolean(Number(item.active)); form.querySelector("[data-cancel-form]").hidden = false; form.scrollIntoView({ behavior: "smooth" });
});
document.querySelectorAll("[data-cancel-form]").forEach((button) => button.addEventListener("click", () => { const form = document.querySelector(`#${button.dataset.cancelForm}`); resetManagedForm(form); if (form.id === "product-form") syncProductTrackingForm(form); }));

document.querySelector("#redemption-list").addEventListener("click", async (event) => { const button = event.target.closest("[data-redemption-id]"); if (!button) return; const row = button.closest(".admin-list-row"); const vehicleId = row.querySelector("[data-redemption-vehicle]")?.value; try { await api(`/api/redemptions/${button.dataset.redemptionId}`, { method: "PATCH", body: JSON.stringify({ status: button.dataset.status, vehicleId }) }); report("#redemption-message", button.dataset.status === "pending_delivery" ? "Canje aceptado y puesto por entregar." : button.dataset.status === "claimed" ? "Canje marcado como reclamado." : "Estado del canje actualizado.", true); await Promise.all([loadRedemptions(), loadRewards(), loadOverview()]); } catch (error) { report("#redemption-message", error.message); } });
document.querySelector("#coupon-lookup-form").addEventListener("submit", async (event) => { event.preventDefault(); const code = event.currentTarget.elements.code.value.trim().toUpperCase(); if (!code) return loadRedemptions(); try { await loadRedemptions(code); } catch (error) { report("#redemption-message", error.message); } });
document.querySelector("[data-clear-coupon-search]").addEventListener("click", () => { const form = document.querySelector("#coupon-lookup-form"); form.reset(); loadRedemptions().catch((error) => report("#redemption-message", error.message)); });
document.querySelector("#coupon-redemption-list").addEventListener("click", async (event) => { const button = event.target.closest("[data-coupon-id]"); if (!button) return; try { await api(`/api/coupons/${button.dataset.couponId}`, { method: "PATCH", body: JSON.stringify({ status: button.dataset.status }) }); const label = button.dataset.status === "accepted" ? "Cupon aceptado. El cliente ya puede ver la confirmacion." : button.dataset.status === "redeemed" ? "Cupon marcado como redimido." : "Cupon rechazado."; report("#redemption-message", label, true); const code = document.querySelector("#coupon-lookup-form").elements.code.value.trim(); await loadRedemptions(code); } catch (error) { report("#redemption-message", error.message); } });
document.querySelector("#notification-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; try { await api("/api/notifications", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); report("#notification-message", "Aviso publicado para todos los clientes durante 30 dias.", true); form.reset(); await loadNotifications(); } catch (error) { report("#notification-message", error.message); } });
document.querySelector("#notification-list").addEventListener("click", async (event) => { const button = event.target.closest("[data-delete-notification]"); if (!button || !confirm("Eliminar esta notificacion para todos los clientes?")) return; try { await api(`/api/notifications/${button.dataset.deleteNotification}`, { method: "DELETE" }); report("#notification-message", "Notificacion eliminada.", true); await loadNotifications(); } catch (error) { report("#notification-message", error.message); } });

document.querySelectorAll("[data-normalize]").forEach((input) => input.addEventListener("input", () => { if (input.dataset.normalize === "upper") input.value = input.value.toUpperCase(); if (input.dataset.normalize === "words") input.value = input.value.replace(/(^|\s|[-'])\p{L}/gu, (letter) => letter.toUpperCase()); }));
document.querySelector("#admin-logout").addEventListener("click", async () => { await api("/api/auth/logout?role=employee", { method: "POST" }); location.reload(); });
api("/api/auth/me?role=employee").then(({ user }) => { if (user) return openAdmin(user); }).catch(() => {});
