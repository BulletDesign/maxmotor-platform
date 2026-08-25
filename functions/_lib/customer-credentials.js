export function customerCredentialsMessage({ fullName, customerCode, email, temporaryPassword, welcomePoints = 0, welcomeCoupon = null }) {
  const firstName = String(fullName || "Cliente").trim().split(/\s+/)[0];
  const benefits = [
    "Historial de accesorios instalados",
    "Garantias y proximas revisiones",
    "Traction Points y recompensas",
    "Estado de tus solicitudes y beneficios",
  ].map((item) => `- ${item}`).join("\n");
  const welcome = welcomePoints > 0
    ? `\nBeneficio de bienvenida: ${welcomePoints} TP${welcomeCoupon ? ` y cupon 10% OFF ${welcomeCoupon}` : ""}.`
    : "";
  return `Hola ${firstName}, tu cuenta Mi Maxmotor ya esta activa.\n\nMaxmotor ID: ${customerCode}\nUsuario: ${email}\nContrasena temporal: ${temporaryPassword}\n\nDesde Mi Maxmotor puedes revisar:\n${benefits}${welcome}\n\nIngresa en https://maxmotor4x4.com/MiMaxmotor\nPor seguridad, cambia tu contrasena desde la seccion Cuenta al ingresar.\n\nTOOLS NOT TOYS`;
}
