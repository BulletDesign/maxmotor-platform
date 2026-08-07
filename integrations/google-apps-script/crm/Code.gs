function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Maxmotor CRM')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function getBootstrap() {
  const actor = assertAuthorized_();
  return {
    actor,
    catalogs: getCatalogMap_(),
    today: Utilities.formatDate(new Date(), CRM.timezone, 'yyyy-MM-dd'),
  };
}

function findClientByPhone(phone) {
  assertAuthorized_();
  const normalized = normalizePhone_(phone);
  if (!normalized) return null;
  const sheet = openCrmSpreadsheet_().getSheetByName(CRM.sheets.clients);
  const rows = dataRows_(sheet);
  const row = rows.find(item => String(item[4]) === normalized);
  if (!row) return null;
  return {
    id: row[0],
    name: row[3],
    phone: row[4],
    province: row[5],
    whatsappConsent: row[6] === true,
  };
}

function saveOpportunity(payload) {
  const actor = assertAuthorized_();
  const data = sanitizeOpportunity_(payload);
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const ss = openCrmSpreadsheet_();
    const clients = ss.getSheetByName(CRM.sheets.clients);
    const opportunities = ss.getSheetByName(CRM.sheets.opportunities);
    const now = new Date();
    let clientRow = findRowByValue_(clients, 5, data.phone);
    let clientId;

    if (clientRow) {
      clientId = String(clients.getRange(clientRow, 1).getValue());
      const previousConsent = clients.getRange(clientRow, 7).getValue() === true;
      clients.getRange(clientRow, 3, 1, 4).setValues([[now, data.name, data.phone, data.province]]);
      if (data.whatsappConsent && !previousConsent) {
        clients.getRange(clientRow, 7, 1, 3).setValues([[true, now, 'Formulario CRM / asesor']]);
      }
    } else {
      clientId = nextFriendlyId_('CLI');
      clients.appendRow([
        clientId, now, now, data.name, data.phone, data.province,
        data.whatsappConsent, data.whatsappConsent ? now : '',
        data.whatsappConsent ? 'Formulario CRM / asesor' : '',
      ]);
    }

    const opportunityId = nextFriendlyId_('OP');
    opportunities.appendRow([
      opportunityId, now, now, clientId, actor.email, data.brand, data.model,
      data.year || '', data.family, data.product, data.source, data.status,
      data.proforma, nextFollowupDate_(data.status, now), data.lostReason, data.notes,
    ]);
    appendActivity_(opportunityId, actor.email, 'CREACION', '', data.status, data.notes);
    notifyNewOpportunity_(data, opportunityId, actor.email);
    return {
      ok: true,
      clientId,
      opportunityId,
      whatsAppUrl: `https://wa.me/${data.phone}?text=${encodeURIComponent(`Hola ${data.name}, gracias por contactarte con Maxmotor 4x4. Registramos tu interes en ${data.product}.`)}`,
    };
  } finally {
    lock.releaseLock();
  }
}

function searchOpportunities(query) {
  assertAuthorized_();
  const needle = normalizeSearch_(query);
  if (needle.length < 2) return [];
  const ss = openCrmSpreadsheet_();
  const clients = dataRows_(ss.getSheetByName(CRM.sheets.clients));
  const clientMap = Object.fromEntries(clients.map(row => [String(row[0]), row]));
  return dataRows_(ss.getSheetByName(CRM.sheets.opportunities))
    .map((row, index) => ({ row, index: index + 2, client: clientMap[String(row[3])] || [] }))
    .filter(item => normalizeSearch_([
      item.row[0], item.row[12], item.client[3], item.client[4], item.row[5], item.row[6], item.row[9],
    ].join(' ')).includes(needle))
    .slice(-30)
    .reverse()
    .map(item => ({
      id: item.row[0],
      createdAt: formatDate_(item.row[1]),
      clientId: item.row[3],
      clientName: item.client[3] || '',
      phone: item.client[4] || '',
      vehicle: `${item.row[5]} ${item.row[6]}`.trim(),
      product: item.row[9],
      status: item.row[11],
      proforma: item.row[12] || '',
      nextFollowup: formatDate_(item.row[13]),
    }));
}

function updateOpportunity(payload) {
  const actor = assertAuthorized_();
  const id = cleanText_(payload && payload.id, 40);
  const status = catalogValue_('ESTADO', payload && payload.status);
  const note = cleanText_(payload && payload.note, 500);
  const proforma = cleanText_(payload && payload.proforma, 80);
  const lostReason = cleanText_(payload && payload.lostReason, 180);
  if (!id) throw new Error('Selecciona una oportunidad.');
  if (['Cotizado', 'Vendido'].includes(status) && !proforma) throw new Error('La proforma es obligatoria para cotizados y vendidos.');
  if (status === 'Perdido' && !lostReason) throw new Error('Indica por que se perdio el contacto.');

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = openCrmSpreadsheet_().getSheetByName(CRM.sheets.opportunities);
    const row = findRowByValue_(sheet, 1, id);
    if (!row) throw new Error('Oportunidad no encontrada.');
    const previousStatus = String(sheet.getRange(row, 12).getValue());
    const previousNotes = String(sheet.getRange(row, 16).getValue() || '');
    const nextNotes = note ? `${previousNotes}${previousNotes ? '\n' : ''}${formatDateTime_(new Date())} - ${note}` : previousNotes;
    sheet.getRange(row, 3).setValue(new Date());
    sheet.getRange(row, 12, 1, 5).setValues([[
      status, proforma, nextFollowupDate_(status, new Date()), lostReason, nextNotes,
    ]]);
    appendActivity_(id, actor.email, 'CAMBIO_ESTADO', previousStatus, status, note);
    return { ok: true, id, status };
  } finally {
    lock.releaseLock();
  }
}

