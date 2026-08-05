import { vehicleBrandOptions } from "./vehicle-brands.js";
import { setupGuidedTour } from "./guided-tour.js";

const authView = document.querySelector("#auth-view");
const dashboardView = document.querySelector("#dashboard-view");
const message = document.querySelector("#form-message");
const welcomeOffer = new URLSearchParams(location.search).get("offer") === "welcome";
const registerIntent = new URLSearchParams(location.search).get("tab") === "register";
const welcomePointsActive = Date.now() < Date.parse("2027-01-01T05:00:00.000Z");
let availableRewards = [];
let availablePoints = 0;

async function api(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", ...options, headers: options.body ? { "content-type": "application/json", ...options.headers } : options.headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "No pudimos completar la operacion");
  return data;
}

function escapeHtml(value) { const node = document.createElement("span"); node.textContent = String(value ?? ""); return node.innerHTML; }
function showMessage(text, success = false) { message.textContent = text; message.classList.toggle("is-success", success); message.hidden = !text; }
function report(selector, text, success = false) { const node = document.querySelector(selector); node.textContent = text; node.classList.toggle("is-success", success); node.hidden = !text; }
function setBusy(form, busy) { form.querySelectorAll("button").forEach((button) => { button.disabled = busy; }); form.setAttribute("aria-busy", String(busy)); }
function selectTab(name) { const login = name === "login"; const loginTab = document.querySelector("#login-tab"); const registerTab = document.querySelector("#register-tab"); document.querySelector("#login-panel").hidden = !login; document.querySelector("#register-panel").hidden = login; loginTab.classList.toggle("is-active", login); registerTab.classList.toggle("is-active", !login); loginTab.setAttribute("aria-selected", String(login)); registerTab.setAttribute("aria-selected", String(!login)); loginTab.tabIndex = login ? 0 : -1; registerTab.tabIndex = login ? -1 : 0; showMessage(""); }
function showStep(number) { document.querySelectorAll(".register-step").forEach((step) => { step.hidden = Number(step.dataset.step) !== number; }); document.querySelector("#step-count").textContent = String(number).padStart(2, "0"); document.querySelector("#step-progress").style.width = `${number * 50}%`; }

function selectView(view) {
  document.querySelectorAll("[data-client-view]").forEach((item) => item.classList.toggle("is-active", item.dataset.clientView === view));
  document.querySelectorAll(".client-view").forEach((section) => { section.hidden = section.dataset.view !== view; });
}

function initializeClientTour() {
  setupGuidedTour({
    id: "client",
    trigger: "#client-tour-button",
    steps: [
      { target: "#customer-code", title: "Tu Maxmotor ID", body: "Este codigo identifica tu cuenta en ventas, instalaciones, puntos y soporte. No se puede editar.", before: () => selectView("summary") },
      { target: "#summary-accessories", title: "Equipamiento activo", body: "Aqui aparecen tus accesorios instalados y el avance hacia su proxima revision." },
      { target: "#vehicles-list", title: "Bitacora del vehiculo", body: "Cada accesorio conserva sus revisiones, kilometrajes, fechas y acceso directo para agendar.", before: () => selectView("vehicles") },
      { target: ".loyalty-summary", title: "Traction Points", body: "Consulta saldo, facturas, recompensas disponibles y solicitudes de canje.", before: () => selectView("points") },
      { target: "#notifications-list", title: "Novedades Maxmotor", body: "Las promociones y avisos permanecen visibles durante 30 dias para que no pierdas una oportunidad.", before: () => selectView("notifications") },
      { target: ".account-grid", title: "Seguridad de tu cuenta", body: "Desde aqui puedes cambiar correo o contrasena y gestionar la baja de la cuenta.", before: () => selectView("account") }
    ]
  });
}

