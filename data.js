/* ==========================================================================
   0. CLOUDFLARE R2 — BASE URL
   ========================================================================== */
const R2_BASE_URL = 'https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg';

/* ==========================================================================
   1. CONFIGURACIÓN DEL FORMULARIO (GOOGLE FORMS)
   ========================================================================== */
const FORM_CONFIG = {
    url: "https://docs.google.com/forms/d/e/1FAIpQLSeRcXMiUNDDfWuTk3qjaZtUW3y9MxfLU72CgbJvWVNEeNmCNg/formResponse",
    ids: {
        nombre: "entry.335607038",
        telefono: "entry.1856438131",
        auto: "entry.1114346141",
        cupon: "entry.1308133965"
    }
};

/* ==========================================================================
   2. LISTADO DE VEHÍCULOS Y DATOS
   ========================================================================== */
const range = (start, end) => Array.from({ length: (end - start) + 1 }, (_, i) => String(end - i));

const datosVehiculos = {
    'Toyota': {
        'Hilux Revo 4x2 Gasolina C/S': range(2017, 2026),
        'Hilux Revo 4x4 Gasolina C/S': range(2017, 2026),
        'Hilux Revo 4x2 Diesel C/S': range(2017, 2026),
        'Hilux Revo 4x4 Diesel C/S': range(2017, 2026),
        'Hilux Revo 4x2 Gasolina D/C': range(2017, 2026),
        'Hilux Revo 4x4 Gasolina D/C': range(2017, 2026),
        'Hilux Revo 4x2 Diesel D/C': range(2017, 2026),
        'Hilux Revo 4x4 Diesel D/C': range(2017, 2026),
        'Hilux Vigo 4x2 Gasolina C/S': range(2009, 2016),
        'Hilux Vigo 4x4 Gasolina C/S': range(2009, 2016),
        'Hilux Vigo 4x2 Diesel C/S': range(2009, 2016),
        'Hilux Vigo 4x4 Diesel C/S': range(2009, 2016),
        'Hilux Vigo 4x2 Gasolina D/C': range(2009, 2016),
        'Hilux Vigo 4x4 Gasolina D/C': range(2009, 2016),
        'Hilux Vigo 4x2 Diesel D/C': range(2009, 2016),
        'Hilux Vigo 4x4 Diesel D/C': range(2009, 2016),
        'Tundra': ['2025', '2024', '2023', '2022'],
        'Tacoma': ['2025', '2024', '2023']
    },
    'Chevrolet': {
        'Dmax 4x2 C/S': range(2020, 2026),
        'Dmax 4x4 C/S': range(2020, 2026),
        'Dmax 4x2 D/C': range(2018, 2026),
        'Dmax 4x4 D/C': range(2018, 2026),
        'Colorado': ['2025', '2024', '2023']
    },
    'Ford': {
        'New Ranger': ['2026', '2025', '2024'],
        'Ranger': range(2012, 2023),
        'F-150 Moderna': ['2025', '2024', '2023', '2022'],
        'F-150 Clásica': range(2010, 2021)
    },
    'Great Wall': {
        'Poer 500': ['2026', '2025'],
        'Poer': ['2026', '2025', '2024'],
        'Wingle S D/C': ['2026', '2025', '2024'],
        'Wingle 7': ['2025', '2024'],
        'Wingle 5': ['2024', '2023'],
        'Haval H9': ['2026', '2025'],
        'Tank 300': ['2026', '2025', '2024'],
        'Tank 500': ['2026', '2025', '2024']
    },
    'JAC': {
        'T6': range(2016, 2026),
        'T8': ['2025', '2024', '2023'],
        'T9': ['2026', '2025', '2024']
    },
    'Volkswagen': { 'Amarok 4x2': ['2025', '2024'], 'Amarok 4x4': ['2025', '2024'] },
    'Nissan': { 'Frontier': range(2020, 2026), 'Navara': range(2015, 2024) },
    'Datsun': { '1200': ['Clásico'] },
    'Mitsubishi': { 'New L200': ['2025', '2024'], 'L200 Tritón': range(2015, 2023) },
    'Kia': { 'Tasman': ['2026', '2025'] },
    'Dongfeng': { 'Rich 6': ['2025', '2024'] },
    'Foton': { 'Tunland': ['2025', '2024'] },
    'Peugeot': { 'Landtrek': ['2025', '2024'] },
    'RAM': { 'RAM 700': ['2025', '2024'], 'RAM 1200': ['2025', '2024'] },
    'Changan': { 'Hunter': ['2025', '2024'] },
    'Sinotruck': { 'Pick Up': range(2024, 2026) },
    'Otro': { 'Otro Modelo': ['2026', '2025', '2024', 'Anterior'] }
};

