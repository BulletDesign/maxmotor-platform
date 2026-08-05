import { setupGuidedTour } from "./guided-tour.js";
import { showAdminToast } from "./admin-feedback.js";

const login=document.querySelector("#super-login");
const app=document.querySelector("#super-app");

async function api(path,options={}){
  const response=await fetch(path,{credentials:"same-origin",...options,headers:options.body?{"content-type":"application/json",...options.headers}:options.headers});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||"Operacion no disponible");
  return data;
}
function safe(value){const node=document.createElement("span");node.textContent=String(value??"");return node.innerHTML;}
function report(id,text,ok=false){const node=document.querySelector(id);node.textContent=text;node.classList.toggle("is-success",ok);node.hidden=!text;if(text&&!id.includes("login"))showAdminToast(text,ok);}
function money(cents){return `USD ${Number((cents||0)/100).toLocaleString("es-EC",{minimumFractionDigits:2})}`;}
const PROVINCES=["Azuay","Bolívar","Cañar","Carchi","Chimborazo","Cotopaxi","El Oro","Esmeraldas","Galápagos","Guayas","Imbabura","Loja","Los Ríos","Manabí","Morona Santiago","Napo","Orellana","Pastaza","Pichincha","Santa Elena","Santo Domingo de los Tsáchilas","Sucumbíos","Tungurahua","Zamora Chinchipe"];
const PERIOD_LABELS={day:"Hoy",week:"Esta semana",month:"Este mes"};
let activePeriod="month";

function openSuperView(view){document.querySelector(`[data-view="${view}"]`)?.click();}
function initializeSuperTour(){
  setupGuidedTour({id:"superadmin",trigger:"#super-tour-button",steps:[
    {target:".period-filter",title:"Periodo de analisis",body:"Cambia entre hoy, semana y mes. Cada consulta usa limites exactos y excluye facturas futuras.",before:()=>openSuperView("intelligence")},
    {target:"#period-invoice-list",title:"Total auditable",body:"Este detalle muestra cada factura incluida en el total del periodo, con cliente, fecha y valor."},
    {target:".leaders-grid",title:"Demanda comercial",body:"Identifica el producto mas vendido y el vehiculo con mas instalaciones para orientar compras a proveedores."},
    {target:".demographic-grid",title:"Segmentacion",body:"Consulta origen provincial y edades de nuevos usuarios del periodo para planificar publicidad."},
    {target:"#product-form",title:"Catalogo operativo",body:"Define familias, productos, cobertura e intervalos de mantenimiento usados por los vendedores.",before:()=>openSuperView("catalog")},
    {target:"#reward-form",title:"Traction Rewards",body:"Publica recompensas con costo en puntos, pago restante y limite disponible.",before:()=>openSuperView("rewards")},
    {target:"#redemption-list",title:"Control de canjes",body:"Aprueba o rechaza solicitudes; al aprobar se reservan los Traction Points correspondientes.",before:()=>openSuperView("redemptions")}
  ]});
}