function progress(item, vehicle) {
  if (item.coverageType === "limited" || item.trackingMode === "none") return 0;
  const now = Date.now();
  const start = new Date(item.lastServiceAt || item.installedAt).getTime();
  const tracksTime = ["time", "both"].includes(item.trackingMode);
  const tracksMileage = ["mileage", "both"].includes(item.trackingMode);
  const timeProgress = tracksTime && item.nextServiceAt ? (now - start) / (new Date(item.nextServiceAt).getTime() - start) : null;
  const startKm = Number(item.lastServiceKm ?? item.installedKm ?? 0);
  const kmProgress = tracksMileage && item.nextServiceKm && item.nextServiceKm > startKm ? (Number(vehicle.odometerKm || 0) - startKm) / (item.nextServiceKm - startKm) : null;
  const values = [timeProgress, kmProgress].filter((value) => Number.isFinite(value));
  return Math.max(0, Math.min(100, Math.round(Math.max(...values, 0) * 100)));
}

function installationStatus(item, vehicle) {
  if (item.coverageType === "limited" || item.trackingMode === "none") return { limited: true, used: 0, status: "Garantia limitada" };
  const used = progress(item, vehicle);
  const tracksTime = ["time", "both"].includes(item.trackingMode);
  const tracksMileage = ["mileage", "both"].includes(item.trackingMode);
  const daysRemaining = item.nextServiceAt ? Math.max(0, Math.ceil((new Date(item.nextServiceAt).getTime() - Date.now()) / 86400000)) : null;
  const kmRemaining = item.nextServiceKm ? Math.max(0, Number(item.nextServiceKm) - Number(vehicle.odometerKm || 0)) : null;
  const statusParts = [];
  if (tracksTime && daysRemaining !== null) statusParts.push(`${daysRemaining} dias restantes`);
  if (tracksMileage && kmRemaining !== null) statusParts.push(`${kmRemaining.toLocaleString("es-EC")} km restantes`);
  const startParts = [];
  const dueParts = [];
  if (tracksTime) {
    startParts.push(new Date(item.lastServiceAt || item.installedAt).toLocaleDateString("es-EC"));
    if (item.nextServiceAt) dueParts.push(new Date(item.nextServiceAt).toLocaleDateString("es-EC"));
  }
  if (tracksMileage) {
    startParts.push(`${Number(item.lastServiceKm ?? item.installedKm ?? 0).toLocaleString("es-EC")} km`);
    if (item.nextServiceKm) dueParts.push(`${Number(item.nextServiceKm).toLocaleString("es-EC")} km`);
  }
  return { limited: false, used, status: used >= 100 ? "Revision requerida" : statusParts.join(" / "), start: startParts.join(" / "), due: dueParts.join(" / ") };
}

function serviceGauge(item, vehicle) {
  const data = installationStatus(item, vehicle);
  if (data.limited) return '<strong class="limited-coverage">Garantia limitada</strong>';
  return `<div class="service-gauge"><div class="service-gauge__labels"><span><small>ULTIMA REVISION</small>${escapeHtml(data.start)}</span><strong><small>PROXIMA REVISION</small>${escapeHtml(data.due)}</strong></div><div class="service-track" role="progressbar" aria-label="Recorrido hacia la proxima revision" aria-valuenow="${data.used}" aria-valuemin="0" aria-valuemax="100"><i style="width:${data.used}%"></i></div><div class="service-gauge__status"><span>${data.used}% recorrido</span><b>${escapeHtml(data.status)}</b></div></div>`;
}

function renderSummaryAccessories(vehicles, installations) {
  const vehicleMap = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  document.querySelector("#summary-accessories").innerHTML = installations.length ? installations.slice(0, 6).map((item) => {
    const vehicle = vehicleMap.get(item.vehicleId) || {};
    const coverage = { full: "Garantia completa", limited: "Garantia limitada", reward: "Recompensa instalada" }[item.coverageType] || "Garantia completa";
    return `<article class="${item.coverageType === "limited" ? "is-limited" : ""}"><span>${escapeHtml(item.familyName)} / ${coverage}</span><strong>${escapeHtml(item.productName)}</strong><small>${escapeHtml(vehicle.brand || "Vehiculo")} ${escapeHtml(vehicle.model || "")}</small>${serviceGauge(item, vehicle)}</article>`;
  }).join("") : '<p class="empty-state">Aun no tienes accesorios instalados. Cuando Maxmotor registre uno, aparecera aqui de inmediato.</p>';
}

