const authView = document.querySelector("#auth-view");
const dashboardView = document.querySelector("#dashboard-view");
const message = document.querySelector("#form-message");

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
function selectTab(name) { const login = name === "login"; document.querySelector("#login-panel").hidden = !login; document.querySelector("#register-panel").hidden = login; document.querySelector("#login-tab").classList.toggle("is-active", login); document.querySelector("#register-tab").classList.toggle("is-active", !login); showMessage(""); }
function showStep(number) { document.querySelectorAll(".register-step").forEach((step) => { step.hidden = Number(step.dataset.step) !== number; }); document.querySelector("#step-count").textContent = String(number).padStart(2, "0"); document.querySelector("#step-progress").style.width = `${number * 50}%`; }

function selectView(view) {
  document.querySelectorAll("[data-client-view]").forEach((item) => item.classList.toggle("is-active", item.dataset.clientView === view));
  document.querySelectorAll(".client-view").forEach((section) => { section.hidden = section.dataset.view !== view; });
}

function progress(item, vehicle) {
  const now = Date.now();
  const start = new Date(item.installedAt).getTime();
  const timeProgress = item.nextServiceAt ? (now - start) / (new Date(item.nextServiceAt).getTime() - start) : 0;
  const kmProgress = item.nextServiceKm && item.nextServiceKm > item.installedKm ? (Number(vehicle.odometerKm || 0) - item.installedKm) / (item.nextServiceKm - item.installedKm) : 0;
  return Math.max(0, Math.min(100, Math.round(Math.max(timeProgress, kmProgress) * 100)));
}

function installationStatus(item, vehicle) {
  const used = progress(item, vehicle);
  const due = item.nextServiceAt ? new Date(item.nextServiceAt).toLocaleDateString("es-EC") : "sin fecha";
  const daysRemaining = item.nextServiceAt ? Math.max(0, Math.ceil((new Date(item.nextServiceAt).getTime() - Date.now()) / 86400000)) : null;
  const kmRemaining = item.nextServiceKm ? Math.max(0, Number(item.nextServiceKm) - Number(vehicle.odometerKm || 0)) : null;
  const status = used >= 100 ? "Revision requerida" : `${daysRemaining !== null ? `${daysRemaining} dias` : "sin limite de tiempo"}${kmRemaining !== null ? ` / ${kmRemaining.toLocaleString("es-EC")} km restantes` : ""}`;
  return { used, due, status };
}

function renderSummaryAccessories(vehicles, installations) {
  const vehicleMap = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  document.querySelector("#summary-accessories").innerHTML = installations.length ? installations.slice(0, 6).map((item) => {
    const vehicle = vehicleMap.get(item.vehicleId) || {};
    const { used, status } = installationStatus(item, vehicle);
    return `<article><span>${escapeHtml(item.familyName)}</span><strong>${escapeHtml(item.productName)}</strong><small>${escapeHtml(vehicle.brand || "Vehiculo")} ${escapeHtml(vehicle.model || "")} / ${escapeHtml(status)}</small><div class="service-track"><i style="width:${used}%"></i></div></article>`;
  }).join("") : '<p class="empty-state">Aun no tienes accesorios instalados. Cuando Maxmotor registre uno, aparecera aqui de inmediato.</p>';
}

function renderVehicles(vehicles, installations, user) {
  document.querySelector("#vehicles-list").innerHTML = vehicles.length ? vehicles.map((vehicle) => {
    const items = installations.filter((item) => item.vehicleId === vehicle.id);
    const accessories = items.length ? items.map((item) => {
      const { used, due, status } = installationStatus(item, vehicle);
      const text = encodeURIComponent(`Hola Maxmotor. Soy ${user.fullName} (${user.customerCode}). Quiero agendar la revision de ${item.productName} en mi ${vehicle.brand} ${vehicle.model}, placa ${vehicle.plate || "sin placa"}. Estado: ${status}. Proxima revision: ${due}${item.nextServiceKm ? ` o ${item.nextServiceKm} km` : ""}.`);
      return `<article class="accessory-status"><div><span>${escapeHtml(item.familyName)}</span><strong>${escapeHtml(item.productName)}</strong></div><div class="service-track" role="progressbar" aria-valuenow="${used}" aria-valuemin="0" aria-valuemax="100"><i style="width:${used}%"></i></div><p>${escapeHtml(status)} / ${due}${item.nextServiceKm ? ` / ${Number(item.nextServiceKm).toLocaleString("es-EC")} km` : ""}</p><a href="https://wa.me/593960855932?text=${text}" target="_blank" rel="noopener">Agendar revision por WhatsApp</a></article>`;
    }).join("") : '<p class="empty-state">Aun no hay accesorios instalados en este vehiculo.</p>';
    return `<section class="garage-card"><header><div><span>VEHICULO</span><h2>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</h2></div><strong>${Number(vehicle.odometerKm || 0).toLocaleString("es-EC")} KM</strong></header><p>${vehicle.modelYear || "Ano pendiente"} / ${escapeHtml(vehicle.plate || "Sin placa")} / VIN ${escapeHtml(vehicle.vin || "no registrado")}</p><div class="accessories-stack">${accessories}</div></section>`;
  }).join("") : '<p class="empty-state">No existen vehiculos asociados.</p>';
}