let vehiculosLista = [];
Object.keys(datosVehiculos).forEach(marca => {
    Object.keys(datosVehiculos[marca]).forEach(modelo => {
        vehiculosLista.push(`${marca} ${modelo}`);
    });
});

/* ==========================================================================
   3. GALERÍA DE IMÁGENES
   ========================================================================== */
const galeria = {
    'awnings': {
        'Toldo 180': [
            `${R2_BASE_URL}/toldo_180_essential.jpg`,
            `${R2_BASE_URL}/toldo_180_premium.png`
        ],
        'Toldo 270': [
            `${R2_BASE_URL}/toldo_270_essential.png`,
            `${R2_BASE_URL}/toldo_270_premium.png`
        ]
    },
    'tapa-rigida': {
        'Trifold': [
            `${R2_BASE_URL}/foto_tapa_trifold.jpeg`,
            `${R2_BASE_URL}/foto_tapa_trifold_caracteristica.png`,
            `${R2_BASE_URL}/foto_tapa_trifold_CONTEXT.png`
        ],
        'QuadFold': [
            `${R2_BASE_URL}/tapa_quad_1.jpg`,
            `${R2_BASE_URL}/tapa_quad_2.jpg`,
            `${R2_BASE_URL}/tapa_quad_1_CONTEXT.png`
        ],
        'Enrollable': [
            `${R2_BASE_URL}/foto_tapa_enrollable.jpg`,
            `${R2_BASE_URL}/foto_tapa_enrollable_caracterisitca.png`
        ],
        'Electrica': [`${R2_BASE_URL}/foto_tapa_electrica.jpg`]
    },
    'tapa-lona': [
        `${R2_BASE_URL}/lona_1.jpg`,
        `${R2_BASE_URL}/lona_2.jpg`
    ],
    'suspension': {
        'Kit Altura': [`${R2_BASE_URL}/KITALTURA.png`],
        'Suspension Pro': [
            `${R2_BASE_URL}/suspension_1.png`,
            `${R2_BASE_URL}/suspension_2.jpeg`,
            `${R2_BASE_URL}/suspension_3.png`
        ],
        'Llantas': [
            `${R2_BASE_URL}/LLANTA_BF.jpg`,
            `${R2_BASE_URL}/LLANTA_BF_CONTEXT.png`
        ],
        'Accesorios': [`${R2_BASE_URL}/acc_sus_1.jpg`, `${R2_BASE_URL}/acc_sus_2.jpg`],
        'OLD MAN EMU': [`${R2_BASE_URL}/suspension_1.png`],
        'TOUGH DOG': [`${R2_BASE_URL}/suspension_1.png`],
        'BILSTEIN': [`${R2_BASE_URL}/suspension_1.png`],
        'TJM': [`${R2_BASE_URL}/suspension_1.png`]
    },
    'overland': {
        'Toldo 180': [
            `${R2_BASE_URL}/toldo_180_essential.jpg`,
            `${R2_BASE_URL}/toldo_180_premium.png`
        ],
        'Toldo 270': [
            `${R2_BASE_URL}/toldo_270_essential.png`,
            `${R2_BASE_URL}/toldo_270_premium.png`
        ],
        'Rampas': [
            `${R2_BASE_URL}/rampa_roja.png`,
            `${R2_BASE_URL}/rampa_naranja.jpg`,
            `${R2_BASE_URL}/rampa_azul.png`,
            `${R2_BASE_URL}/rampa_verde.png`,
            `${R2_BASE_URL}/rampa_verde_CONTEXT.png`
        ],
        'Winchas': [
            `${R2_BASE_URL}/WINCHA_WARN.png`,
            `${R2_BASE_URL}/WINCHA_WARN_CONTEXT.jpg`
        ],
        'Grilletes': {
            'Negro con Rojo': [`${R2_BASE_URL}/grillete_nr_1.jpg`, `${R2_BASE_URL}/grillete_nr_2.jpg`],
            'Rojo con Negro': [`${R2_BASE_URL}/grillete_rn_1.jpg`, `${R2_BASE_URL}/grillete_rn_2.jpg`],
            'Gris Premium': [`${R2_BASE_URL}/grillete_gris_1.jpg`, `${R2_BASE_URL}/grillete_gris_2.jpg`]
        },
        'Camping': {
            'Mesas': [`${R2_BASE_URL}/mesa_camp_1.jpg`, `${R2_BASE_URL}/mesa_camp_2.jpg`],
            'Sillas': [`${R2_BASE_URL}/silla_camp_1.jpg`, `${R2_BASE_URL}/silla_camp_2.jpg`],
            'Coolers': [`${R2_BASE_URL}/cooler_1.jpg`, `${R2_BASE_URL}/cooler_2.jpg`]
        }
    },
    'carga': {
        'Aluminio': [`${R2_BASE_URL}/carga_alum_1.jpg`, `${R2_BASE_URL}/carga_alum_2.jpg`],
        'Tubo': [`${R2_BASE_URL}/carga_tubo_1.jpg`, `${R2_BASE_URL}/carga_tubo_2.jpg`],
        'Metálica': [`${R2_BASE_URL}/carga_met_1.jpg`, `${R2_BASE_URL}/carga_met_2.jpg`]
    },
    'tiro': {
        'MXR': [`${R2_BASE_URL}/tiro_1.jpg`],
        'KEKO': [`${R2_BASE_URL}/tiro_1.jpg`]
    },
    'rollbar': {
        'MXR': [`${R2_BASE_URL}/rollbar_1.webp`],
        'KEKO': [`${R2_BASE_URL}/rollbar_1.webp`]
    },
    'estribos': {
        'MXR': [`${R2_BASE_URL}/estribos_1.jpg`],
        'KEKO': [`${R2_BASE_URL}/estribos_1.jpg`]
    },
    'interior': [`${R2_BASE_URL}/interior_1.jpg`, `${R2_BASE_URL}/interior_2.jpg`],
    'iluminacion': [`${R2_BASE_URL}/iluminacion_1.jpg`, `${R2_BASE_URL}/iluminacion_2.jpg`],
    'poliuretano': {
        'intro': [`${R2_BASE_URL}/poli_bienvenida.jpg`],
        'DOMESTICO': [`${R2_BASE_URL}/poli_domestico.jpg`],
        'COMERCIAL': [`${R2_BASE_URL}/poli_comercial.jpg`],
        'INDUSTRIAL': [`${R2_BASE_URL}/poli_industrial.jpg`]
    },
    'default': [`${R2_BASE_URL}/logo%20maxmotor.png`]
};