function renderVehicles(vehicles, installations, maintenanceHistory, user) {
  document.querySelector("#vehicles-list").innerHTML = vehicles.length ? vehicles.map((vehicle) => {
    const items = installations.filter((item) => item.vehicleId === vehicle.id);
    const accessories = items.length ? items.map((item) => {
      const schedule = installationStatus(item, vehicle);
      if (schedule.limited) return `<article class="accessory-status is-limited"><div><span>${escapeHtml(item.familyName)}</span><strong>${escapeHtml(item.productName)}</strong></div><strong class="limited-coverage">Garantia limitada</strong></article>`;
      const text = encodeURIComponent(`Hola Maxmotor. Soy ${user.fullName} (${user.customerCode}). Quiero agendar la revision de ${item.productName} en mi ${vehicle.brand} ${vehicle.model}, placa ${vehicle.plate || "sin placa"}. Estado: ${schedule.status}. Proxima revision: ${schedule.due}.`);
      const history = maintenanceHistory.filter((entry) => entry.installationId === item.id);
      const historyMarkup = history.length ? `<details class="client-maintenance-history"><summary>Historial de revisiones (${history.length})</summary>${history.map((entry) => `<article><time>${new Date(entry.servicedAt).toLocaleDateString("es-EC")}</time><strong>${Number(entry.odometerKm || 0).toLocaleString("es-EC")} km</strong><span>${escapeHtml(entry.notes || "Mantenimiento completado")}</span></article>`).join("")}</details>` : '<p class="maintenance-empty">Aun no hay revisiones completadas para este accesorio.</p>';
      const coverage = { full: "Garantia completa", limited: "Garantia limitada", reward: "Recompensa instalada" }[item.coverageType] || "Garantia completa";
      return `<article class="accessory-status"><div><span>${escapeHtml(item.familyName)} / ${coverage}</span><strong>${escapeHtml(item.productName)}</strong></div>${serviceGauge(item, vehicle)}${historyMarkup}<a href="https://wa.me/593960855932?text=${text}" target="_blank" rel="noopener">Agendar revision por WhatsApp</a></article>`;
    }).join("") : '<p class="empty-state">Aun no hay accesorios instalados en este vehiculo.</p>';
    return `<section class="garage-card"><header><div><span>VEHICULO</span><h2>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</h2></div><strong>${Number(vehicle.odometerKm || 0).toLocaleString("es-EC")} KM</strong></header><p>${vehicle.modelYear || "Ano pendiente"} / ${escapeHtml(vehicle.plate || "Sin placa")} / VIN ${escapeHtml(vehicle.vin || "no registrado")}</p><div class="accessories-stack">${accessories}</div></section>`;
  }).join("") : '<p class="empty-state">No existen vehiculos asociados.</p>';
}