function sanitizeOpportunity_(payload) {
  const data = payload || {};
  const result = {
    name: titleCase_(cleanText_(data.name, 120)),
    phone: normalizePhone_(data.phone),
    province: catalogValue_('PROVINCIA', data.province),
    brand: catalogValue_('MARCA', data.brand),
    model: titleCase_(cleanText_(data.model, 80)),
    year: cleanText_(data.year, 4),
    family: catalogValue_('FAMILIA', data.family),
    product: titleCase_(cleanText_(data.product, 160)),
    source: catalogValue_('CANAL', data.source),
    status: catalogValue_('ESTADO', data.status),
    proforma: cleanText_(data.proforma, 80).toUpperCase(),
    lostReason: cleanText_(data.lostReason, 180),
    notes: cleanText_(data.notes, 500),
    whatsappConsent: data.whatsappConsent === true,
  };
  if (result.name.length < 3) throw new Error('Ingresa el nombre del cliente.');
  if (!result.phone) throw new Error('Ingresa un telefono ecuatoriano valido.');
  if (!result.model) throw new Error('Ingresa el modelo del vehiculo.');
  if (!result.product) throw new Error('Ingresa el producto de interes.');
  if (result.year && !/^(19|20)\d{2}$/.test(result.year)) throw new Error('El ano del vehiculo no es valido.');
  if (['Cotizado', 'Vendido'].includes(result.status) && !result.proforma) throw new Error('La proforma es obligatoria para cotizados y vendidos.');
  if (result.status === 'Perdido' && !result.lostReason) throw new Error('Indica por que se perdio el contacto.');
  return result;
}

function assertAuthorized_() {
  const email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  if (!email) throw new Error('Debes ingresar con una cuenta de Google autorizada.');
  const sheet = openCrmSpreadsheet_().getSheetByName(CRM.sheets.team);
  const row = dataRows_(sheet).find(item => String(item[0]).trim().toLowerCase() === email && item[2] !== false);
  if (!row) throw new Error('Tu correo no esta autorizado en la hoja Equipo.');
  return { email, name: String(row[1] || email) };
}

function appendActivity_(opportunityId, advisor, type, previousStatus, newStatus, note) {
  openCrmSpreadsheet_().getSheetByName(CRM.sheets.activities).appendRow([
    nextFriendlyId_('ACT'), new Date(), opportunityId, advisor, type,
    previousStatus, newStatus, note || '',
  ]);
}

function nextFriendlyId_(prefix) {
  const properties = PropertiesService.getScriptProperties();
  const day = Utilities.formatDate(new Date(), CRM.timezone, 'yyMMdd');
  const key = `SEQ_${prefix}_${day}`;
  const sequence = Number(properties.getProperty(key) || 0) + 1;
  properties.setProperty(key, String(sequence));
  return `${prefix}-${day}-${String(sequence).padStart(3, '0')}`;
}

function nextFollowupDate_(status, fromDate) {
  const days = status === 'Cotizado' ? 1 : status === 'Contactado' ? 2 : 0;
  if (!days || ['Vendido', 'Perdido'].includes(status)) return '';
  const date = new Date(fromDate);
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return date;
}

function catalogValue_(type, value) {
  const clean = cleanText_(value, 160);
  const options = getCatalogMap_()[type] || [];
  const match = options.find(option => normalizeSearch_(option) === normalizeSearch_(clean));
  if (!match) throw new Error(`Selecciona un valor valido para ${type.toLowerCase()}.`);
  return match;
}

function normalizePhone_(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `593${digits.slice(1)}`;
  if (!digits.startsWith('593') && digits.length === 9) digits = `593${digits}`;
  return /^5939\d{8}$/.test(digits) ? digits : '';
}

function titleCase_(value) {
  return String(value || '').toLocaleLowerCase('es-EC').replace(/(^|[\s-])([a-záéíóúñ])/g, (match, space, letter) => `${space}${letter.toLocaleUpperCase('es-EC')}`);
}

function cleanText_(value, maxLength) {
  return String(value == null ? '' : value).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeSearch_(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function dataRows_(sheet) {
  return sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues() : [];
}

function findRowByValue_(sheet, column, value) {
  if (sheet.getLastRow() < 2) return 0;
  const match = sheet.getRange(2, column, sheet.getLastRow() - 1, 1).createTextFinder(String(value)).matchEntireCell(true).findNext();
  return match ? match.getRow() : 0;
}

function formatDate_(value) {
  return value instanceof Date ? Utilities.formatDate(value, CRM.timezone, 'dd/MM/yyyy') : String(value || '');
}

function formatDateTime_(value) {
  return Utilities.formatDate(value, CRM.timezone, 'dd/MM/yyyy HH:mm');
}