async function loadMetrics(period=activePeriod){
  activePeriod=period;
  const data=await api(`/api/superadmin/metrics?period=${encodeURIComponent(period)}`);
  const values={...data.stats,sales:money(data.stats.salesCents)};
  Object.entries(values).forEach(([key,value])=>{const node=document.querySelector(`#metric-${key}`);if(node)node.textContent=typeof value==="number"?value.toLocaleString("es-EC"):value;});
  const max=Math.max(...data.chart.map(item=>Number(item.invoices)),1);
  document.querySelector("#super-period-total").textContent=`${PERIOD_LABELS[period]} / ${money(data.stats.salesCents)}`;
  document.querySelector("#super-sales-chart").innerHTML=data.chart.length?data.chart.map(item=>`<div class="chart-column"><span style="height:${Math.max(8,Number(item.invoices)/max*100)}%"></span><b>${item.invoices}</b><small>${safe(period==="day"?item.label:item.label.slice(5))}</small></div>`).join(""):`<p class="empty-state">Sin facturas para ${PERIOD_LABELS[period].toLowerCase()}.</p>`;
  document.querySelector("#period-invoice-list").innerHTML=(data.invoices||[]).length?data.invoices.map(item=>`<article class="admin-list-row"><strong>${safe(item.invoiceNumber)}</strong><span>${safe(item.customerName)}<br>${safe(item.customerCode)}</span><small>${new Date(item.issuedAt).toLocaleString("es-EC")}</small><em>${money(item.amountCents)}</em></article>`).join(""):'<p class="empty-state">No hay facturas dentro de este periodo.</p>';
  document.querySelector("#family-metrics").innerHTML=data.families.map(item=>`<article class="admin-list-row"><strong>${safe(item.name)}</strong><span>Familia</span><small>Demanda acumulada</small><em>${item.units} unidades</em></article>`).join("")||'<p class="empty-state">Sin instalaciones registradas.</p>';
  document.querySelector("#vehicle-product-metrics").innerHTML=data.vehicleProducts.map(item=>`<article class="admin-list-row"><strong>${safe(item.brand)} ${safe(item.model)}</strong><span>${safe(item.familyName)}</span><small>${safe(item.productName)}</small><em>${item.units} unidades</em></article>`).join("")||'<p class="empty-state">Aun no hay patrones de compra.</p>';
  document.querySelector("#reward-list").innerHTML=data.rewards.map(item=>`<article class="admin-list-row"><strong>${safe(item.name)}</strong><span>${money(item.priceCents)} / ${money(item.cashAfterPointsCents)} + ${Number(item.pointsCost).toLocaleString("es-EC")} TP</span><small>Limite: ${item.stockLimit||"sin limite"}</small><em>${item.requested} usados</em></article>`).join("")||'<p class="empty-state">No hay recompensas creadas.</p>';
  const topProduct=data.topProducts[0];const topVehicle=data.topVehicles[0];
  document.querySelector("#top-product").textContent=topProduct?.name||"Sin datos";
  document.querySelector("#top-product-detail").textContent=topProduct?`${topProduct.familyName} / ${topProduct.units} unidad(es)`:"Esperando operaciones del periodo";
  document.querySelector("#top-vehicle").textContent=topVehicle?`${topVehicle.brand} ${topVehicle.model}`:"Sin datos";
  document.querySelector("#top-vehicle-detail").textContent=topVehicle?`${topVehicle.units} instalacion(es) vinculadas`:"Esperando operaciones del periodo";
  const provinceCounts=new Map(data.provinces.map(item=>[item.province,Number(item.users)]));const provinceMax=Math.max(...provinceCounts.values(),1);
  document.querySelector("#province-heatmap").innerHTML=PROVINCES.map(province=>{const users=provinceCounts.get(province)||0;const heat=users?(.12+(users/provinceMax)*.68).toFixed(2):.025;return `<article class="province-cell" style="--heat:${heat}"><strong>${safe(province)}</strong><span>${users}</span></article>`;}).join("");
  const ageCounts=new Map(data.ages.map(item=>[item.ageRange,Number(item.users)]));const ageMax=Math.max(...ageCounts.values(),1);
  document.querySelector("#age-metrics").innerHTML=["18-24","25-34","35-44","45-54","55+"].map(range=>{const users=ageCounts.get(range)||0;return `<article class="age-bar"><span>${range}</span><i style="width:${users?Math.max(8,users/ageMax*100):0}%"></i><b>${users}</b></article>`;}).join("");
}

async function loadCatalog(){
  const catalog=await api("/api/catalog/operational");
  document.querySelector("#product-form [name='familyId']").innerHTML=catalog.families.map(item=>`<option value="${item.id}">${safe(item.name)}</option>`).join("");
  document.querySelector("#reward-form [name='productId']").innerHTML=`<option value="">Selecciona un producto</option>${catalog.products.filter(item=>Number(item.active)&&Number(item.familyActive)).map(item=>`<option value="${item.id}">${safe(item.familyName)} / ${safe(item.name)}</option>`).join("")}`;
  document.querySelector("#product-list").innerHTML=catalog.products.map(item=>`<article class="admin-list-row"><strong>${safe(item.name)}</strong><span>${safe(item.familyName)}</span><small>Revision: ${item.serviceDays||0} dias / ${Number(item.serviceKm||0).toLocaleString("es-EC")} km</small><em>Activo</em></article>`).join("")||'<p class="empty-state">Crea el primer producto operativo.</p>';
}