function renderMovements(movements) { document.querySelector("#points-movements").innerHTML = movements.length ? movements.map((item) => `<article class="data-row"><strong>${escapeHtml(item.description)}</strong><span>${new Date(item.created_at).toLocaleDateString("es-EC")}</span><em>${item.points > 0 ? "+" : ""}${Number(item.points).toLocaleString("es-EC")} TP</em></article>`).join("") : '<p class="empty-state">Tu primer movimiento aparecera cuando registremos una factura.</p>'; }
function renderRewards(rewards = availableRewards, balance = availablePoints) {
  availableRewards = rewards;
  availablePoints = balance;
  const sort = document.querySelector("#reward-sort")?.value || "points-desc";
  const sorted = [...rewards].sort((left, right) => sort === "alpha" ? left.name.localeCompare(right.name, "es") : sort === "points-asc" ? left.pointsCost - right.pointsCost : right.pointsCost - left.pointsCost);
  const eligible = sorted.filter((reward) => balance >= reward.pointsCost);
  const evaluator = document.querySelector("#points-evaluator");
  if (evaluator) evaluator.innerHTML = eligible.length ? `<span>PUEDES CANJEAR AHORA</span><strong>${eligible.length} recompensa${eligible.length === 1 ? "" : "s"}</strong><p>${eligible.slice(0, 3).map((reward) => escapeHtml(reward.name)).join(" / ")}</p>` : `<span>SIGUIENTE OBJETIVO</span><strong>${sorted.length ? `${Math.max(0, Math.min(...sorted.map((reward) => reward.pointsCost)) - balance).toLocaleString("es-EC")} TP` : "Nuevas recompensas pronto"}</strong><p>${sorted.length ? "Eso te falta para desbloquear tu primera recompensa disponible." : "Maxmotor publicara nuevas opciones de canje."}</p>`;
  document.querySelector("#rewards-grid").innerHTML = sorted.length ? sorted.map((reward) => { const savings = Math.max(0, Number(reward.priceCents || 0) - Number(reward.cashAfterPointsCents || 0)); const canRedeem = balance >= reward.pointsCost; const missing = Math.max(0, reward.pointsCost - balance); return `<article class="reward-card ${canRedeem ? "is-eligible" : ""}"><span>RECOMPENSA / ${reward.fulfillmentType === "install" ? "INSTALACION" : "VENTA"}</span><h3>${escapeHtml(reward.name)}</h3><p>${escapeHtml(reward.description || "Beneficio exclusivo MiMaxmotor.")}</p><div class="reward-prices"><s>Precio original USD ${Number((reward.priceCents || 0) / 100).toFixed(2)}</s><b>Pagas USD ${Number((reward.cashAfterPointsCents || 0) / 100).toFixed(2)} +</b></div><small class="reward-savings">Ahorras USD ${Number(savings / 100).toFixed(2)} usando tus TP</small><small class="reward-eligibility">${canRedeem ? "Puntos suficientes para canjear" : `Te faltan ${missing.toLocaleString("es-EC")} TP`}</small><strong>${Number(reward.pointsCost).toLocaleString("es-EC")} TP</strong><button type="button" data-reward-id="${reward.id}" ${canRedeem ? "" : "disabled"}>${canRedeem ? "Solicitar canje" : "Aun no disponible"}</button></article>`; }).join("") : '<p class="empty-state">Pronto publicaremos nuevas recompensas.</p>';
}
function renderRequests(redemptions, coupons) {
  const couponRows = coupons.map((item) => `<article class="data-row coupon-request"><strong>10% OFF / ${escapeHtml(item.code)}</strong><span>${escapeHtml(item.terms)}${item.expiresAt ? `<br>Vigente hasta ${new Date(item.expiresAt).toLocaleDateString("es-EC")}` : ""}</span><em>${escapeHtml(item.status)}</em></article>`);
  const statusLabel = { requested: "Solicitado", pending_delivery: "Por entregar", rejected: "Rechazado", claimed: "Reclamado", cancelled: "Cancelado" };
  const redemptionRows = redemptions.map((item) => `<article class="data-row"><strong>${escapeHtml(item.name)}</strong><span>${new Date(item.createdAt).toLocaleDateString("es-EC")} / ${Number(item.pointsCost).toLocaleString("es-EC")} TP + USD ${Number((item.cashAfterPointsCents || 0) / 100).toFixed(2)}</span><em>${statusLabel[item.status] || escapeHtml(item.status)}</em></article>`);
  document.querySelector("#redemptions-list").innerHTML = [...couponRows, ...redemptionRows].join("") || '<p class="empty-state">No tienes beneficios ni solicitudes activas.</p>';
}

function renderNotifications(items) {
  const unread = items.filter((item) => !Number(item.isRead)).length;
  const count = document.querySelector("#notification-count");
  count.textContent = unread;
  count.hidden = unread === 0;
  document.querySelector("#notifications-list").innerHTML = items.length ? items.map((item) => `<article class="notification-card ${Number(item.isRead) ? "" : "is-unread"}" data-notification-id="${item.id}"><div><span>${Number(item.isRead) ? "LEIDO" : "NUEVO"}</span><time>${new Date(item.publishedAt).toLocaleDateString("es-EC")}</time></div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.body)}</p>${Number(item.isRead) ? "" : '<button type="button" data-mark-read>Marcar como leido</button>'}</article>`).join("") : '<p class="empty-state">No hay avisos vigentes. Las nuevas promociones apareceran aqui.</p>';
}

