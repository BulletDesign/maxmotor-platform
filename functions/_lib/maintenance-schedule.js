const DAY_MS = 86400000;

export const SUSPENSION_INITIAL_SERVICE_DAYS = 20;
export const SUSPENSION_INITIAL_SERVICE_KM = 2000;
export const SUSPENSION_REGULAR_SERVICE_KM = 10000;

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function isSuspensionProduct(product) {
  return normalize(`${product?.familyName || ""} ${product?.name || ""}`).includes("suspension");
}

export function initialMaintenanceSchedule({ product, trackingMode, installedAt, installedKm }) {
  const tracksTime = ["time", "both"].includes(trackingMode);
  const tracksMileage = ["mileage", "both"].includes(trackingMode);
  const suspension = isSuspensionProduct(product);
  const days = tracksTime
    ? suspension ? SUSPENSION_INITIAL_SERVICE_DAYS : Number(product.serviceDays ?? product.warrantyDays) || 0
    : 0;
  const kilometers = tracksMileage
    ? suspension ? SUSPENSION_INITIAL_SERVICE_KM : Number(product.serviceKm ?? product.warrantyKm) || 0
    : 0;

  return {
    nextServiceAt: days ? new Date(new Date(installedAt).getTime() + days * DAY_MS).toISOString() : null,
    nextServiceKm: kilometers ? Number(installedKm) + kilometers : null,
    scheduleType: suspension ? "suspension-initial" : "standard",
  };
}

export function recurringMaintenanceInterval(product, trackingMode) {
  const tracksTime = ["time", "both"].includes(trackingMode);
  const tracksMileage = ["mileage", "both"].includes(trackingMode);
  return {
    serviceDays: tracksTime ? Math.max(0, Number(product.serviceDays ?? product.warrantyDays) || 0) : 0,
    serviceKm: tracksMileage
      ? isSuspensionProduct(product) ? SUSPENSION_REGULAR_SERVICE_KM : Math.max(0, Number(product.serviceKm ?? product.warrantyKm) || 0)
      : 0,
  };
}