/* ==========================================================================
   4. IMÁGENES DE PORTADA
   ========================================================================== */
const imagenesPresentacion = {
    'awnings': [`${R2_BASE_URL}/banner_awning.jpeg`],
    'tapa-rigida': [`${R2_BASE_URL}/foto_tapa.png`],
    'tapa-lona': [`${R2_BASE_URL}/lona_1.jpg`],
    'rollbar': {
        'MXR': [`${R2_BASE_URL}/rollbar_1.webp`],
        'KEKO': [`${R2_BASE_URL}/rollbar_1.webp`]
    },
    'estribos': {
        'MXR': [`${R2_BASE_URL}/foto_seguro.jpeg`],
        'KEKO': [`${R2_BASE_URL}/foto_seguro.jpeg`]
    },
    'suspension': [`${R2_BASE_URL}/suspension_1.png`],
    'poliuretano': [`${R2_BASE_URL}/foto_seguro.jpeg`],
    'tiro': {
        'MXR': [`${R2_BASE_URL}/foto_seguro.jpeg`],
        'KEKO': [`${R2_BASE_URL}/foto_seguro.jpeg`]
    },
    'overland': [`${R2_BASE_URL}/foto_overland.webp`],
    'carga': [`${R2_BASE_URL}/rampa_intro.webp`],
    'interior': [`${R2_BASE_URL}/logo%20maxmotor.png`],
    'iluminacion': [`${R2_BASE_URL}/logo%20maxmotor.png`],
    'rampas': [`${R2_BASE_URL}/rampa_intro.webp`],
    'winchas': [`${R2_BASE_URL}/WINCHA_WARN.png`],
    'grilletes': [`${R2_BASE_URL}/logo%20maxmotor.png`],
    'default': [`${R2_BASE_URL}/logo%20maxmotor.png`]
};

