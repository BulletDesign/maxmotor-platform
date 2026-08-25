export const MAXMOTOR_MEDIA_BASE = "https://media.maxmotor4x4.com/repoimg/bucket_accesorios_autos/";

export const mediaUrl = (file) => `${MAXMOTOR_MEDIA_BASE}${encodeURIComponent(file)}`;

const groups = {
  towing: [
    "barra_de_tiro_hyundai.webp", "barra_de_tiro_subaru.webp", "barra_de_tiro_tank_500_2.webp",
    "barra_de_tiro_tank_500_3.webp", "barra_de_tiro_tank_500.webp", "bola_de_tiro_barra_de_tiro.webp",
  ],
  frontProtection: [
    "Bullbar_delantero_f150_ford.webp", "bullbar_delantero_hilux_gr.webp", "bullbar_delantero_mazda_bt50.webp",
    "bullbar_delantero_poer (2).webp", "bullbar_delantero_poer.webp", "bullbar_delantero_toyota_hilux_gr.webp",
    "bullbar_delantero_wrangler.webp", "bullbar_ldelantero_andcruiser.webp", "bullbar_posterior_mazda_bt50.webp",
    "bullbar_posterior_poer.webp", "bullbar_posterior_toyota_hilux.webp", "Bullbar_y_bumper_delantero_seguridad.webp",
    "Bummper_poer_overland.webp", "bumper_bt50_mazda.webp", "bumper_delantero_policia_ciauto.webp",
    "bumper_delantero_seguridad.webp", "bumper_delantero_toyota_hilux (2).webp", "bumper_delantero_toyota_hilux_gr.webp",
    "bumper_delantero_toyota_hilux.webp", "bumper_hilux_toyota.webp", "bumper_landcruiser.webp",
    "bumper_policia_ciauto (2).webp", "bumper_posterior_dmax.webp", "Bumper_posterior_mazda_bt50.webp",
    "Bumper_posterior_toyota_hilux (2).webp", "Bumper_posterior_toyota_hilux.webp",
  ],
  racks: [
    "parrilla_de_carga_furgoneta.webp", "parrilla_de_techo_furgoneta.webp", "Parrilla_de_techo_overland.webp",
    "parrilla_Furgoneta.webp", "parrilla_gr_fortuner.webp", "parrilla_overland.webp",
    "parrilla_toyota__fortuner.webp", "parrilla_Toyota_vx.webp", "parrilla.webp",
  ],
  portabike: ["portabicicleta.webp"],
  underbody: ["protector_de_carter_jac_T8.webp"],
  polyurethane: [
    "recubrimiento_de_poliuretano_industrial.webp", "recubrimiento_de_poliuretano.webp",
    "recubrimiento_poliuretano_mitsubishi.webp", "recubrimiento_poliuretano_toyota.webp",
  ],
  rollbars: [
    "rollbar_deportivo_toyota_hilux.webp", "rollbar_trabajo_escalera_jac_t8.webp",
    "Rollbar_trabajo_jac_t6.webp", "rollbar_trabajo_jac_t8.webp",
  ],
  lighting: ["soporte_de_faro_jeep_wrangler.webp"],
  suspension: ["suspension_dobinson_instalada.webp"],
  covers: ["Tapa_corrediza_isuzu.webp", "tapa_de_balde_3_partes.webp"],
};

const labelFor = (file) => file
  .replace(/\.webp$/i, "")
  .replace(/\s*\(\d+\)$/i, "")
  .replaceAll("__", "_")
  .replaceAll("_", " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const asMedia = (file, family) => ({
  file,
  family,
  src: mediaUrl(file),
  alt: `${labelFor(file)} - proyecto real Maxmotor 4x4`,
  title: labelFor(file),
  credit: "Proyecto real Maxmotor 4x4",
});

export const MAXMOTOR_MEDIA = Object.entries(groups).flatMap(([family, files]) => files.map((file) => asMedia(file, family)));
export const mediaGroup = (family) => MAXMOTOR_MEDIA.filter((item) => item.family === family);

const mediaFiles = (...files) => files
  .map((file) => MAXMOTOR_MEDIA.find((item) => item.file === file))
  .filter(Boolean);