function renderMovements(movements) { document.querySelector("#points-movements").innerHTML = movements.length ? movements.map((item) => `<article class="data-row"><strong>${escapeHtml(item.description)}</strong><span>${new Date(item.created_at).toLocaleDateString("es-EC")}</span><em>${item.points > 0 ? "+" : ""}${Number(item.points).toLocaleString("es-EC")} TP</em></article>`).join("") : '<p class="empty-state">Tu primer movimiento aparecera cuando registremos una factura.</p>'; }
function renderRewards(rewards, balance) { document.querySelector("#rewards-grid").innerHTML = rewards.length ? rewards.map((reward) => `<article class="reward-card"><span>RECOMPENSA</span><h3>${escapeHtml(reward.name)}</h3><p>${escapeHtml(reward.description || "Beneficio exclusivo MiMaxmotor.")}</p><div class="reward-prices"><s>USD ${Number((reward.priceCents || 0) / 100).toFixed(2)}</s><b>USD ${Number((reward.cashAfterPointsCents || 0) / 100).toFixed(2)} +</b></div><strong>${Number(reward.pointsCost).toLocaleString("es-EC")} TP</strong><button type="button" data-reward-id="${reward.id}" ${balance < reward.pointsCost ? "disabled" : ""}>${balance < reward.pointsCost ? "Aun no disponible" : "Solicitar canje"}</button></article>`).join("") : '<p class="empty-state">Pronto publicaremos nuevas recompensas.</p>'; }
function renderRedemptions(items) { document.querySelector("#redemptions-list").innerHTML = items.length ? items.map((item) => `<article class="data-row"><strong>${escapeHtml(item.name)}</strong><span>${new Date(item.createdAt).toLocaleDateString("es-EC")} / ${Number(item.pointsCost).toLocaleString("es-EC")} TP</span><em>${escapeHtml(item.status)}</em></article>`).join("") : '<p class="empty-state">No tienes solicitudes de canje.</p>'; }

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
  if (user.role !== "customer") return location.replace(user.role === "superadmin" ? "/portal-superadmin" : "/portal-maxmotor");
  authView.hidden = true; dashboardView.hidden = false;
  document.querySelector("#customer-name").textContent = user.fullName.split(" ")[0];
  document.querySelector("#customer-code").textContent = user.customerCode;
  document.querySelector("#summary-customer-code").textContent = user.customerCode;
  document.querySelector("#password-warning").hidden = !Boolean(user.mustChangePassword);
  const [vehiclesData, pointsData, rewardsData, redemptionsData] = await Promise.all([api("/api/vehicles"), api("/api/points/summary"), api("/api/rewards"), api("/api/redemptions?role=customer"), loadNotifications(), loadAccount()]);
  const vehicle = vehiclesData.vehicles[0];
  document.querySelector("#vehicle-summary").innerHTML = vehicle ? `<strong>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</strong><span>${vehicle.modelYear || "Ano no registrado"} / ${Number(vehicle.odometerKm || 0).toLocaleString("es-EC")} KM / ${escapeHtml(vehicle.plate || "Sin placa")}</span>` : "<strong>Sin vehiculo</strong><span>Solicita ayuda a un asesor.</span>";
  document.querySelector("#points-balance").textContent = Number(pointsData.balance || 0).toLocaleString("es-EC");
  document.querySelector("#points-total").textContent = Number(pointsData.balance || 0).toLocaleString("es-EC");
  document.querySelector("#invoice-count").textContent = Number(pointsData.invoiceCount || 0).toLocaleString("es-EC");
  document.querySelector("#invoice-total").textContent = `USD ${Number((pointsData.invoiceAmountCents || 0) / 100).toLocaleString("es-EC", { minimumFractionDigits: 2 })}`;
  renderSummaryAccessories(vehiclesData.vehicles, vehiclesData.installations || []);
  renderVehicles(vehiclesData.vehicles, vehiclesData.installations || [], user);
  renderMovements(pointsData.movements || []);
  renderRewards(rewardsData.rewards || [], Number(pointsData.balance || 0));
  renderRedemptions(redemptionsData.redemptions || []);
}

