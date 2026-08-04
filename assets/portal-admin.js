const loginView = document.querySelector("#admin-login");
const appView = document.querySelector("#admin-app");
const loginMessage = document.querySelector("#admin-login-message");
const fileMessage = document.querySelector("#customer-file-message");
let operationalCatalog = [];
let activeCustomerId = null;

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: options.body ? { "content-type": "application/json", ...options.headers } : options.headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "No pudimos completar la operacion");
  return data;
}

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = String(value ?? "");
  return node.innerHTML;
}

function setMessage(element, text, success = false) {
  element.textContent = text;
  element.classList.toggle("is-success", success);
  element.hidden = !text;
}

async function openAdmin(user) {
  if (user?.role === "superadmin") return location.replace("/portal-superadmin");
  if (user?.role === "customer") return location.replace("/portal");
  if (!user || user.role !== "employee") throw new Error("Esta cuenta no tiene acceso al Portal Maxmotor");
  loginView.hidden = true;
  appView.hidden = false;
  document.querySelector("#admin-name").textContent = user.fullName;
  document.querySelector("#admin-role").textContent = "Empleado Maxmotor";
  await Promise.all([loadOverview(), loadCustomers(""), loadCatalog()]);
}

async function loadOverview() {
  const data = await api("/api/admin/overview");
  Object.entries(data.stats).forEach(([key, value]) => {
    const node = document.querySelector(`#stat-${key}`);
    if (node) node.textContent = Number(value || 0).toLocaleString("es-EC");
  });
  const monthly = data.month?.chart || [];
  const max = Math.max(...monthly.map((item) => Number(item.invoices)), 1);
  document.querySelector("#month-sales-total").textContent = `USD ${Number((data.month?.amountCents || 0) / 100).toLocaleString("es-EC", { minimumFractionDigits: 2 })}`;
  document.querySelector("#sales-chart").innerHTML = monthly.length
    ? monthly.map((item) => `<div class="chart-column"><span style="height:${Math.max(8, Number(item.invoices) / max * 100)}%"></span><b>${item.invoices}</b><small>${String(item.day).padStart(2, "0")}</small></div>`).join("")
    : '<p class="empty-state">No hay facturas registradas este mes.</p>';
  document.querySelector("#recent-activity").innerHTML = data.recent.length
    ? data.recent.map((item) => `<article class="admin-list-row"><strong>${escapeHtml(item.action)}</strong><span>${escapeHtml(item.entityType)}</span><small>${new Date(item.createdAt).toLocaleString("es-EC")}</small><em>Auditado</em></article>`).join("")
    : '<p class="empty-state">Aun no existen operaciones auditadas.</p>';
}

async function loadCatalog() {
  const data = await api("/api/catalog/operational");
  operationalCatalog = data.products;
}