export const PRODUCT_MEDIA = {
  "tapa-trifold": mediaGroup("covers"),
  "tapa-quadfold": mediaGroup("covers"),
  "tapa-electrica": mediaGroup("covers"),
  "tapa-enrollable": mediaGroup("covers"),
  "tiro-estandar": mediaGroup("towing"),
  "tiro-hd": mediaGroup("towing"),
  "barra-tiro-keko": mediaGroup("towing"),
  portabicicletas: mediaGroup("portabike"),
  "parrillas-carga": mediaGroup("racks"),
  "bed-rack": mediaGroup("racks"),
  "accesorios-carga": mediaGroup("racks"),
  "rollbar-zr": mediaGroup("rollbars"),
  "rollbar-hero": mediaGroup("rollbars"),
  "rollbar-rr1": mediaGroup("rollbars"),
  "rollbar-hummer": mediaGroup("rollbars"),
  "accesorios-suspension": mediaGroup("suspension"),
  lightforce: mediaGroup("lighting"),
  hella: mediaGroup("lighting"),
  "luces-led": mediaGroup("lighting"),
  "bullbar-overland": mediaFiles(
    "Bummper_poer_overland.webp",
    "bullbar_delantero_poer.webp",
    "bullbar_delantero_wrangler.webp",
    "bullbar_ldelantero_andcruiser.webp",
    "bumper_landcruiser.webp",
    "Bullbar_y_bumper_delantero_seguridad.webp",
  ),
  "bullbar-raptor": mediaFiles(
    "bullbar_delantero_toyota_hilux_gr.webp",
    "bullbar_delantero_mazda_bt50.webp",
    "bumper_delantero_toyota_hilux_gr.webp",
    "bumper_bt50_mazda.webp",
    "bumper_delantero_seguridad.webp",
    "bumper_delantero_policia_ciauto.webp",
  ),
};

const vehicleFiles = {
  "chevrolet-dmax": ["bumper_posterior_dmax.webp"],
  "ford-f150": ["Bullbar_delantero_f150_ford.webp"],
  "gwm-poer": ["bullbar_delantero_poer (2).webp", "bullbar_delantero_poer.webp", "bullbar_posterior_poer.webp", "Bummper_poer_overland.webp"],
  "isuzu-dmax": ["Tapa_corrediza_isuzu.webp"],
  "jac-t6": ["Rollbar_trabajo_jac_t6.webp"],
  "jac-t8": ["protector_de_carter_jac_T8.webp", "rollbar_trabajo_escalera_jac_t8.webp", "rollbar_trabajo_jac_t8.webp"],
  "mazda-bt50": ["bullbar_delantero_mazda_bt50.webp", "bullbar_posterior_mazda_bt50.webp", "bumper_bt50_mazda.webp", "Bumper_posterior_mazda_bt50.webp"],
  "mitsubishi-l200-triton": ["recubrimiento_poliuretano_mitsubishi.webp"],
  "toyota-hilux": [
    "bullbar_delantero_hilux_gr.webp", "bullbar_delantero_toyota_hilux_gr.webp", "bullbar_posterior_toyota_hilux.webp",
    "bumper_delantero_toyota_hilux (2).webp", "bumper_delantero_toyota_hilux_gr.webp", "bumper_delantero_toyota_hilux.webp",
    "bumper_hilux_toyota.webp", "Bumper_posterior_toyota_hilux (2).webp", "Bumper_posterior_toyota_hilux.webp",
    "recubrimiento_poliuretano_toyota.webp", "rollbar_deportivo_toyota_hilux.webp",
  ],
};

export const VEHICLE_MEDIA = Object.fromEntries(Object.entries(vehicleFiles).map(([slug, files]) => [
  slug,
  files.map((file) => MAXMOTOR_MEDIA.find((item) => item.file === file)).filter(Boolean),
]));

export const productMedia = (slug) => PRODUCT_MEDIA[slug] || [];
export const vehicleMedia = (slug) => VEHICLE_MEDIA[slug] || [];
export const firstMedia = (family, fallback = "") => mediaGroup(family)[0]?.src || fallback;
