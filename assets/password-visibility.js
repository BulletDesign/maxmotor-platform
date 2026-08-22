function enhancePasswordInput(input, index) {
  if (input.dataset.visibilityReady) return;
  input.dataset.visibilityReady = "true";
  if (input.autocomplete === "current-password") input.removeAttribute("minlength");

  const wrapper = document.createElement("span");
  wrapper.className = "password-field";
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "password-visibility";
  button.setAttribute("aria-controls", input.id || `password-input-${index}`);
  button.setAttribute("aria-label", "Mostrar contraseña");
  button.textContent = "Ver";
  if (!input.id) input.id = `password-input-${index}`;
  button.addEventListener("click", () => {
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    button.textContent = reveal ? "Ocultar" : "Ver";
    button.setAttribute("aria-label", reveal ? "Ocultar contraseña" : "Mostrar contraseña");
    input.focus({ preventScroll: true });
  });
  wrapper.appendChild(button);
}

function initializePasswordVisibility() {
  document.querySelectorAll('input[type="password"]').forEach(enhancePasswordInput);
  if (document.querySelector("#password-visibility-styles")) return;
  const styles = document.createElement("style");
  styles.id = "password-visibility-styles";
  styles.textContent = `
    .password-field{position:relative;display:block;width:100%}
    .password-field>input{width:100%;padding-right:5.3rem!important}
    .password-visibility{position:absolute;top:50%;right:.55rem;min-width:3.9rem;min-height:2.2rem;transform:translateY(-50%);border:1px solid rgba(255,255,255,.18);padding:.35rem .55rem;color:#f5f3ec;background:#20231f;font:800 .58rem/1 Montserrat,sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}
    .password-visibility:hover,.password-visibility:focus-visible{border-color:#e64132;color:#fff;outline:none}
  `;
  document.head.appendChild(styles);
}

initializePasswordVisibility();
