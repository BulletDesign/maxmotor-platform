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
function setBusy(form, busy) { form.querySelectorAll("button").forEach((button) => { button.disabled = busy; }); form.setAttribute("aria-busy", String(busy)); }
function selectTab(name) { const login = name === "login"; document.querySelector("#login-panel").hidden = !login; document.querySelector("#register-panel").hidden = login; document.querySelector("#login-tab").classList.toggle("is-active", login); document.querySelector("#register-tab").classList.toggle("is-active", !login); showMessage(""); }
function showStep(number) { document.querySelectorAll(".register-step").forEach((step) => { step.hidden = Number(step.dataset.step) !== number; }); document.querySelector("#step-count").textContent = String(number).padStart(2, "0"); document.querySelector("#step-progress").style.width = `${number * 50}%`; }

function progress(item, vehicle) {
  const now = Date.now();
  const start = new Date(item.installedAt).getTime();
  const timeProgress = item.nextServiceAt ? (now - start) / (new Date(item.nextServiceAt).getTime() - start) : 0;
  const kmProgress = item.nextServiceKm && item.nextServiceKm > item.installedKm ? (Number(vehicle.odometerKm || 0) - item.installedKm) / (item.nextServiceKm - item.installedKm) : 0;
  return Math.max(0, Math.min(100, Math.round(Math.max(timeProgress, kmProgress) * 100)));
}

function renderVehicles(vehicles, installations, user) {
  document.querySelector("#vehicles-list").innerHTML = vehicles.length ? vehicles.map((vehicle) => {
    const items = installations.filter((item) => item.vehicleId === vehicle.id);
    const accessories = items.length ? items.map((item) => {
      const used = progress(item, vehicle);
      const due = item.nextServiceAt ? new Date(item.nextServiceAt).toLocaleDateString("es-EC") : "sin fecha";
      const status = used >= 100 ? "Revision requerida" : `${100 - used}% de recorrido disponible`;
      const text = encodeURIComponent(`Hola Maxmotor. Soy ${user.fullName} (${user.customerCode}). Quiero agendar la revision de ${item.productName} en mi ${vehicle.brand} ${vehicle.model}, placa ${vehicle.plate || "sin placa"}. Estado: ${status}. Proxima revision: ${due}${item.nextServiceKm ? ` o ${item.nextServiceKm} km` : ""}.`);
      return `<article class="accessory-status"><div><span>${escapeHtml(item.familyName)}</span><strong>${escapeHtml(item.productName)}</strong></div><div class="service-track" role="progressbar" aria-valuenow="${used}" aria-valuemin="0" aria-valuemax="100"><i style="width:${used}%"></i></div><p>${status} · ${due}${item.nextServiceKm ? ` · ${Number(item.nextServiceKm).toLocaleString("es-EC")} km` : ""}</p><a href="https://wa.me/593960855932?text=${text}" target="_blank" rel="noopener">Agendar revision por WhatsApp</a></article>`;
    }).join("") : '<p class="empty-state">Aun no hay accesorios instalados en este vehiculo.</p>';
    return `<section class="garage-card"><header><div><span>VEHICULO</span><h2>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</h2></div><strong>${Number(vehicle.odometerKm || 0).toLocaleString("es-EC")} KM</strong></header><p>${vehicle.modelYear || "Ano pendiente"} · ${escapeHtml(vehicle.plate || "Sin placa")} · VIN ${escapeHtml(vehicle.vin || "no registrado")}</p><div class="accessories-stack">${accessories}</div></section>`;
  }).join("") : '<p class="empty-state">No existen vehiculos asociados.</p>';
}

function renderMovements(movements) { document.querySelector("#points-movements").innerHTML = movements.length ? movements.map((item) => `<article class="data-row"><strong>${escapeHtml(item.description)}</strong><span>${new Date(item.created_at).toLocaleDateString("es-EC")}</span><em>${item.points > 0 ? "+" : ""}${Number(item.points).toLocaleString("es-EC")} TP</em></article>`).join("") : '<p class="empty-state">Tu primer movimiento aparecera cuando registremos una factura.</p>'; }
function renderRewards(rewards, balance) { document.querySelector("#rewards-grid").innerHTML = rewards.length ? rewards.map((reward) => `<article class="reward-card"><span>RECOMPENSA</span><h3>${escapeHtml(reward.name)}</h3><p>${escapeHtml(reward.description || "Beneficio exclusivo MiMaxmotor.")}</p><strong>${Number(reward.pointsCost).toLocaleString("es-EC")} TP</strong><button type="button" data-reward-id="${reward.id}" ${balance < reward.pointsCost ? "disabled" : ""}>${balance < reward.pointsCost ? "Aun no disponible" : "Solicitar canje"}</button></article>`).join("") : '<p class="empty-state">Pronto publicaremos nuevas recompensas.</p>'; }

