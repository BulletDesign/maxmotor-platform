const CRM = Object.freeze({
  timezone: 'America/Guayaquil',
  sheets: Object.freeze({
    clients: 'Clientes',
    opportunities: 'Oportunidades',
    activities: 'Actividades',
    catalogs: 'Catalogos',
    team: 'Equipo',
    settings: 'Configuracion',
    dashboard: 'Dashboard',
  }),
  headers: Object.freeze({
    clients: [
      'ID_CLIENTE', 'FECHA_ALTA', 'ULTIMA_ACTUALIZACION', 'NOMBRE',
      'TELEFONO_E164', 'PROVINCIA', 'CONSENTIMIENTO_WHATSAPP',
      'FECHA_CONSENTIMIENTO', 'ORIGEN_CONSENTIMIENTO',
    ],
    opportunities: [
      'ID_OPORTUNIDAD', 'FECHA_CREACION', 'ULTIMA_ACTUALIZACION', 'ID_CLIENTE',
      'ASESOR', 'MARCA', 'MODELO', 'ANIO', 'FAMILIA', 'PRODUCTO',
      'CANAL_ORIGEN', 'ESTADO', 'PROFORMA', 'PROXIMO_SEGUIMIENTO',
      'MOTIVO_PERDIDA', 'NOTAS',
    ],
    activities: [
      'ID_ACTIVIDAD', 'FECHA', 'ID_OPORTUNIDAD', 'ASESOR', 'TIPO',
      'ESTADO_ANTERIOR', 'ESTADO_NUEVO', 'NOTA',
    ],
    catalogs: ['TIPO', 'VALOR', 'ACTIVO', 'ORDEN'],
    team: ['EMAIL', 'NOMBRE', 'ACTIVO', 'RECIBE_NOTIFICACIONES'],
    settings: ['CLAVE', 'VALOR', 'DESCRIPCION'],
  }),
});

const ECUADOR_PROVINCES = [
  'Azuay', 'Bolivar', 'Canar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro',
  'Esmeraldas', 'Galapagos', 'Guayas', 'Imbabura', 'Loja', 'Los Rios',
  'Manabi', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha',
  'Santa Elena', 'Santo Domingo de los Tsachilas', 'Sucumbios', 'Tungurahua',
  'Zamora Chinchipe',
];

const VEHICLE_BRANDS = [
  'Baic', 'BMW', 'BYD', 'Changan', 'Chery', 'Chevrolet', 'Citroen', 'DFSK',
  'Dongfeng', 'Fiat', 'Ford', 'Foton', 'Geely', 'Great Wall', 'Haval', 'Honda',
  'Hyundai', 'Isuzu', 'JAC', 'Jeep', 'JMC', 'Kia', 'Land Rover', 'Lexus',
  'Mazda', 'Mercedes-Benz', 'MG', 'Mitsubishi', 'Nissan', 'Peugeot', 'RAM',
  'Renault', 'Shineray', 'Sinotruk', 'Subaru', 'Suzuki', 'Toyota', 'Volkswagen',
  'Volvo', 'Zotye',
];

const CRM_CATALOGS = Object.freeze({
  PROVINCIA: ECUADOR_PROVINCES,
  MARCA: VEHICLE_BRANDS,
  CANAL: [
    'Facebook', 'Instagram', 'TikTok', 'Google', 'WhatsApp', 'Referido',
    'Cliente recurrente', 'Paso por el local', 'Feria o evento', 'Otro',
  ],
  ESTADO: ['Contactado', 'Cotizado', 'Vendido', 'Perdido'],
  FAMILIA: [
    'Tapas rigidas', 'Tapas de lona', 'Suspensiones', 'Barras de tiro',
    'Sistemas de carga', 'Rollbars', 'Estribos', 'Interior', 'Iluminacion',
    'Bullbars y guardachoques', 'Recubrimiento de poliuretano', 'Varios',
  ],
});