/* ==========================================================================
   5. LISTADO DE MEDIDAS DE LLANTAS
   ========================================================================== */
const llantasData = {
    'suv_chico': {
        'AT': ['235/70 R16', '245/65 R17', '255/65 R17', '265/60 R18'],
        'MT': ['245/70 R16', '255/70 R16', '265/60 R18']
    },
    'camioneta_mediana': {
        'AT': ['265/70 R17', '265/65 R18', '275/65 R18', '275/70 R17'],
        'MT': ['285/70 R17', '285/65 R18', '275/70 R18']
    },
    'pickup_full_size': {
        'AT': ['275/65 R18', '275/70 R18', '275/55 R20', '285/55 R20', '305/55 R20'],
        'MT': ['305/65 R18', '315/70 R17', '295/70 R18']
    }
};

/* ==========================================================================
   6. CONFIGURACIONES VISUALES
   ========================================================================== */
const RAMPAS_POR_COLOR = {
    'Rojo': `${R2_BASE_URL}/rampa_roja.png`,
    'Naranja': `${R2_BASE_URL}/rampa_naranja.jpg`,
    'Verde': `${R2_BASE_URL}/rampa_verde.png`,   // array visual: [verde, verde_CONTEXT]
    'Azul': `${R2_BASE_URL}/rampa_azul.png`
};

const RAMPAS_INTRO = `${R2_BASE_URL}/rampa_intro.webp`;

/* --- ICONOS PERSONALIZADOS (ICONIFY 4x4 THEMED) --- */
const SUBMENU_ICONS = {
    // Overland y Camping
    'Toldo 180': 'mdi:tent',
    'Toldo 270': 'mdi:tent',
    'Rampas': 'mdi:slope-uphill',
    'Winchas': 'mdi:tow-truck',
    'Grilletes': 'mdi:link-variant',
    'Camping': 'mdi:campfire',
    'Mesas': 'mdi:table-picnic',
    'Sillas': 'mdi:seat-outline',
    'Coolers': 'mdi:cooler',

    // Tapas Rígidas
    'Trifold': 'mdi:layers-triple',
    'Enrollable': 'mdi:roller-shade-closed',
    'QuadFold': 'mdi:view-module',
    'Electrica': 'mdi:lightning-bolt',

    // Sistemas de Carga
    'Portabicicletas': 'mdi:bike-fast',
    'Parrillas': 'mdi:grid',
    'Bed Slider': 'mdi:arrow-expand-horizontal',
    'Bed Rack': 'mdi:package-variant',
    'Baules': 'mdi:treasure-chest',
    'Baúles': 'mdi:treasure-chest',
    'Accesorios': 'mdi:tools',
    'Aluminio': 'mdi:silver-medal',
    'Tubo': 'mdi:pipe',
    'Metálica': 'mdi:iron',

    // Suspensión
    'Kit Altura': 'mdi:arrow-up-bold',
    'Suspension Pro': 'mdi:spring',
    'Llantas': 'mdi:tire',
    'Accesorios': 'mdi:wrench',
    'Espaciadores': 'mdi:checkbox-blank-circle-outline',
    'Over Fender': 'mdi:car-side',

    // Rollbar y Tiros
    'Rollbars': 'mdi:truck-outline',
    'Rollbar': 'mdi:truck-outline',
    'Estándar': 'mdi:circle-outline',
    'Reforzada': 'mdi:circle-double',

    // Poliuretano
    'Poliuretano': 'mdi:shield-car',
    'Recubrimiento Poliuretano': 'mdi:shield-car',
    'DOMESTICO': 'mdi:home-roof',
    'COMERCIAL': 'mdi:store',
    'INDUSTRIAL': 'mdi:factory'
};