async function loadDashboard(user) {
  if (user.role !== "customer") return location.replace(user.role === "superadmin" ? "/portal-superadmin" : "/portal-maxmotor");
  authView.hidden = true; dashboardView.hidden = false;
  document.querySelector("#customer-name").textContent = user.fullName.split(" ")[0];
  document.querySelector("#customer-code").textContent = user.customerCode;
  document.querySelector("#summary-customer-code").textContent = user.customerCode;
  document.querySelector("#password-warning").hidden = !Boolean(user.mustChangePassword);
  const [vehiclesData, pointsData, rewardsData] = await Promise.all([api("/api/vehicles"), api("/api/points/summary"), api("/api/rewards")]);
  const vehicle = vehiclesData.vehicles[0];
  document.querySelector("#vehicle-summary").innerHTML = vehicle ? `<strong>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</strong><span>${vehicle.modelYear || "Ano no registrado"} · ${Number(vehicle.odometerKm || 0).toLocaleString("es-EC")} KM · ${escapeHtml(vehicle.plate || "Sin placa")}</span>` : "<strong>Sin vehiculo</strong><span>Solicita ayuda a un asesor.</span>";
  document.querySelector("#points-balance").textContent = Number(pointsData.balance || 0).toLocaleString("es-EC");
  document.querySelector("#points-total").textContent = Number(pointsData.balance || 0).toLocaleString("es-EC");
  document.querySelector("#invoice-count").textContent = Number(pointsData.invoiceCount || 0).toLocaleString("es-EC");
  document.querySelector("#invoice-total").textContent = `USD ${Number((pointsData.invoiceAmountCents || 0) / 100).toLocaleString("es-EC", { minimumFractionDigits: 2 })}`;
  renderVehicles(vehiclesData.vehicles, vehiclesData.installations || [], user);
  renderMovements(pointsData.movements || []);
  renderRewards(rewardsData.rewards || [], Number(pointsData.balance || 0));
}

document.querySelector("#login-tab").addEventListener("click", () => selectTab("login"));
document.querySelector("#register-tab").addEventListener("click", () => selectTab("register"));
document.querySelector(".next-step").addEventListener("click", () => { if ([...document.querySelector('[data-step="1"]').querySelectorAll("input")].every((field) => field.reportValidity())) showStep(2); });
document.querySelector(".previous-step").addEventListener("click", () => showStep(1));
document.querySelectorAll("[data-normalize]").forEach((input) => input.addEventListener("input", () => { if (input.dataset.normalize === "upper") input.value = input.value.toUpperCase(); if (input.dataset.normalize === "words") input.value = input.value.replace(/(^|\s|[-'])\p{L}/gu, (letter) => letter.toUpperCase()); }));
document.querySelectorAll("[data-client-view]").forEach((button) => button.addEventListener("click", () => { document.querySelectorAll("[data-client-view]").forEach((item) => item.classList.toggle("is-active", item === button)); document.querySelectorAll(".client-view").forEach((section) => { section.hidden = section.dataset.view !== button.dataset.clientView; }); }));

document.querySelector("#login-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; setBusy(form, true); try { await loadDashboard((await api("/api/auth/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) })).user); } catch (error) { showMessage(error.message); } finally { setBusy(form, false); } });
document.querySelector("#register-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); const payload = { fullName: values.fullName, nationalId: values.nationalId, phone: values.phone, email: values.email, password: values.password, vehicle: { brand: values.brand, model: values.model, modelYear: values.modelYear, odometerKm: values.odometerKm, plate: values.plate, vin: values.vin } }; setBusy(form, true); try { await loadDashboard((await api("/api/auth/register", { method: "POST", body: JSON.stringify(payload) })).user); } catch (error) { showMessage(error.message); } finally { setBusy(form, false); } });
document.querySelector("#rewards-grid").addEventListener("click", async (event) => { const button = event.target.closest("[data-reward-id]"); if (!button) return; const result = document.querySelector("#portal-message"); try { await api("/api/redemptions", { method: "POST", body: JSON.stringify({ rewardId: button.dataset.rewardId }) }); result.textContent = "Solicitud enviada. Maxmotor confirmara tu canje."; result.classList.add("is-success"); result.hidden = false; button.disabled = true; } catch (error) { result.textContent = error.message; result.hidden = false; } });
document.querySelector("#logout-button").addEventListener("click", async () => { await api("/api/auth/logout", { method: "POST" }); dashboardView.hidden = true; authView.hidden = false; selectTab("login"); });
api("/api/auth/me").then(({ user }) => { if (user) return loadDashboard(user); }).catch(() => {});
