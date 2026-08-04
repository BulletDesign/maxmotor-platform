const galleryMain = document.querySelector("[data-gallery-main]");
document.querySelectorAll("[data-gallery-thumb]").forEach((button) => {
  button.addEventListener("click", () => {
    galleryMain.src = button.dataset.src;
    galleryMain.alt = button.dataset.alt;
    document.querySelectorAll("[data-gallery-thumb]").forEach((thumb) => thumb.setAttribute("aria-current", "false"));
    button.setAttribute("aria-current", "true");
  });
});

const variant = document.querySelector("[data-variant]");
const vehicle = document.querySelector("[data-vehicle]");
const quote = document.querySelector("[data-quote]");
const price = document.querySelector("[data-price-output]");

function updateQuote() {
  if (!variant || !quote) return;
  const option = variant.options[variant.selectedIndex];
  const amount = Number(option.dataset.price);
  price.textContent = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const message = [
    "Hola Maxmotor 4x4, quiero cotizar:",
    `Producto: ${quote.dataset.product}`,
    `Acabado: ${option.value}`,
    `Vehiculo: ${vehicle.value || "Por confirmar"}`,
    `Precio referencial mostrado: $${amount.toFixed(2)}`,
  ].join("\n");
  quote.href = `https://wa.me/${quote.dataset.phone}?text=${encodeURIComponent(message)}`;
}

variant?.addEventListener("change", updateQuote);
vehicle?.addEventListener("input", updateQuote);
updateQuote();