async function loadNotifications() { const data = await api("/api/notifications?role=customer"); renderNotifications(data.notifications || []); }
async function loadAccount() { const data = await api("/api/account"); document.querySelector("#account-code").value = data.account.customerCode; document.querySelector("#account-email").value = data.account.email; }

async function loadDashboard(user) {
  if (user.role !== "customer") return location.replace(user.role === "superadmin" ? "/console" : "/portal-maxmotor");
  authView.hidden = true; dashboardView.hidden = false;
  document.querySelector("#customer-name").textContent = user.fullName.split(" ")[0];
  document.querySelector("#customer-code").textContent = user.customerCode;
  document.querySelector("#summary-customer-code").textContent = user.customerCode;
  document.querySelector("#password-warning").hidden = !Boolean(user.mustChangePassword);
  const [vehiclesData, pointsData, rewardsData, redemptionsData, couponsData] = await Promise.all([api("/api/vehicles"), api("/api/points/summary"), api("/api/rewards"), api("/api/redemptions?role=customer"), api("/api/coupons"), loadNotifications(), loadAccount()]);
  const vehicle = vehiclesData.vehicles[0];
  document.querySelector("#vehicle-summary").innerHTML = vehicle ? `<strong>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</strong><span>${vehicle.modelYear || "Ano no registrado"} / ${Number(vehicle.odometerKm || 0).toLocaleString("es-EC")} KM / ${escapeHtml(vehicle.plate || "Sin placa")}</span>` : "<strong>Sin vehiculo</strong><span>Solicita ayuda a un asesor.</span>";
  document.querySelector("#points-balance").textContent = Number(pointsData.balance || 0).toLocaleString("es-EC");
  document.querySelector("#points-total").textContent = Number(pointsData.balance || 0).toLocaleString("es-EC");
  document.querySelector("#invoice-count").textContent = Number(pointsData.invoiceCount || 0).toLocaleString("es-EC");
  document.querySelector("#invoice-total").textContent = `USD ${Number((pointsData.invoiceAmountCents || 0) / 100).toLocaleString("es-EC", { minimumFractionDigits: 2 })}`;
  renderSummaryAccessories(vehiclesData.vehicles, vehiclesData.installations || []);
  document.querySelector("#first-installation-prompt").hidden = Boolean(vehiclesData.installations?.length);
  renderVehicles(vehiclesData.vehicles, vehiclesData.installations || [], vehiclesData.maintenanceHistory || [], user);
  renderMovements(pointsData.movements || []);
  renderRewards(rewardsData.rewards || [], Number(pointsData.balance || 0));
  renderRequests(redemptionsData.redemptions || [], couponsData.coupons || []);
  initializeClientTour();
}