/* ==========================================================================
   7. LISTADO DE PRECIOS BASE
   ========================================================================== */
const PRECIOS_BASE = {
    // Tapa Rígida
    'tapa_trifold': 398,
    'tapa_trifold_tasman': 495,
    'tapa_enrollable': 650,
    'tapa_enrollable_f150': 700,
    'tapa_quadfold': 495,
    'tapa_electrica': 750,

    // Tapa Lona
    'tapa_lona': 268,

    // Tiro
    'tiro_estandar': 240,
    'tiro_reforzada': 420,

    // Overland
    'toldo_180_premium': 651.24,
    'toldo_180_essential_peque': 230,
    'toldo_180_essential_med': 250,
    'toldo_180_essential_grande': 280,
    'toldo_270_premium': 783.90,
    'toldo_270_essential': 880.38,

    // Accesorios Suspensión
    'espaciadores': 280,

    // Extras
    'extra_seguro_compuerta': 79.99,
    'extra_doble_borde': 50
};

/* ==========================================================================
   8. SISTEMAS DE CARGA
   ========================================================================== */
const datosCarga = {
    portabicicletas: {
        '1 Bicicleta': {
            brands: ['Thule'],
            models: [
                { nombre: 'Thule ProRide', precio: 280, imgs: [`${R2_BASE_URL}/thule_1b_1.jpg`, `${R2_BASE_URL}/thule_1b_2.jpg`] },
                { nombre: 'Thule UpRide', precio: 320, imgs: [`${R2_BASE_URL}/thule_up_1.jpg`, `${R2_BASE_URL}/thule_up_2.jpg`] }
            ]
        },
        '2 Bicicletas': {
            brands: ['Thule', 'Sportrack'],
            models: [
                { nombre: 'Thule T2 Pro', brand: 'Thule', precio: 850, imgs: [`${R2_BASE_URL}/thule_2b_1.jpg`, `${R2_BASE_URL}/thule_2b_2.jpg`] },
                { nombre: 'Sportrack Ridge', brand: 'Sportrack', precio: 450, imgs: [`${R2_BASE_URL}/sport_2b_1.jpg`, `${R2_BASE_URL}/sport_2b_2.jpg`] }
            ]
        },
        '4 Bicicletas': {
            brands: ['Thule', 'Sportrack', 'BAIKTRACKS'],
            models: [
                { nombre: 'Thule Apex XT', brand: 'Thule', precio: 650, imgs: [`${R2_BASE_URL}/thule_4b_1.jpg`, `${R2_BASE_URL}/thule_4b_2.jpg`] },
                { nombre: 'Sportrack Crest', brand: 'Sportrack', precio: 380, imgs: [`${R2_BASE_URL}/sport_4b_1.jpg`, `${R2_BASE_URL}/sport_4b_2.jpg`] },
                { nombre: 'BAIKTRACKS Pro', brand: 'BAIKTRACKS', precio: 320, tag: 'BEST SELLER', imgs: [`${R2_BASE_URL}/baik_4b_1.jpg`, `${R2_BASE_URL}/baik_4b_2.jpg`] }
            ]
        },
        '5 Bicicletas': {
            brands: ['Thule', 'Sportrack'],
            models: [
                { nombre: 'Thule Apex 5', brand: 'Thule', precio: 750, imgs: [`${R2_BASE_URL}/thule_5b_1.jpg`, `${R2_BASE_URL}/thule_5b_2.jpg`] },
                { nombre: 'Sportrack Super 5', brand: 'Sportrack', precio: 420, imgs: [`${R2_BASE_URL}/sport_5b_1.jpg`, `${R2_BASE_URL}/sport_5b_2.jpg`] }
            ]
        }
    },
    parrillas: {
        'Aluminio': {
            'Carga liviana': { colores: ['Negro', 'Plateado'], tallas: ['Small', 'Medium', 'Large'], precio_base: 250, imgs: [`${R2_BASE_URL}/parrilla_alum_liv.jpg`] },
            'Carga pesada': { colores: ['Plateado'], tallas: ['Medium', 'Large'], precio_base: 380, imgs: [`${R2_BASE_URL}/parrilla_alum_pes.jpg`] },
            'Carga Pesada Pro': { colores: ['Negro'], tallas: ['Medium', 'Large'], precio_base: 420, tag: 'RECOMENDADO', imgs: [`${R2_BASE_URL}/parrilla_alum_pro.jpg`] }
        },
        'Acero': {
            'Chapa': { colores: ['Negro'], tallas: ['S', 'M', 'L', 'XL'], tag_xl: 'Vans de trabajo', precio_base: 180, imgs: [`${R2_BASE_URL}/parrilla_acero_chapa.jpg`] },
            'Tuberia': {
                'MXR': { tallas: ['S', 'M', 'L', 'XL'], tag_xl: 'Vans de trabajo', precio_base: 150, imgs: [`${R2_BASE_URL}/parrilla_acero_mxr.jpg`] },
                'Thule': { tallas: ['M', 'L'], precio_base: 450, extra_auto: 'Expansor de parrilla Thule', precio_extra: 120, imgs: [`${R2_BASE_URL}/parrilla_acero_thule.jpg`] }
            }
        }
    },
    bed_slider: {
        'Domestico': { precio: 850, imgs: [`${R2_BASE_URL}/slider_dom_1.jpg`, `${R2_BASE_URL}/slider_dom_2.jpg`] },
        'Heavy Duty': { precio: 1200, imgs: [`${R2_BASE_URL}/slider_hd_1.jpg`, `${R2_BASE_URL}/slider_hd_2.jpg`] }
    },
    bed_rack: {
        intro_imgs: [`${R2_BASE_URL}/bedrack_instalado.jpg`, `${R2_BASE_URL}/bedrack_equipado.jpg`],
        precio_base: 950,
        complementos: [
            { id: 'rampas', nombre: 'Rampas de Tracción', precio: 150, img: `${R2_BASE_URL}/rampa_rack.jpg` },
            { id: 'highlift', nombre: 'Highlift Jack', precio: 120, img: `${R2_BASE_URL}/highlift.jpg` },
            { id: 'mesa', nombre: 'Mesa Plegable', precio: 90, img: `${R2_BASE_URL}/mesa_rack.jpg` },
            { id: 'toldo', nombre: 'Toldo', precio: 0, es_menu: true },
            { id: 'luces_guia', nombre: 'Luces Guía (Kit)', precio: 60, img: `${R2_BASE_URL}/luces_guia.jpg` },
            { id: 'faros_led', nombre: 'Faros LED', precio: 180, img: `${R2_BASE_URL}/faros_rack.jpg` },
            { id: 'parrilla_azar', nombre: 'Parrilla de Asar', precio: 110, img: `${R2_BASE_URL}/bbq_rack.jpg` },
            { id: 'destapador', nombre: 'Destapador', precio: 15, img: `${R2_BASE_URL}/destapador.jpg` },
            { id: 'tanques', nombre: 'Tanques Combustible', precio: 120, img: `${R2_BASE_URL}/tanques_rack.jpg` },
            { id: 'stop', nombre: 'Luz de Stop', precio: 45, img: `${R2_BASE_URL}/stop_rack.jpg` }
        ]
    },
    baules: [
        { cap: '320 Litros', precio: 400, imgs: [`${R2_BASE_URL}/baul_320_1.jpg`, `${R2_BASE_URL}/baul_320_2.jpg`] },
        { cap: '360 Litros', precio: 450, imgs: [`${R2_BASE_URL}/baul_360_1.jpg`, `${R2_BASE_URL}/baul_360_2.jpg`] },
        { cap: '400 Litros', precio: 500, imgs: [`${R2_BASE_URL}/baul_400_1.jpg`, `${R2_BASE_URL}/baul_400_2.jpg`] },
        { cap: '450 Litros', precio: 580, imgs: [`${R2_BASE_URL}/baul_450_1.jpg`, `${R2_BASE_URL}/baul_450_2.jpg`] },
        { cap: '500 Litros', precio: 650, imgs: [`${R2_BASE_URL}/baul_500_1.jpg`, `${R2_BASE_URL}/baul_500_2.jpg`] },
        { cap: '600 Litros', precio: 750, imgs: [`${R2_BASE_URL}/baul_600_1.jpg`, `${R2_BASE_URL}/baul_600_2.jpg`] },
        { cap: 'X-Stream', precio: 850, imgs: [`${R2_BASE_URL}/baul_xs_1.jpg`, `${R2_BASE_URL}/baul_xs_2.jpg`] },
        { cap: 'Alpine', precio: 900, imgs: [`${R2_BASE_URL}/baul_alp_1.jpg`, `${R2_BASE_URL}/baul_alp_2.jpg`] }
    ],
    accesorios_carga: [
        { nombre: 'Tiedowns (Par)', precio: 35, img: `${R2_BASE_URL}/tiedown.jpg` },
        { nombre: 'Grilletes (Par)', precio: 45, img: `${R2_BASE_URL}/grillete_acc.jpg` },
        { nombre: 'Bolas de Remolque', precio: 25, img: `${R2_BASE_URL}/bola.jpg` },
        { nombre: 'Pines con Llave', precio: 30, img: `${R2_BASE_URL}/pin_llave.jpg` },
        { nombre: 'Pines Simples', precio: 10, img: `${R2_BASE_URL}/pin_simple.jpg` },
        { nombre: 'Lenguas de Tiro', precio: 50, img: `${R2_BASE_URL}/lengua.jpg` },
        { nombre: 'Canastas de Tiro', precio: 220, img: `${R2_BASE_URL}/canasta.jpg` },
        { nombre: 'Ganchos de Remolque', precio: 40, img: `${R2_BASE_URL}/gancho.jpg` },
        { nombre: 'Base Highlift', precio: 45, img: `${R2_BASE_URL}/base_highlift.jpg` },
        { nombre: 'Soporte Tanques', precio: 55, img: `${R2_BASE_URL}/soporte_tanque.jpg` }
    ]
};