async function loadCustomers(query) {
  const data = await api(`/api/admin/customers?q=${encodeURIComponent(query)}`);
  document.querySelector("#customers-table").innerHTML = data.customers.length
    ? data.customers.map((item) => `<button class="admin-list-row customer-row" type="button" data-customer-id="${item.id}"><strong>${escapeHtml(item.fullName)}<small>${escapeHtml(item.customerCode)}</small></strong><span>${escapeHtml(item.email)}<br>${escapeHtml(item.phone)}</span><span>${item.vehicleCount} vehiculo(s)</span><em>${Number(item.points || 0).toLocaleString("es-EC")} TP</em></button>`).join("")
    : '<p class="empty-state">No encontramos clientes.</p>';
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
  editForm.elements.id.value = customer.id;
  editForm.elements.fullName.value = customer.fullName;
  editForm.elements.email.value = customer.email;
  editForm.elements.phone.value = customer.phone;
  const invoiceForm = document.querySelector("#customer-invoice-form");
  invoiceForm.elements.customerCode.value = customer.customerCode;
  invoiceForm.elements.issuedAt.value = new Date().toISOString().slice(0, 10);
  let adjustForm = document.querySelector("#points-adjust-form");
  if (!adjustForm) {
    document.querySelector(".customer-file-grid").insertAdjacentHTML("beforeend", '<form id="points-adjust-form" class="portal-form admin-card"><h3>Ajuste manual de TP</h3><input name="customerCode" type="hidden"><label>Traction Points<input name="points" type="number" min="1" max="1000000" required></label><label>Motivo<input name="reason" minlength="5" placeholder="Bonificacion autorizada" required></label><button class="primary-action" type="submit"><span>Sumar Traction Points</span><b>→</b></button></form>');
    adjustForm = document.querySelector("#points-adjust-form");
  }
  adjustForm.elements.customerCode.value = customer.customerCode;
  const installForm = document.querySelector("#installation-form");
  installForm.elements.customerId.value = customer.id;
  installForm.elements.installedAt.value = new Date().toISOString().slice(0, 10);
  installForm.elements.vehicleId.innerHTML = vehicles.map((vehicle) => `<option value="${vehicle.id}" data-km="${vehicle.odometerKm || 0}">${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)} - ${escapeHtml(vehicle.plate || "sin placa")}</option>`).join("");
  installForm.elements.productId.innerHTML = operationalCatalog.map((product) => `<option value="${product.id}">${escapeHtml(product.familyName)} / ${escapeHtml(product.name)}</option>`).join("");
  installForm.elements.installedKm.value = vehicles[0]?.odometerKm || 0;
  document.querySelector("#file-installations").innerHTML = installations.length
    ? installations.map((item) => `<article class="admin-list-row"><strong>${escapeHtml(item.productName)}</strong><span>${escapeHtml(item.brand)} ${escapeHtml(item.model)}</span><small>Revision: ${item.nextServiceAt ? new Date(item.nextServiceAt).toLocaleDateString("es-EC") : "sin fecha"} / ${item.nextServiceKm ? `${Number(item.nextServiceKm).toLocaleString("es-EC")} km` : "sin kilometraje"}</small><button type="button" data-extend-installation="${item.id}">Extender</button></article>`).join("")
    : '<p class="empty-state">Este cliente aun no tiene accesorios instalados.</p>';
}

document.querySelector("#admin-login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  setMessage(loginMessage, "");
  try { await openAdmin((await api("/api/auth/login", { method: "POST", body: JSON.stringify({ ...values, expectedRole: "employee" }) })).user); }
  catch (error) { setMessage(loginMessage, error.message); }
});

document.querySelectorAll("[data-admin-view]").forEach((button) => button.addEventListener("click", () => {
  const view = button.dataset.adminView;
  document.querySelectorAll("[data-admin-view]").forEach((item) => item.classList.toggle("is-active", item === button));
  document.querySelectorAll(".admin-view").forEach((section) => { section.hidden = section.dataset.view !== view; });
  document.querySelector("#admin-title").textContent = button.textContent;
}));

let searchTimer;
document.querySelector("#customer-search").addEventListener("input", (event) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadCustomers(event.target.value), 250);
});
document.querySelector("#customers-table").addEventListener("click", (event) => {
  const row = event.target.closest("[data-customer-id]");
  if (row) openCustomerFile(row.dataset.customerId).catch((error) => setMessage(fileMessage, error.message));
});
document.querySelector("#close-customer-file").addEventListener("click", () => {
  document.querySelector("#customer-file").hidden = true;
  document.querySelector("#customers-browser").hidden = false;
});
document.querySelector("#installation-form [name='vehicleId']").addEventListener("change", (event) => {
  document.querySelector("#installation-form [name='installedKm']").value = event.target.selectedOptions[0]?.dataset.km || 0;
});

document.querySelector("#customer-edit-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  try {
    await api(`/api/admin/customers/${values.id}`, { method: "PATCH", body: JSON.stringify(values) });
    setMessage(fileMessage, "Ficha actualizada correctamente.", true);
    await Promise.all([openCustomerFile(values.id), loadCustomers("")]);
  } catch (error) { setMessage(fileMessage, error.message); }
});

document.querySelector("#installation-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  try {
    await api("/api/admin/installations", { method: "POST", body: JSON.stringify({ ...values, installedAt: new Date(`${values.installedAt}T12:00:00`).toISOString(), installedKm: Number(values.installedKm) }) });
    setMessage(fileMessage, "Accesorio y garantia registrados.", true);
    await openCustomerFile(values.customerId);
  } catch (error) { setMessage(fileMessage, error.message); }
});