document.querySelector("#login-tab").addEventListener("click", () => selectTab("login"));
document.querySelector("#register-tab").addEventListener("click", () => selectTab("register"));
document.querySelector(".next-step").addEventListener("click", () => { if ([...document.querySelector('[data-step="1"]').querySelectorAll("[required]")].every((field) => field.reportValidity())) showStep(2); });
document.querySelector(".previous-step").addEventListener("click", () => showStep(1));
document.querySelectorAll("[data-normalize]").forEach((input) => input.addEventListener("input", () => { if (input.dataset.normalize === "upper") input.value = input.value.toUpperCase(); if (input.dataset.normalize === "words") input.value = input.value.replace(/(^|\s|[-'])\p{L}/gu, (letter) => letter.toUpperCase()); }));
document.querySelectorAll("[data-client-view]").forEach((button) => button.addEventListener("click", () => selectView(button.dataset.clientView)));
document.querySelectorAll("[data-open-client-view]").forEach((button) => button.addEventListener("click", () => selectView(button.dataset.openClientView)));
document.querySelector("#reward-sort").addEventListener("change", () => renderRewards());

document.querySelector("#login-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; setBusy(form, true); try { await loadDashboard((await api("/api/auth/login", { method: "POST", body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), expectedRole: "customer" }) })).user); } catch (error) { showMessage(error.message); } finally { setBusy(form, false); } });
document.querySelector("#register-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); const payload = { fullName: values.fullName, nationalId: values.nationalId, phone: values.phone, birthDate: values.birthDate, originProvince: values.originProvince, email: values.email, password: values.password, welcomeOffer, vehicle: { brand: values.brand, model: values.model, modelYear: values.modelYear, odometerKm: values.odometerKm, plate: values.plate, vin: values.vin } }; setBusy(form, true); try { const result = await api("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }); history.replaceState({}, "", "/MiMaxmotor"); await loadDashboard(result.user); if (result.welcomePoints > 0 || result.welcomeCoupon) { selectView("points"); const couponText = result.welcomeCoupon ? ` y tu cupon ${result.welcomeCoupon}` : ""; report("#portal-message", `${Number(result.welcomePoints || 0)} TP de bienvenida acreditados${couponText}.`, true); } } catch (error) { showMessage(error.message); } finally { setBusy(form, false); } });
document.querySelector("#rewards-grid").addEventListener("click", async (event) => { const button = event.target.closest("[data-reward-id]"); if (!button) return; try { await api("/api/redemptions", { method: "POST", body: JSON.stringify({ rewardId: button.dataset.rewardId }) }); report("#portal-message", "Solicitud enviada. Maxmotor confirmara tu canje.", true); button.disabled = true; const [redemptions, coupons] = await Promise.all([api("/api/redemptions?role=customer"), api("/api/coupons")]); renderRequests(redemptions.redemptions || [], coupons.coupons || []); } catch (error) { report("#portal-message", error.message); } });
document.querySelector("#notifications-list").addEventListener("click", async (event) => { const button = event.target.closest("[data-mark-read]"); if (!button) return; const card = button.closest("[data-notification-id]"); try { await api(`/api/notifications/${card.dataset.notificationId}`, { method: "PATCH", body: JSON.stringify({ read: true }) }); await loadNotifications(); } catch (error) { button.textContent = error.message; } });
document.querySelector("#account-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; setBusy(form, true); try { const data = await api("/api/account", { method: "PATCH", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); if (data.signedOut) { alert("Tu clave fue actualizada. Inicia sesion nuevamente."); location.reload(); return; } report("#account-message", "Correo actualizado correctamente.", true); form.elements.currentPassword.value = ""; } catch (error) { report("#account-message", error.message); } finally { setBusy(form, false); } });
document.querySelector("#open-delete-account").addEventListener("click", () => document.querySelector("#delete-account-dialog").showModal());
document.querySelector("#cancel-delete-account").addEventListener("click", () => document.querySelector("#delete-account-dialog").close());
document.querySelector("#delete-account-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; setBusy(form, true); try { await api("/api/account", { method: "DELETE", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); alert("Tu cuenta y sus datos fueron eliminados."); location.reload(); } catch (error) { report("#delete-account-message", error.message); setBusy(form, false); } });
document.querySelector("#logout-button").addEventListener("click", async () => { await api("/api/auth/logout?role=customer", { method: "POST" }); dashboardView.hidden = true; authView.hidden = false; selectTab("login"); });
api("/api/auth/me?role=customer").then(({ user }) => { if (user) return loadDashboard(user); }).catch(() => {});

const birthDateInput = document.querySelector("[name='birthDate']");
document.querySelector("#register-form [name='brand']").innerHTML = vehicleBrandOptions();
const adultDate = new Date(); adultDate.setFullYear(adultDate.getFullYear() - 18);
birthDateInput.max = adultDate.toISOString().slice(0, 10);
const welcomeOfferNote = document.querySelector("#welcome-offer-note");
if (welcomePointsActive || welcomeOffer) {
  welcomeOfferNote.hidden = false;
  welcomeOfferNote.querySelector("span").textContent = welcomeOffer
    ? "Recibiras 100 TP de bienvenida y 10% OFF en productos seleccionados al completar tu registro."
    : "Regístrate hasta el 31 de diciembre de 2026 y recibe 100 TP de bienvenida.";
}
if (welcomeOffer || registerIntent) selectTab("register");
