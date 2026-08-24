const visuals = [
  "https://images.pexels.com/photos/12138568/pexels-photo-12138568.jpeg?auto=compress&cs=tinysrgb&w=1800",
  "https://images.pexels.com/photos/5628354/pexels-photo-5628354.jpeg?auto=compress&cs=tinysrgb&w=1800",
  "https://images.pexels.com/photos/35331201/pexels-photo-35331201.jpeg?auto=compress&cs=tinysrgb&w=1800",
  "https://images.pexels.com/photos/28639327/pexels-photo-28639327.jpeg?auto=compress&cs=tinysrgb&w=1800",
  "https://images.pexels.com/photos/30139881/pexels-photo-30139881.jpeg?auto=compress&cs=tinysrgb&w=1800",
];

const model = (slug, brand, name, powertrain, officialUrl, imageIndex) => ({
  slug,
  brand,
  model: name,
  powertrain,
  officialUrl,
  image: visuals[imageIndex % visuals.length],
});

export const ELECTRIFIED_VEHICLES = [
  model("deepal-s05", "Deepal", "S05", "Eléctrico y rango extendido", "https://www.deepal.com.ec/modelos/s05", 0),
  model("deepal-s07", "Deepal", "S07", "Eléctrico y rango extendido", "https://www.deepal.com.ec/modelos/s07", 1),
  model("deepal-g318", "Deepal", "G318", "Rango extendido 4x4", "https://www.deepal.com.ec/pdf/ficha_deepal_g318.pdf", 2),
  model("geely-ex2", "Geely", "EX2", "100% eléctrico", "https://www.geely.com.ec/geely-ex2", 3),
  model("geely-ex5", "Geely", "EX5", "100% eléctrico", "https://www.geely.com.ec/geely-ex5", 4),
  model("geely-starray-em-i", "Geely", "Starray EM-i", "Híbrido enchufable", "https://www.geely.com.ec/geely-starray-em-i", 0),
  model("suzuki-dzire-hybrid", "Suzuki", "Dzire Hybrid", "Híbrido", "https://suzukiecuador.com/modelos/", 1),
  model("suzuki-across-hybrid", "Suzuki", "Across Hybrid", "SUV híbrido", "https://suzukiecuador.com/modelos/", 2),
  model("suzuki-s-cross-hybrid", "Suzuki", "S-Cross Hybrid", "SUV híbrido", "https://suzukiecuador.com/modelos/", 3),
  model("suzuki-fronx-hybrid", "Suzuki", "Fronx Hybrid", "SUV híbrido", "https://suzukiecuador.com/modelos/", 4),
  model("suzuki-swift-hybrid", "Suzuki", "Swift Hybrid", "Automóvil híbrido", "https://suzukiecuador.com/swift/", 0),
  model("suzuki-xl7-hybrid", "Suzuki", "XL7 Hybrid", "SUV híbrido", "https://suzukiecuador.com/modelos/", 1),
  model("suzuki-grand-vitara-hybrid", "Suzuki", "Grand Vitara Hybrid", "SUV híbrido", "https://suzukiecuador.com/modelos/", 2),
  model("changan-cs55-r-ev", "Changan", "CS55 R-EV", "Rango extendido", "https://www.changanecuador.com/", 3),
  model("byd-seagull", "BYD", "Seagull", "100% eléctrico", "https://bydauto.ec/modelos/", 4),
  model("byd-dolphin", "BYD", "Dolphin", "100% eléctrico", "https://bydauto.ec/modelos/", 0),
  model("byd-yuan-pro", "BYD", "Yuan Pro", "100% eléctrico", "https://bydauto.ec/modelos/", 1),
  model("byd-yuan-plus", "BYD", "Yuan Plus", "100% eléctrico", "https://bydauto.ec/modelos/", 2),
  model("byd-sealion", "BYD", "Sealion", "100% eléctrico", "https://bydauto.ec/modelos/", 3),
  model("byd-seal", "BYD", "Seal", "100% eléctrico", "https://bydauto.ec/modelos/", 4),
  model("byd-han", "BYD", "Han", "100% eléctrico", "https://bydauto.ec/modelos/", 0),
  model("byd-tang", "BYD", "Tang", "100% eléctrico", "https://bydauto.ec/modelos/", 1),
  model("byd-yuan-pro-dm-i", "BYD", "Yuan Pro DM-i", "Súper híbrido", "https://bydauto.ec/modelos/", 2),
  model("byd-atto-8", "BYD", "Atto 8", "Súper híbrido", "https://bydauto.ec/modelos/", 3),
  model("byd-song-plus", "BYD", "Song Plus", "Súper híbrido", "https://bydauto.ec/modelos/", 4),
  model("byd-shark", "BYD", "Shark", "Pickup súper híbrida", "https://bydauto.ec/modelos/", 0),
];

export const electrifiedName = (vehicle) => `${vehicle.brand} ${vehicle.model}`;