/* ==========================================================================
   NUEVO: CATÁLOGO WEB DINÁMICO (SHOWROOM)
   ========================================================================== */
const catalogoWeb = [
    {
        id: "suspension",
        titulo: "SUSPENSIÓN Y PERFORMANCE",
        marcas: [
            { nombre: "OLD MAN EMU (OME)", valor: "OME" },
            { nombre: "TOUGH DOG", valor: "Tough Dog" },
            { nombre: "BILSTEIN", valor: "Bilstein" },
            { nombre: "RS / Otras", valor: "RS" }
        ]
    },
    {
        id: "barras",
        titulo: "BARRAS DE TIRO",
        marcas: [
            { nombre: "MXR (Nacionales e Importadas)", valor: "MXR" },
            { nombre: "KEKO", valor: "Keko" }
        ]
    },
    {
        id: "rollbars",
        titulo: "ROLL BARS",
        marcas: [
            { nombre: "MXR (Heavy Duty / Sport)", valor: "MXR" },
            { nombre: "KEKO", valor: "Keko" }
        ]
    },
    {
        id: "estribos",
        titulo: "ESTRIBOS LATERALES",
        marcas: [
            { nombre: "MXR", valor: "MXR" },
            { nombre: "KEKO", valor: "Keko" }
        ]
    },
    {
        id: "iluminacion",
        titulo: "ILUMINACIÓN AVANZADA",
        marcas: [
            { nombre: "LIGHTFORCE<br><span style='font-size:0.6rem; color:#aaa;'>REPRESENTANTES OFICIALES ECUADOR</span>", valor: "Lightforce", highlight: true },
            { nombre: "HELLA", valor: "Hella" },
            { nombre: "BARRAS Y FAROS LED (Alternativos)", valor: "LED Alternativa" }
        ]
    },
    {
        id: "interior",
        titulo: "INTERIOR Y CONFORT",
        marcas: [
            { nombre: "MOQUETAS 5D Y TERMOFORMADAS", valor: "Moquetas 5D" },
            { nombre: "ACCESORIOS SPARCO Y LIMPIEZA", valor: "Sparco / Simoniz" },
            { nombre: "RADIOS ANDROID Y AUDIO", valor: "Radios Android" }
        ]
    }
];