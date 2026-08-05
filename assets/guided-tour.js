const activeTours = new Set();

function findTarget(selector) {
  const target = typeof selector === "function" ? selector() : document.querySelector(selector);
  return target && !target.hidden ? target : null;
}

export function setupGuidedTour({ id, steps, trigger, autoStart = true }) {
  if (activeTours.has(id)) return;
  activeTours.add(id);
  const storageKey = `maxmotor-tour-${id}-v1`;
  let index = 0;
  let highlighted = null;

  const overlay = document.createElement("div");
  overlay.className = "guided-tour";
  overlay.hidden = true;
  overlay.innerHTML = `<div class="guided-tour-shade"></div><section class="guided-tour-card" role="dialog" aria-modal="true" aria-labelledby="guided-tour-title"><button class="guided-tour-close" type="button" aria-label="Cerrar guia">&times;</button><span class="guided-tour-count"></span><h2 id="guided-tour-title"></h2><p></p><div class="guided-tour-actions"><button type="button" data-tour-back>Anterior</button><button type="button" data-tour-next>Siguiente</button></div></section>`;
  document.body.append(overlay);

  const card = overlay.querySelector(".guided-tour-card");
  const closeButton = overlay.querySelector(".guided-tour-close");
  const backButton = overlay.querySelector("[data-tour-back]");
  const nextButton = overlay.querySelector("[data-tour-next]");

  function clearHighlight() {
    highlighted?.classList.remove("guided-tour-target");
    highlighted = null;
  }

  function close(completed = false) {
    clearHighlight();
    overlay.hidden = true;
    document.body.classList.remove("guided-tour-open");
    if (completed) localStorage.setItem(storageKey, "completed");
  }

  async function render() {
    clearHighlight();
    const step = steps[index];
    await step.before?.();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    highlighted = findTarget(step.target);
    highlighted?.classList.add("guided-tour-target");
    highlighted?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    overlay.querySelector(".guided-tour-count").textContent = `${String(index + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}`;
    overlay.querySelector("h2").textContent = step.title;
    overlay.querySelector("p").textContent = step.body;
    backButton.disabled = index === 0;
    nextButton.textContent = index === steps.length - 1 ? "Finalizar" : "Siguiente";
    card.dataset.position = step.position || "bottom";
    nextButton.focus({ preventScroll: true });
  }

  async function start() {
    index = 0;
    overlay.hidden = false;
    document.body.classList.add("guided-tour-open");
    await render();
  }

  closeButton.addEventListener("click", () => close());
  overlay.querySelector(".guided-tour-shade").addEventListener("click", () => close());
  backButton.addEventListener("click", async () => { if (index > 0) { index -= 1; await render(); } });
  nextButton.addEventListener("click", async () => { if (index === steps.length - 1) { close(true); return; } index += 1; await render(); });
  document.addEventListener("keydown", (event) => { if (!overlay.hidden && event.key === "Escape") close(); });
  document.querySelector(trigger)?.addEventListener("click", start);
  if (autoStart && localStorage.getItem(storageKey) !== "completed") setTimeout(start, 700);
}
