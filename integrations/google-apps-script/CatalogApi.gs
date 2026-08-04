const SHEET_NAME = 'productos';

function doGet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) return jsonResponse({ error: 'No existe la hoja productos' });
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return jsonResponse({ products: [] });

  const headers = values.shift().map(normalizeHeader);
  const products = values
    .filter(row => row.some(Boolean))
    .map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] || ''])))
    .filter(product => String(product.activo).toUpperCase() !== 'FALSE')
    .map(product => ({
      ...product,
      precio: product.precio ? Number(String(product.precio).replace(',', '.')) : null,
      activo: true,
    }));

  return jsonResponse({ updatedAt: new Date().toISOString(), products });
}

function normalizeHeader(value) {
  return String(value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_');
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