document.querySelector("#login-tab").addEventListener("click", () => selectTab("login"));
document.querySelector("#register-tab").addEventListener("click", () => selectTab("register"));
document.querySelector(".next-step").addEventListener("click", () => { if ([...document.querySelector('[data-step="1"]').querySelectorAll("input")].every((field) => field.reportValidity())) showStep(2); });
document.querySelector(".previous-step").addEventListener("click", () => showStep(1));
document.querySelectorAll("[data-normalize]").forEach((input) => input.addEventListener("input", () => { if (input.dataset.normalize === "upper") input.value = input.value.toUpperCase(); if (input.dataset.normalize === "words") input.value = input.value.replace(/(^|\s|[-'])\p{L}/gu, (letter) => letter.toUpperCase()); }));
document.querySelectorAll("[data-client-view]").forEach((button) => button.addEventListener("click", () => selectView(button.dataset.clientView)));
document.querySelectorAll("[data-open-client-view]").forEach((button) => button.addEventListener("click", () => selectView(button.dataset.openClientView)));

document.querySelector("#login-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; setBusy(form, true); try { await loadDashboard((await api("/api/auth/login", { method: "POST", body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), expectedRole: "customer" }) })).user); } catch (error) { showMessage(error.message); } finally { setBusy(form, false); } });
document.querySelector("#register-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); const payload = { fullName: values.fullName, nationalId: values.nationalId, phone: values.phone, email: values.email, password: values.password, vehicle: { brand: values.brand, model: values.model, modelYear: values.modelYear, odometerKm: values.odometerKm, plate: values.plate, vin: values.vin } }; setBusy(form, true); try { await loadDashboard((await api("/api/auth/register", { method: "POST", body: JSON.stringify(payload) })).user); } catch (error) { showMessage(error.message); } finally { setBusy(form, false); } });
document.querySelector("#rewards-grid").addEventListener("click", async (event) => { const button = event.target.closest("[data-reward-id]"); if (!button) return; try { await api("/api/redemptions", { method: "POST", body: JSON.stringify({ rewardId: button.dataset.rewardId }) }); report("#portal-message", "Solicitud enviada. Maxmotor confirmara tu canje.", true); button.disabled = true; const data = await api("/api/redemptions?role=customer"); renderRedemptions(data.redemptions || []); } catch (error) { report("#portal-message", error.message); } });
document.querySelector("#notifications-list").addEventListener("click", async (event) => { const button = event.target.closest("[data-mark-read]"); if (!button) return; const card = button.closest("[data-notification-id]"); try { await api(`/api/notifications/${card.dataset.notificationId}`, { method: "PATCH", body: JSON.stringify({ read: true }) }); await loadNotifications(); } catch (error) { button.textContent = error.message; } });
document.querySelector("#account-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; setBusy(form, true); try { const data = await api("/api/account", { method: "PATCH", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); if (data.signedOut) { alert("Tu clave fue actualizada. Inicia sesion nuevamente."); location.reload(); return; } report("#account-message", "Correo actualizado correctamente.", true); form.elements.currentPassword.value = ""; } catch (error) { report("#account-message", error.message); } finally { setBusy(form, false); } });
document.querySelector("#open-delete-account").addEventListener("click", () => document.querySelector("#delete-account-dialog").showModal());
document.querySelector("#cancel-delete-account").addEventListener("click", () => document.querySelector("#delete-account-dialog").close());
document.querySelector("#delete-account-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; setBusy(form, true); try { await api("/api/account", { method: "DELETE", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); alert("Tu cuenta y sus datos fueron eliminados."); location.reload(); } catch (error) { report("#delete-account-message", error.message); setBusy(form, false); } });
document.querySelector("#logout-button").addEventListener("click", async () => { await api("/api/auth/logout?role=customer", { method: "POST" }); dashboardView.hidden = true; authView.hidden = false; selectTab("login"); });
api("/api/auth/me?role=customer").then(({ user }) => { if (user) return loadDashboard(user); }).catch(() => {});
