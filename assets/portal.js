const authView = document.querySelector("#auth-view");
const dashboardView = document.querySelector("#dashboard-view");
const message = document.querySelector("#form-message");

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: options.body ? { "content-type": "application/json", ...options.headers } : options.headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "No pudimos completar la operación");
  return data;
}

function showMessage(text, success = false) {
  message.textContent = text;
  message.classList.toggle("is-success", success);
  message.hidden = !text;
}

function setBusy(form, busy) {
  form.querySelectorAll("button").forEach((button) => { button.disabled = busy; });
  form.setAttribute("aria-busy", String(busy));
}

function selectTab(name) {
  const login = name === "login";
  document.querySelector("#login-panel").hidden = !login;
  document.querySelector("#register-panel").hidden = login;
  document.querySelector("#login-tab").classList.toggle("is-active", login);
  document.querySelector("#register-tab").classList.toggle("is-active", !login);
  document.querySelector("#login-tab").setAttribute("aria-selected", String(login));
  document.querySelector("#register-tab").setAttribute("aria-selected", String(!login));
  showMessage("");
}

function showStep(number) {
  document.querySelectorAll(".register-step").forEach((step) => {
    const active = Number(step.dataset.step) === number;
    step.hidden = !active;
    step.classList.toggle("is-active", active);
  });
  document.querySelector("#step-count").textContent = String(number).padStart(2, "0");
  document.querySelector("#step-progress").style.width = `${number * 50}%`;
}

async function loadDashboard(user) {
  authView.hidden = true;
  dashboardView.hidden = false;
  document.querySelector("#customer-name").textContent = user.fullName.split(" ")[0];
  document.querySelector("#customer-code").textContent = user.customerCode;
  document.querySelector("#password-warning").hidden = !Boolean(user.mustChangePassword);
  const [vehiclesData, pointsData, warrantiesData] = await Promise.all([api("/api/vehicles"), api("/api/points/summary"), api("/api/warranties")]);
  const vehicle = vehiclesData.vehicles[0];
  const vehicleSummary = document.querySelector("#vehicle-summary");
  vehicleSummary.innerHTML = vehicle
    ? `<strong>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</strong><span>${vehicle.modelYear || "Año no registrado"} · ${Number(vehicle.odometerKm || 0).toLocaleString("es-EC")} KM · ${escapeHtml(vehicle.plate || "Sin placa")}</span>`
    : "<strong>Sin vehículo</strong><span>Solicita ayuda a un asesor.</span>";
  document.querySelector("#points-balance").textContent = Number(pointsData.balance || 0).toLocaleString("es-EC");
  document.querySelector("#points-total").textContent = Number(pointsData.balance || 0).toLocaleString("es-EC");
  renderVehicles(vehiclesData.vehicles);
  renderWarranties(warrantiesData.warranties);
  renderMovements(pointsData.movements || []);
}

function renderVehicles(vehicles) {
  document.querySelector("#vehicles-list").innerHTML = vehicles.length ? vehicles.map((vehicle) => `<article class="data-row"><strong>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</strong><span>${vehicle.modelYear || "Año pendiente"} · ${Number(vehicle.odometerKm || 0).toLocaleString("es-EC")} KM</span><em>${escapeHtml(vehicle.plate || "Sin placa")}</em></article>`).join("") : '<p class="empty-state">No existen vehículos asociados.</p>';
}

function renderWarranties(warranties) {
  document.querySelector("#warranties-list").innerHTML = warranties.length ? warranties.map((item) => `<article class="data-row"><strong>${escapeHtml(item.productName)}</strong><span>${escapeHtml(item.brand)} ${escapeHtml(item.model)} · Instalado ${new Date(item.installedAt).toLocaleDateString("es-EC")}</span><em>${escapeHtml(item.status)}</em></article>`).join("") : '<p class="empty-state">Todavía no tienes instalaciones con garantía registradas.</p>';
}

function renderMovements(movements) {
  document.querySelector("#points-movements").innerHTML = movements.length ? movements.map((item) => `<article class="data-row"><strong>${escapeHtml(item.description)}</strong><span>${new Date(item.created_at).toLocaleDateString("es-EC")}</span><em>${item.points > 0 ? "+" : ""}${item.points} pts</em></article>`).join("") : '<p class="empty-state">Tu primer movimiento aparecerá cuando registremos una factura.</p>';
}

function escapeHtml(value) {
  const node = document.createElement("span");
  node.textContent = value;
  return node.innerHTML;
}

document.querySelector("#login-tab").addEventListener("click", () => selectTab("login"));
document.querySelector("#register-tab").addEventListener("click", () => selectTab("register"));
document.querySelector(".next-step").addEventListener("click", () => {
  const fields = [...document.querySelector('[data-step="1"]').querySelectorAll("input")];
  if (fields.every((field) => field.reportValidity())) showStep(2);
});
document.querySelector(".previous-step").addEventListener("click", () => showStep(1));
document.querySelectorAll("[data-normalize]").forEach((input) => input.addEventListener("input", () => {
  if (input.dataset.normalize === "upper") input.value = input.value.toUpperCase();
  if (input.dataset.normalize === "words") input.value = input.value.replace(/(^|\s|[-'])\p{L}/gu, (letter) => letter.toUpperCase());
}));
document.querySelectorAll("[data-client-view]").forEach((button) => button.addEventListener("click", () => {
  const view = button.dataset.clientView;
  document.querySelectorAll("[data-client-view]").forEach((item) => item.classList.toggle("is-active", item === button));
  document.querySelectorAll(".client-view").forEach((section) => { section.hidden = section.dataset.view !== view; });
}));

document.querySelector("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  showMessage(""); setBusy(form, true);
  try { const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify(values) }); await loadDashboard(data.user); }
  catch (error) { showMessage(error.message); }
  finally { setBusy(form, false); }
});

document.querySelector("#register-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  const payload = {
    fullName: values.fullName, nationalId: values.nationalId, phone: values.phone,
    email: values.email, password: values.password,
    vehicle: { brand: values.brand, model: values.model, modelYear: values.modelYear, odometerKm: values.odometerKm, plate: values.plate, vin: values.vin },
  };
  showMessage(""); setBusy(form, true);
  try { const data = await api("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }); showMessage("Cuenta creada. Preparando tu bitácora…", true); await loadDashboard(data.user); }
  catch (error) { showMessage(error.message); }
  finally { setBusy(form, false); }
});

document.querySelector("#logout-button").addEventListener("click", async () => {
  await api("/api/auth/logout", { method: "POST" });
  dashboardView.hidden = true; authView.hidden = false; selectTab("login");
});

api("/api/auth/me").then(({ user }) => { if (user) return loadDashboard(user); }).catch(() => {});
