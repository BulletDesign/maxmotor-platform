let toastRegion;

function getRegion() {
  if (toastRegion) return toastRegion;
  toastRegion = document.createElement("div");
  toastRegion.className = "admin-toast-region";
  toastRegion.setAttribute("aria-live", "polite");
  toastRegion.setAttribute("aria-atomic", "true");
  document.body.append(toastRegion);
  return toastRegion;
}

export function showAdminToast(message, success = false) {
  if (!message) return;
  const toast = document.createElement("div");
  toast.className = `admin-toast ${success ? "is-success" : "is-error"}`;
  toast.setAttribute("role", success ? "status" : "alert");
  toast.innerHTML = `<span>${success ? "CAMBIO GUARDADO" : "REVISA LA OPERACION"}</span><p></p><button type="button" aria-label="Cerrar notificacion">&times;</button>`;
  toast.querySelector("p").textContent = message;
  const remove = () => { toast.classList.add("is-leaving"); setTimeout(() => toast.remove(), 220); };
  toast.querySelector("button").addEventListener("click", remove);
  getRegion().append(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(remove, success ? 4200 : 6500);
}