async function loadRedemptions(){
  const data=await api("/api/redemptions?role=superadmin");
  const labels={requested:"Solicitado",pending_delivery:"Por entregar",rejected:"Rechazado",claimed:"Reclamado",cancelled:"Cancelado"};
  document.querySelector("#redemption-list").innerHTML=data.redemptions.length?data.redemptions.map(item=>{const vehicles=(data.vehicles||[]).filter(vehicle=>vehicle.userId===item.userId);const vehicleSelect=item.fulfillmentType==="install"?`<select data-redemption-vehicle>${vehicles.map(vehicle=>`<option value="${vehicle.id}">${safe(vehicle.brand)} ${safe(vehicle.model)} / ${safe(vehicle.plate||"sin placa")}</option>`).join("")}</select>`:"";const actions=item.status==="requested"?`<div class="redemption-actions"><button data-redemption-id="${item.id}" data-status="pending_delivery">Aceptar</button><button data-redemption-id="${item.id}" data-status="rejected">Rechazar</button></div>`:item.status==="pending_delivery"?`<div class="redemption-actions">${vehicleSelect}<button data-redemption-id="${item.id}" data-status="claimed">${item.fulfillmentType==="install"?"Marcar instalado":"Marcar entregado"}</button><button data-redemption-id="${item.id}" data-status="rejected">Rechazar</button></div>`:`<em>${labels[item.status]||safe(item.status)}</em>`;return `<article class="admin-list-row"><strong>${safe(item.fullName)}<small>${safe(item.customerCode)}</small></strong><span>${safe(item.name)}<br>${Number(item.pointsCost).toLocaleString("es-EC")} TP + ${money(item.cashAfterPointsCents)}</span><small>${new Date(item.createdAt).toLocaleString("es-EC")}</small>${actions}</article>`;}).join(""):'<p class="empty-state">No existen solicitudes de canje.</p>';
}

async function open(user){
  if(!user||user.role!=="superadmin")throw new Error("Esta cuenta no tiene acceso Superadmin");
  login.hidden=true;app.hidden=false;document.querySelector("#super-name").textContent=user.fullName;
  await Promise.all([loadMetrics(),loadCatalog(),loadRedemptions()]);
  initializeSuperTour();
}

document.querySelector("#super-login-form").addEventListener("submit",async event=>{event.preventDefault();try{await open((await api("/api/auth/login",{method:"POST",body:JSON.stringify({...Object.fromEntries(new FormData(event.currentTarget)),expectedRole:"superadmin"})})).user);}catch(error){report("#super-login-message",error.message);}});
document.querySelectorAll("[data-view]").forEach(button=>button.addEventListener("click",()=>{document.querySelectorAll("[data-view]").forEach(item=>item.classList.toggle("is-active",item===button));document.querySelectorAll("[data-panel]").forEach(panel=>{panel.hidden=panel.dataset.panel!==button.dataset.view;});document.querySelector("#super-title").textContent=button.textContent;}));
document.querySelectorAll("[data-period]").forEach(button=>button.addEventListener("click",async()=>{document.querySelectorAll("[data-period]").forEach(item=>item.classList.toggle("is-active",item===button));button.disabled=true;try{await loadMetrics(button.dataset.period);}finally{button.disabled=false;}}));
document.querySelector("#family-form").addEventListener("submit",async event=>{event.preventDefault();try{await api("/api/catalog/families",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))});report("#family-message","Familia creada.",true);event.currentTarget.reset();await loadCatalog();}catch(error){report("#family-message",error.message);}});
document.querySelector("#product-form").addEventListener("submit",async event=>{event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));try{await api("/api/catalog/operational",{method:"POST",body:JSON.stringify(values)});report("#product-message","Producto creado.",true);event.currentTarget.reset();await Promise.all([loadCatalog(),loadMetrics()]);}catch(error){report("#product-message",error.message);}});
document.querySelector("#reward-form").addEventListener("submit",async event=>{event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));try{await api("/api/rewards",{method:"POST",body:JSON.stringify({...values,pointsCost:Number(values.pointsCost),stockLimit:Number(values.stockLimit),price:Number(values.price),cashAfterPoints:Number(values.cashAfterPoints)})});report("#reward-message","Recompensa publicada.",true);event.currentTarget.reset();await loadMetrics();}catch(error){report("#reward-message",error.message);}});
document.querySelector("#reward-form [name='fulfillmentType']").addEventListener("change",event=>{const field=document.querySelector(".reward-product-field");field.hidden=event.target.value!=="install";field.querySelector("select").required=!field.hidden;});
document.querySelector("#redemption-list").addEventListener("click",async event=>{const button=event.target.closest("[data-redemption-id]");if(!button)return;const vehicleId=button.closest(".admin-list-row").querySelector("[data-redemption-vehicle]")?.value;try{await api(`/api/redemptions/${button.dataset.redemptionId}`,{method:"PATCH",body:JSON.stringify({status:button.dataset.status,vehicleId})});report("#redemption-message","Estado del canje actualizado.",true);await Promise.all([loadRedemptions(),loadMetrics()]);}catch(error){report("#redemption-message",error.message);}});
document.querySelector("#super-logout").addEventListener("click",async()=>{await api("/api/auth/logout?role=superadmin",{method:"POST"});location.reload();});
api("/api/auth/me?role=superadmin").then(({user})=>{if(user)return open(user);}).catch(()=>{});
