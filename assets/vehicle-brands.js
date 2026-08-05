export const ECUADOR_VEHICLE_BRANDS = [
  "Baic", "BMW", "BYD", "Changan", "Chery", "Chevrolet", "Citroen", "DFSK",
  "Dongfeng", "Fiat", "Ford", "Foton", "Geely", "Great Wall", "Haval", "Honda",
  "Hyundai", "Isuzu", "JAC", "Jeep", "JMC", "Kia", "Land Rover", "Lexus",
  "Mazda", "Mercedes-Benz", "MG", "Mitsubishi", "Nissan", "Peugeot", "RAM",
  "Renault", "Shineray", "Sinotruk", "Subaru", "Suzuki", "Toyota", "Volkswagen",
  "Volvo", "Zotye"
];

export function vehicleBrandOptions(selected = "") {
  const normalized = String(selected).toLocaleLowerCase("es-EC");
  return ["<option value=\"\">Selecciona una marca</option>", ...ECUADOR_VEHICLE_BRANDS.map((brand) =>
    `<option${brand.toLocaleLowerCase("es-EC") === normalized ? " selected" : ""}>${brand}</option>`
  )].join("");
}
