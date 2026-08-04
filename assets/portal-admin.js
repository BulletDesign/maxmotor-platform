const loginView = document.querySelector("#admin-login");
const appView = document.querySelector("#admin-app");
const loginMessage = document.querySelector("#admin-login-message");

async function api(path, options = {}) {
  const response = await fetch(path, { credentials:"same-origin", ...options, headers:options.body?{"content-type":"application/json",...options.headers}:options.headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "No pudimos completar la operación");
  return data;
}

function escapeHtml(value) { const node=document.createElement("span"); node.textContent=String(value??""); return node.innerHTML; }
function setMessage(element,text,success=false){element.textContent=text;element.classList.toggle("is-success",success);element.hidden=!text;}

async function openAdmin(user) {
  if (!user || !["employee","superadmin"].includes(user.role)) throw new Error("Esta cuenta no tiene acceso administrativo");
  loginView.hidden=true;appView.hidden=false;
  document.querySelector("#admin-name").textContent=user.fullName;
  document.querySelector("#admin-role").textContent=user.role;
  await Promise.all([loadOverview(),loadCustomers("")]);
}

async function loadOverview(){
  const data=await api("/api/admin/overview");
  Object.entries(data.stats).forEach(([key,value])=>{const node=document.querySelector(`#stat-${key}`);if(node)node.textContent=Number(value||0).toLocaleString("es-EC");});
  document.querySelector("#recent-activity").innerHTML=data.recent.length?data.recent.map(item=>`<article class="admin-list-row"><strong>${escapeHtml(item.action)}</strong><span>${escapeHtml(item.entityType)}</span><small>${new Date(item.createdAt).toLocaleString("es-EC")}</small><em>Auditado</em></article>`).join(""):'<p class="empty-state">Aún no existen operaciones auditadas.</p>';
}

async function loadCustomers(query){
  const data=await api(`/api/admin/customers?q=${encodeURIComponent(query)}`);
  document.querySelector("#customers-table").innerHTML=data.customers.length?data.customers.map(item=>`<article class="admin-list-row"><strong>${escapeHtml(item.fullName)}<small>${escapeHtml(item.customerCode)}</small></strong><span>${escapeHtml(item.email)}<br>${escapeHtml(item.phone)}</span><span>${item.vehicleCount} vehículo(s)</span><em>${Number(item.points||0)} pts</em></article>`).join(""):'<p class="empty-state">No encontramos clientes.</p>';
}

document.querySelector("#admin-login-form").addEventListener("submit",async(event)=>{
  event.preventDefault();const form=event.currentTarget;const values=Object.fromEntries(new FormData(form));setMessage(loginMessage,"");
  try{const data=await api("/api/auth/login",{method:"POST",body:JSON.stringify(values)});await openAdmin(data.user);}
  catch(error){setMessage(loginMessage,error.message);}
});

document.querySelectorAll("[data-admin-view]").forEach(button=>button.addEventListener("click",()=>{
  const view=button.dataset.adminView;document.querySelectorAll("[data-admin-view]").forEach(item=>item.classList.toggle("is-active",item===button));document.querySelectorAll(".admin-view").forEach(section=>{section.hidden=section.dataset.view!==view;});document.querySelector("#admin-title").textContent=button.textContent;
}));

let searchTimer;
document.querySelector("#customer-search").addEventListener("input",event=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>loadCustomers(event.target.value),250);});
document.querySelectorAll("[data-normalize='upper']").forEach(input=>input.addEventListener("input",()=>{input.value=input.value.toUpperCase();}));

document.querySelector("#award-points-form").addEventListener("submit",async(event)=>{
  event.preventDefault();const form=event.currentTarget;const values=Object.fromEntries(new FormData(form));const result=document.querySelector("#points-message");setMessage(result,"");
  try{const data=await api("/api/admin/points/award",{method:"POST",body:JSON.stringify({customerCode:values.customerCode,invoiceNumber:values.invoiceNumber,amountCents:Math.round(Number(values.amount)*100),issuedAt:new Date(`${values.issuedAt}T12:00:00`).toISOString()})});setMessage(result,`Factura registrada: ${data.points} puntos acreditados.`,true);form.reset();await Promise.all([loadOverview(),loadCustomers("")]);}
  catch(error){setMessage(result,error.message);}
});

document.querySelector("#admin-logout").addEventListener("click",async()=>{await api("/api/auth/logout",{method:"POST"});appView.hidden=true;loginView.hidden=false;});
api("/api/auth/me").then(({user})=>{if(user&&["employee","superadmin"].includes(user.role))return openAdmin(user);}).catch(()=>{});
