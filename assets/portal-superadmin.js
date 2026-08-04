const login=document.querySelector("#super-login");
const app=document.querySelector("#super-app");

async function api(path,options={}){
  const response=await fetch(path,{credentials:"same-origin",...options,headers:options.body?{"content-type":"application/json",...options.headers}:options.headers});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||"Operacion no disponible");
  return data;
}
function safe(value){const node=document.createElement("span");node.textContent=String(value??"");return node.innerHTML;}
function report(id,text,ok=false){const node=document.querySelector(id);node.textContent=text;node.classList.toggle("is-success",ok);node.hidden=!text;}
function money(cents){return `USD ${Number((cents||0)/100).toLocaleString("es-EC",{minimumFractionDigits:2})}`;}

async function loadMetrics(){
  const data=await api("/api/superadmin/metrics");
  const values={...data.stats,sales:money(data.stats.salesCents)};
  Object.entries(values).forEach(([key,value])=>{const node=document.querySelector(`#metric-${key}`);if(node)node.textContent=typeof value==="number"?value.toLocaleString("es-EC"):value;});
  const max=Math.max(...data.monthly.map(item=>Number(item.invoices)),1);
  document.querySelector("#super-month-total").textContent=money(data.stats.salesCents);
  document.querySelector("#super-sales-chart").innerHTML=data.monthly.length?data.monthly.map(item=>`<div class="chart-column"><span style="height:${Math.max(8,Number(item.invoices)/max*100)}%"></span><b>${item.invoices}</b><small>${String(item.day).padStart(2,"0")}</small></div>`).join(""):'<p class="empty-state">Sin facturas este mes.</p>';
  document.querySelector("#family-metrics").innerHTML=data.families.map(item=>`<article class="admin-list-row"><strong>${safe(item.name)}</strong><span>Familia</span><small>Demanda acumulada</small><em>${item.units} unidades</em></article>`).join("")||'<p class="empty-state">Sin instalaciones registradas.</p>';
  document.querySelector("#vehicle-product-metrics").innerHTML=data.vehicleProducts.map(item=>`<article class="admin-list-row"><strong>${safe(item.brand)} ${safe(item.model)}</strong><span>${safe(item.familyName)}</span><small>${safe(item.productName)}</small><em>${item.units} unidades</em></article>`).join("")||'<p class="empty-state">Aun no hay patrones de compra.</p>';
  document.querySelector("#reward-list").innerHTML=data.rewards.map(item=>`<article class="admin-list-row"><strong>${safe(item.name)}</strong><span>${money(item.priceCents)} / ${money(item.cashAfterPointsCents)} + ${Number(item.pointsCost).toLocaleString("es-EC")} TP</span><small>Limite: ${item.stockLimit||"sin limite"}</small><em>${item.requested} usados</em></article>`).join("")||'<p class="empty-state">No hay recompensas creadas.</p>';
}

async function loadCatalog(){
  const catalog=await api("/api/catalog/operational");
  document.querySelector("#product-form [name='familyId']").innerHTML=catalog.families.map(item=>`<option value="${item.id}">${safe(item.name)}</option>`).join("");
  document.querySelector("#product-list").innerHTML=catalog.products.map(item=>`<article class="admin-list-row"><strong>${safe(item.name)}</strong><span>${safe(item.familyName)}</span><small>${item.warrantyDays||0} dias / ${Number(item.warrantyKm||0).toLocaleString("es-EC")} km</small><em>Activo</em></article>`).join("")||'<p class="empty-state">Crea el primer producto operativo.</p>';
}

async function loadRedemptions(){
  const data=await api("/api/redemptions?role=superadmin");
  document.querySelector("#redemption-list").innerHTML=data.redemptions.length?data.redemptions.map(item=>`<article class="admin-list-row"><strong>${safe(item.fullName)}<small>${safe(item.customerCode)}</small></strong><span>${safe(item.name)}<br>${Number(item.pointsCost).toLocaleString("es-EC")} TP + ${money(item.cashAfterPointsCents)}</span><small>${new Date(item.createdAt).toLocaleString("es-EC")}</small>${item.status==="requested"?`<div class="redemption-actions"><button data-redemption-id="${item.id}" data-status="approved">Aprobar</button><button data-redemption-id="${item.id}" data-status="rejected">Rechazar</button></div>`:`<em>${safe(item.status)}</em>`}</article>`).join(""):'<p class="empty-state">No existen solicitudes de canje.</p>';
}

async function open(user){
  if(!user||user.role!=="superadmin")throw new Error("Esta cuenta no tiene acceso Superadmin");
  login.hidden=true;app.hidden=false;document.querySelector("#super-name").textContent=user.fullName;
  await Promise.all([loadMetrics(),loadCatalog(),loadRedemptions()]);
}

document.querySelector("#super-login-form").addEventListener("submit",async event=>{event.preventDefault();try{await open((await api("/api/auth/login",{method:"POST",body:JSON.stringify({...Object.fromEntries(new FormData(event.currentTarget)),expectedRole:"superadmin"})})).user);}catch(error){report("#super-login-message",error.message);}});
document.querySelectorAll("[data-view]").forEach(button=>button.addEventListener("click",()=>{document.querySelectorAll("[data-view]").forEach(item=>item.classList.toggle("is-active",item===button));document.querySelectorAll("[data-panel]").forEach(panel=>{panel.hidden=panel.dataset.panel!==button.dataset.view;});document.querySelector("#super-title").textContent=button.textContent;}));
document.querySelector("#family-form").addEventListener("submit",async event=>{event.preventDefault();try{await api("/api/catalog/families",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))});report("#family-message","Familia creada.",true);event.currentTarget.reset();await loadCatalog();}catch(error){report("#family-message",error.message);}});
document.querySelector("#product-form").addEventListener("submit",async event=>{event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));try{await api("/api/catalog/operational",{method:"POST",body:JSON.stringify(values)});report("#product-message","Producto creado.",true);event.currentTarget.reset();await Promise.all([loadCatalog(),loadMetrics()]);}catch(error){report("#product-message",error.message);}});
document.querySelector("#reward-form").addEventListener("submit",async event=>{event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));try{await api("/api/rewards",{method:"POST",body:JSON.stringify({...values,pointsCost:Number(values.pointsCost),stockLimit:Number(values.stockLimit),price:Number(values.price),cashAfterPoints:Number(values.cashAfterPoints)})});report("#reward-message","Recompensa publicada.",true);event.currentTarget.reset();await loadMetrics();}catch(error){report("#reward-message",error.message);}});
document.querySelector("#redemption-list").addEventListener("click",async event=>{const button=event.target.closest("[data-redemption-id]");if(!button)return;try{await api(`/api/redemptions/${button.dataset.redemptionId}`,{method:"PATCH",body:JSON.stringify({status:button.dataset.status})});report("#redemption-message",`Canje ${button.dataset.status==="approved"?"aprobado":"rechazado"}.`,true);await Promise.all([loadRedemptions(),loadMetrics()]);}catch(error){report("#redemption-message",error.message);}});
document.querySelector("#super-logout").addEventListener("click",async()=>{await api("/api/auth/logout?role=superadmin",{method:"POST"});location.reload();});
api("/api/auth/me?role=superadmin").then(({user})=>{if(user)return open(user);}).catch(()=>{});
