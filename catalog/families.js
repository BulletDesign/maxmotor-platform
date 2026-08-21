(function () {
  const cdn = "https://pub-0ffd5554f540471f9047257c4ab3923d.r2.dev/repoimg/";
  window.MAXMOTOR_FAMILIES = [
    {
      id: "tapa-rigida", name: "Tapas rigidas", code: "TR", icon: "fa-box", description: "Seguridad, apertura y proteccion para el balde.",
      products: [
        { slug: "tapa-trifold", name: "Tapa Trifold", image: cdn + "foto_tapa_trifold.jpeg", summary: "Apertura en tres paneles para uso diario y acceso rapido al balde.", features: ["Apertura plegable", "Perfil aerodinamico", "Compatibilidad por modelo"] },
        { slug: "tapa-quadfold", name: "Tapa de Balde Plegable 4 Partes", image: cdn + "tapa_quad_1.jpg", summary: "Cuatro paneles para ampliar el acceso util al balde sin desmontar la cubierta.", features: ["Cuatro paneles", "Apertura modular", "Aplicacion por camioneta"] },
        { slug: "tapa-electrica", name: "Tapa de Balde Corrediza Electrica", image: cdn + "banner3.png", summary: "Apertura remota y estructura de aluminio para operar el balde con precision.", features: ["Control remoto", "Aluminio reforzado", "Cierre de seguridad"] },
        { slug: "tapa-enrollable", name: "Tapa de Balde Corrediza", image: cdn + "banner2.png", summary: "Apertura gradual y cubierta compacta para conservar acceso flexible al balde.", features: ["Apertura regulable", "Diseno compacto", "Uso multiproposito"] },
      ],
    },
    {
      id: "tapa-lona", name: "Tapas de lona", code: "TL", icon: "fa-layer-group", description: "Cobertura ligera, practica y de instalacion eficiente.",
      products: [
        { slug: "tapa-lona", name: "Tapa de Lona", image: cdn + "lona_1.jpg", summary: "Solucion funcional para cubrir la carga sin agregar peso innecesario.", features: ["Bajo peso", "Apertura manual", "Aplicacion por vehiculo"] },
      ],
    },
    {
      id: "overland", name: "Overland", code: "OV", icon: "fa-mountain-sun", description: "Sombra, rescate y campamento para salir del mapa.",
      products: [
        { slug: "toldo-180", name: "Toldo 180", image: cdn + "banner_awning.jpeg", summary: "Cobertura lateral de despliegue rapido para campamento y trabajo.", features: ["Apertura 180 grados", "Montaje lateral", "Versiones Essential y Premium"] },
        { slug: "toldo-270", name: "Toldo 270", image: cdn + "toldo_180_essential.jpg", summary: "Zona de sombra ampliada alrededor del vehiculo.", features: ["Cobertura envolvente", "Estructura reforzada", "Configuracion por tamano"] },
        { slug: "winchas", name: "Winchas de Rescate", image: "https://images.pexels.com/photos/18278713/pexels-photo-18278713.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Capacidad de recuperacion para rutas exigentes.", features: ["8.000 a 10.000 lb", "Aplicacion universal", "Asesoria de montaje"], photoCredit: "Foto contextual: Semih Kukcu / Pexels" },
        { slug: "grilletes-rescate", name: "Grilletes de Rescate", image: "https://images.pexels.com/photos/11143670/pexels-photo-11143670.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Puntos de union robustos para maniobras de recuperacion y remolque.", features: ["Varios acabados", "Uso de rescate", "Seleccion por capacidad"], photoCredit: "Foto contextual: Gaspar Zaldo / Pexels" },
        { slug: "equipo-camping", name: "Equipo de Camping", image: "https://images.pexels.com/photos/7326681/pexels-photo-7326681.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Mesas, sillas y coolers para completar una configuracion overland.", features: ["Equipamiento plegable", "Opciones por uso", "Facil transporte"], photoCredit: "Foto contextual: Ryan Leeper / Pexels" },
        { slug: "rampas-traccion", name: "Rampas de Traccion", image: cdn + "rampa_roja.png", summary: "Apoyo de recuperacion para arena, lodo y terreno de baja adherencia.", features: ["Dos tamanos", "Colores disponibles", "Uso off-road"] },
      ],
    },
    {
      id: "suspension", name: "Suspensiones", code: "SU", icon: "fa-arrows-up-down", description: "Altura, control y respuesta segun el uso del vehiculo.",
      products: [
        { slug: "old-man-emu", name: "Old Man Emu", image: cdn + "suspension_1.png", summary: "Suspension especializada para carga, control y desempeño off-road.", features: ["Aplicacion por vehiculo", "Configuracion por carga", "Instalacion tecnica"] },
        { slug: "tough-dog", name: "Suspension Tough Dog", image: "https://www.toughdog.com.au/site/DefaultSite/skins/toughdog_2019/images/products-intro-shock-absorbers.jpg", summary: "Suspension australiana distribuida por Maxmotor para Ecuador, configurada segun carga, altura y terreno.", features: ["Distribucion para Ecuador", "Uso severo y flotas", "Compatibilidad validada"], landing: "/tough-dog", photoCredit: "Material oficial Tough Dog, utilizado con autorizacion comercial" },
        { slug: "bilstein", name: "Bilstein", image: cdn + "suspension_3.png", summary: "Respuesta precisa y control premium para carretera y aventura.", features: ["Tecnologia monotubo", "Control de rebote", "Aplicacion por modelo"] },
        { slug: "tjm-suspension", name: "TJM Suspension", image: cdn + "KITALTURA.png", summary: "Kits de suspension para elevar capacidad y estabilidad del 4x4.", features: ["Kit completo", "Uso mixto", "Montaje profesional"] },
        { slug: "llantas-off-road", name: "Llantas Off-Road", image: "https://images.pexels.com/photos/16033911/pexels-photo-16033911.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Opciones AT y MT para carretera, tierra y terreno tecnico.", features: ["Patrones AT y MT", "Medidas por vehiculo", "Asesoria de aplicacion"], photoCredit: "Foto contextual: Chaiya Saleethong / Pexels" },
        { slug: "accesorios-suspension", name: "Accesorios de Suspension", image: "https://images.pexels.com/photos/29675387/pexels-photo-29675387.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Espaciadores y componentes complementarios para la puesta a punto.", features: ["Opciones por vehiculo", "Ajuste tecnico", "Instalacion especializada"], photoCredit: "Foto contextual: Furqat Tuxtanov / Pexels" },
      ],
    },
    {
      id: "tiro", name: "Barras de tiro", code: "BT", icon: "fa-link", description: "Soluciones de carga y remolque fabricadas para cada aplicacion.",
      products: [
        { slug: "tiro-estandar", name: "Barra de Tiro", image: "https://images.pexels.com/photos/12519369/pexels-photo-12519369.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Receptor fabricado para remolque, portabicicletas y sistemas de carga posteriores.", features: ["Receptor de 2 pulgadas", "Fabricacion MXR", "Aplicacion por vehiculo"], staticPage: "fichas/tiro-estandar.html", photoCredit: "Foto contextual: Mathias Reding / Pexels" },
        { slug: "tiro-hd", name: "Barra de Tiro Heavy Duty", image: "https://images.pexels.com/photos/33566025/pexels-photo-33566025.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Estructura reforzada para aplicaciones de mayor exigencia.", features: ["Construccion reforzada", "Aplicacion de alta carga", "Fabricacion a medida"], staticPage: "fichas/tiro-hd.html", photoCredit: "Foto contextual: Mohamed Aouni / Pexels" },
        { slug: "barra-tiro-keko", name: "Barra de Tiro KEKO", image: "https://images.pexels.com/photos/4388158/pexels-photo-4388158.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Solucion KEKO para remolque y transporte de accesorios posteriores.", features: ["Marca KEKO", "Aplicacion por modelo", "Montaje profesional"], photoCredit: "Foto contextual: Spencer Davis / Pexels" },
      ],
    },
    {
      id: "carga", name: "Sistemas de carga", code: "SC", icon: "fa-boxes-stacked", description: "Racks, sliders y baules para ordenar el equipo.",
      products: [
        { slug: "bed-slider", name: "Bed Slider", image: "https://images.pexels.com/photos/35331201/pexels-photo-35331201.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Plataforma deslizable para acceder a la carga desde la compuerta.", features: ["Acceso extendido", "Opciones de capacidad", "Fabricacion segun balde"], photoCredit: "Foto contextual: Iridescentlenz / Pexels" },
        { slug: "portabicicletas", name: "Portabicicletas", image: "https://images.pexels.com/photos/13033347/pexels-photo-13033347.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Transporte seguro para bicicletas con capacidades y marcas seleccionables.", features: ["Varias capacidades", "Opciones de marca", "Montaje posterior o techo"], photoCredit: "Foto contextual: Vyacheslav Bobin / Pexels" },
        { slug: "parrillas-carga", name: "Parrillas de Carga", image: "https://images.pexels.com/photos/17110477/pexels-photo-17110477.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Parrillas de aluminio o acero configuradas por carga y vehiculo.", features: ["Aluminio o acero", "Tamanos disponibles", "Carga liviana o pesada"], photoCredit: "Foto contextual: FBO Media / Pexels" },
        { slug: "baul-techo", name: "Baul de Techo", image: "https://images.pexels.com/photos/29807874/pexels-photo-29807874.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Volumen adicional protegido para viajes y uso familiar.", features: ["Multiples capacidades", "Montaje sobre barras", "Cierre de seguridad"], photoCredit: "Foto contextual: Luke Miller / Pexels" },
        { slug: "bed-rack", name: "Bed Rack", image: "https://images.pexels.com/photos/28639111/pexels-photo-28639111.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Estructura modular sobre el balde para organizar equipo overland.", features: ["Complementos modulares", "Fabricacion robusta", "Configuracion por uso"], photoCredit: "Foto contextual: Stephen Leonardi / Pexels" },
        { slug: "accesorios-carga", name: "Accesorios de Carga", image: "https://images.pexels.com/photos/34475068/pexels-photo-34475068.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Anclajes, soportes, pines y complementos para asegurar la carga.", features: ["Compra individual", "Multiples aplicaciones", "Asesoria tecnica"], photoCredit: "Foto contextual: Holyson H / Pexels" },
      ],
    },
    {
      id: "rollbar", name: "Rollbars", code: "RB", icon: "fa-truck-pickup", description: "Linea MXR fabricada a medida para presencia y funcionalidad.",
      products: [
        { slug: "rollbar-zr", name: "Rollbar ZR", image: "https://images.pexels.com/photos/13644357/pexels-photo-13644357.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Rollbar de linea angular fabricado para integrar presencia, carga e iluminacion.", features: ["Diseno angular ZR", "Fabricacion nacional", "Aplicacion por camioneta"], photoCredit: "Foto contextual: Scott Neil / Pexels" },
        { slug: "rollbar-hero", name: "Rollbar Hero", image: "https://images.pexels.com/photos/9331954/pexels-photo-9331954.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Estructura tubular premium con base portafocos.", features: ["Acero de alta resistencia", "Acabados MXR", "Aplicacion por camioneta"], staticPage: "fichas/rollbar-hero.html", photoCredit: "Foto contextual: Rhys Abel / Pexels" },
        { slug: "rollbar-rr1", name: "Rollbar RR1", image: "https://images.pexels.com/photos/13644357/pexels-photo-13644357.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Doble viga angular con configuracion overland.", features: ["Parrilla superior", "Perfil bajo", "Fabricacion nacional"], staticPage: "fichas/rollbar-rr1.html", photoCredit: "Foto contextual: Scott Neil / Pexels" },
        { slug: "rollbar-hummer", name: "Rollbar Hummer", image: "https://images.pexels.com/photos/28639327/pexels-photo-28639327.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Formato tipo jaula con presencia extrema.", features: ["Tubos reforzados", "Acabado texturizado", "Fabricacion a medida"], staticPage: "fichas/rollbar-hummer.html", photoCredit: "Foto contextual: Stephen Leonardi / Pexels" },
        { slug: "rollbar-keko", name: "Rollbar KEKO", image: "https://images.pexels.com/photos/30777265/pexels-photo-30777265.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Rollbar de marca KEKO con aplicacion especifica por camioneta.", features: ["Marca KEKO", "Aplicacion por modelo", "Instalacion profesional"], photoCredit: "Foto contextual: Grant Allen / Pexels" },
      ],
    },
    {
      id: "estribos", name: "Estribos", code: "ES", icon: "fa-grip-lines", description: "Acceso y proteccion lateral para trabajo y aventura.",
      products: [
        { slug: "estribos-rock", name: "Rock Sliders MXR", image: "https://images.pexels.com/photos/12138568/pexels-photo-12138568.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Proteccion lateral estructural para rutas tecnicas.", features: ["Estructura tubular", "Proteccion de zocalos", "Fabricacion por vehiculo"], staticPage: "fichas/estribos-rock.html", photoCredit: "Foto contextual: Ryan Leeper / Pexels" },
        { slug: "estribos-keko", name: "Estribos KEKO", image: "https://images.pexels.com/photos/28610572/pexels-photo-28610572.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Acceso lateral KEKO con aplicacion dedicada para camionetas.", features: ["Marca KEKO", "Acceso seguro", "Compatibilidad por modelo"], photoCredit: "Foto contextual: Stephen Leonardi / Pexels" },
      ],
    },
    {
      id: "interior", name: "Interior", code: "IN", icon: "fa-car-side", description: "Confort, proteccion y conectividad dentro del vehiculo.",
      products: [
        { slug: "moquetas-5d", name: "Moquetas 5D", image: "https://images.pexels.com/photos/8914493/pexels-photo-8914493.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Cobertura moldeada para proteger y elevar el acabado interior.", features: ["Ajuste por modelo", "Facil limpieza", "Cobertura extendida"], photoCredit: "Foto contextual: Ishan Kulshrestha / Pexels" },
        { slug: "sparco-limpieza", name: "Sparco y Limpieza", image: "https://images.pexels.com/photos/11845080/pexels-photo-11845080.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Accesorios Sparco y soluciones de cuidado para el interior del vehiculo.", features: ["Linea Sparco", "Cuidado interior", "Aplicacion universal"], photoCredit: "Foto contextual: Auto Photographer / Pexels" },
        { slug: "radios-android", name: "Radios Android", image: "https://images.pexels.com/photos/17710775/pexels-photo-17710775.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Conectividad, navegacion y entretenimiento integrados.", features: ["Pantalla tactil", "Conectividad movil", "Instalacion profesional"], photoCredit: "Foto contextual: Vitali Adutskevich / Pexels" },
      ],
    },
    {
      id: "iluminacion", name: "Iluminacion", code: "LU", icon: "fa-lightbulb", description: "Visibilidad de ruta, faena y campamento.",
      products: [
        { slug: "lightforce", name: "Lightforce", image: "https://images.pexels.com/photos/19097692/pexels-photo-19097692.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Iluminacion auxiliar premium para ruta y condiciones off-road.", features: ["Representacion oficial", "Alto alcance", "Instalacion electrica"], photoCredit: "Foto contextual: Orhan Pergel / Pexels" },
        { slug: "hella", name: "Hella", image: "https://images.pexels.com/photos/31968459/pexels-photo-31968459.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Faros auxiliares Hella para mejorar visibilidad y seguridad.", features: ["Marca Hella", "Aplicacion automotriz", "Montaje profesional"], photoCredit: "Foto contextual: Borta / Pexels" },
        { slug: "luces-led", name: "Barras LED", image: "https://images.pexels.com/photos/7127593/pexels-photo-7127593.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Barras, neblineros y luces auxiliares para cada aplicacion.", features: ["Formatos auxiliares", "Aplicacion universal", "Instalacion electrica"], photoCredit: "Foto contextual: Jing Ao Tang / Pexels" },
      ],
    },
    {
      id: "bullbars", name: "Bullbars y guardachoques", code: "BG", icon: "fa-shield-halved", description: "Proteccion frontal, angulo de ataque e integracion para rescate.",
      products: [
        { slug: "bullbar-overland", name: "Bullbar Overland", image: "https://images.pexels.com/photos/5628354/pexels-photo-5628354.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Guardachoques frontal de acero con preparacion para wincha y recuperacion.", features: ["Proteccion frontal", "Base para wincha", "Anclaje segun vehiculo"], staticPage: "fichas/bullbar-overland.html", photoCredit: "Foto contextual: Erik Mclean / Pexels" },
        { slug: "bullbar-raptor", name: "Bullbar Raptor", image: "https://images.pexels.com/photos/30139881/pexels-photo-30139881.jpeg?auto=compress&cs=tinysrgb&w=1600", summary: "Bullbar de perfil agresivo para proyectos off-road y mayor angulo de ataque.", features: ["Perfil off-road", "Integracion de iluminacion", "Aplicacion por vehiculo"], staticPage: "fichas/bullbar-raptor.html", photoCredit: "Foto contextual: Stephen Leonardi / Pexels" },
      ],
    },
  ];
})();