document.querySelector("#customer-invoice-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  try {
    const data = await api("/api/admin/points/award", { method: "POST", body: JSON.stringify({ customerCode: values.customerCode, invoiceNumber: values.invoiceNumber, amountCents: Math.round(Number(values.amount) * 100), issuedAt: new Date(`${values.issuedAt}T12:00:00`).toISOString() }) });
    setMessage(fileMessage, `${Number(data.points).toLocaleString("es-EC")} Traction Points acreditados.`, true);
    form.elements.invoiceNumber.value = "";
    form.elements.amount.value = "";
    await Promise.all([openCustomerFile(activeCustomerId), loadOverview()]);
  } catch (error) { setMessage(fileMessage, error.message); }
});

document.querySelector(".customer-file-grid").addEventListener("submit", async (event) => {
  if (event.target.id !== "points-adjust-form") return;
  event.preventDefault();
  const form = event.target;
  const values = Object.fromEntries(new FormData(form));
  try {
    const data = await api("/api/admin/points/adjust", { method: "POST", body: JSON.stringify({ customerCode: values.customerCode, points: Number(values.points), reason: values.reason }) });
    setMessage(fileMessage, `${Number(data.points).toLocaleString("es-EC")} Traction Points sumados.`, true);
    form.elements.points.value = "";
    form.elements.reason.value = "";
    await openCustomerFile(activeCustomerId);
  } catch (error) { setMessage(fileMessage, error.message); }
});

document.querySelector("#suspend-customer").addEventListener("click", async () => {
  if (!activeCustomerId || !confirm("¿Suspender el acceso de este cliente? Su historial se conservara.")) return;
  try {
    const form = document.querySelector("#customer-edit-form");
    await api(`/api/admin/customers/${activeCustomerId}`, { method: "PATCH", body: JSON.stringify({ fullName: form.elements.fullName.value, email: form.elements.email.value, phone: form.elements.phone.value, status: "suspended" }) });
    setMessage(fileMessage, "Cuenta suspendida y sesiones cerradas.", true);
    await loadCustomers("");
  } catch (error) { setMessage(fileMessage, error.message); }
});

document.querySelector("#file-installations").addEventListener("click", (event) => {
  const button = event.target.closest("[data-extend-installation]");
  if (!button) return;
  const form = document.querySelector("#warranty-extension-form");
  form.elements.installationId.value = button.dataset.extendInstallation;
  form.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "center" });
});
document.querySelector("#cancel-extension").addEventListener("click", () => { document.querySelector("#warranty-extension-form").hidden = true; });
document.querySelector("#warranty-extension-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  try {
    await api(`/api/admin/installations/${values.installationId}`, { method: "PATCH", body: JSON.stringify({ additionalDays: Number(values.additionalDays), additionalKm: Number(values.additionalKm), notes: values.notes }) });
    setMessage(fileMessage, "Garantia y proxima revision extendidas.", true);
    form.hidden = true;
    form.reset();
    await openCustomerFile(activeCustomerId);
  } catch (error) { setMessage(fileMessage, error.message); }
});

document.querySelectorAll("[data-normalize]").forEach((input) => input.addEventListener("input", () => {
  if (input.dataset.normalize === "upper") input.value = input.value.toUpperCase();
  if (input.dataset.normalize === "words") input.value = input.value.replace(/(^|\s|[-'])\p{L}/gu, (letter) => letter.toUpperCase());
}));

document.querySelector("#award-points-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  const result = document.querySelector("#points-message");
  setMessage(result, "");
  try {
    const data = await api("/api/admin/points/award", { method: "POST", body: JSON.stringify({ customerCode: values.customerCode, invoiceNumber: values.invoiceNumber, amountCents: Math.round(Number(values.amount) * 100), issuedAt: new Date(`${values.issuedAt}T12:00:00`).toISOString() }) });
    setMessage(result, `Factura registrada: ${Number(data.points).toLocaleString("es-EC")} Traction Points acreditados.`, true);
    form.reset();
    await Promise.all([loadOverview(), loadCustomers("")]);
  } catch (error) { setMessage(result, error.message); }
});

document.querySelector("#admin-logout").addEventListener("click", async () => {
  await api("/api/auth/logout?role=employee", { method: "POST" });
  appView.hidden = true;
  loginView.hidden = false;
});

api("/api/auth/me?role=employee").then(({ user }) => { if (user) return openAdmin(user); }).catch(() => {});
