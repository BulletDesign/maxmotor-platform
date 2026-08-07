function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Maxmotor CRM')
    .addItem('Abrir ingreso rapido', 'showCrmSidebar')
    .addItem('Actualizar dashboard', 'refreshDashboard')
    .addSeparator()
    .addItem('Instalar estructura', 'setupCrm')
    .addItem('Instalar recordatorios', 'installCrmTriggers')
    .addToUi();
}

function showCrmSidebar() {
  const output = HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('Maxmotor CRM');
  SpreadsheetApp.getUi().showSidebar(output);
}

function setupCrm() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(CRM.timezone);
  ss.setSpreadsheetLocale('es_EC');
  PropertiesService.getScriptProperties().setProperty('CRM_SPREADSHEET_ID', ss.getId());

  ensureTableSheet_(ss, CRM.sheets.clients, CRM.headers.clients, [120, 150, 150, 220, 150, 150, 170, 170, 190]);
  ensureTableSheet_(ss, CRM.sheets.opportunities, CRM.headers.opportunities, [150, 150, 150, 130, 220, 140, 160, 80, 180, 240, 150, 120, 130, 170, 180, 260]);
  ensureTableSheet_(ss, CRM.sheets.activities, CRM.headers.activities, [150, 150, 150, 220, 140, 140, 140, 280]);
  ensureTableSheet_(ss, CRM.sheets.catalogs, CRM.headers.catalogs, [160, 240, 100, 80]);
  ensureTableSheet_(ss, CRM.sheets.team, CRM.headers.team, [260, 220, 100, 190]);
  ensureTableSheet_(ss, CRM.sheets.settings, CRM.headers.settings, [220, 260, 420]);
  seedCatalogs_(ss);
  seedTeam_(ss);
  seedSettings_(ss);
  setupDashboard_(ss);
  applyValidations_(ss);
  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert('CRM instalado. Configura los correos en la hoja Equipo y luego publica la web app.');
}

function ensureTableSheet_(ss, name, headers, widths) {
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.setHiddenGridlines(true);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#0b0d0c')
    .setFontColor('#f4f1e9')
    .setFontWeight('bold')
    .setFontFamily('Montserrat')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 38);
  widths.forEach((width, index) => sheet.setColumnWidth(index + 1, width));
  if (!sheet.getFilter() && sheet.getLastColumn()) {
    sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 2), headers.length).createFilter();
  }
  return sheet;
}

function seedCatalogs_(ss) {
  const sheet = ss.getSheetByName(CRM.sheets.catalogs);
  if (sheet.getLastRow() > 1) return;
  const rows = [];
  Object.keys(CRM_CATALOGS).forEach(type => {
    CRM_CATALOGS[type].forEach((value, index) => rows.push([type, value, true, index + 1]));
  });
  sheet.getRange(2, 1, rows.length, 4).setValues(rows);
}

function seedTeam_(ss) {
  const sheet = ss.getSheetByName(CRM.sheets.team);
  if (sheet.getLastRow() > 1) return;
  const email = String(Session.getEffectiveUser().getEmail() || '').toLowerCase();
  sheet.getRange(2, 1, 1, 4).setValues([[email, 'Administrador', true, true]]);
}

function seedSettings_(ss) {
  const sheet = ss.getSheetByName(CRM.sheets.settings);
  if (sheet.getLastRow() > 1) return;
  sheet.getRange(2, 1, 4, 3).setValues([
    ['NOTIFICAR_NUEVA_OPORTUNIDAD', 'FALSE', 'TRUE envia un correo al responsable configurado.'],
    ['EMAIL_DUENO', '', 'Correo que recibe avisos generales y el resumen diario.'],
    ['HORA_RESUMEN', '8', 'Hora aproximada del resumen diario, zona Ecuador.'],
    ['URL_WEB_APP', '', 'Pega aqui la URL /exec despues de publicar.'],
  ]);
}

function applyValidations_(ss) {
  const opportunities = ss.getSheetByName(CRM.sheets.opportunities);
  const catalogs = getCatalogMap_();
  const rules = [
    [6, catalogs.MARCA],
    [9, catalogs.FAMILIA],
    [11, catalogs.CANAL],
    [12, catalogs.ESTADO],
  ];
  rules.forEach(([column, values]) => {
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
    opportunities.getRange(2, column, opportunities.getMaxRows() - 1, 1).setDataValidation(rule);
  });
}

function setupDashboard_(ss) {
  let sheet = ss.getSheetByName(CRM.sheets.dashboard);
  if (!sheet) sheet = ss.insertSheet(CRM.sheets.dashboard, 0);
  sheet.getRange('A1:H1').breakApart();
  sheet.clear();
  sheet.getCharts().forEach(chart => sheet.removeChart(chart));
  sheet.setHiddenGridlines(true);
  sheet.getRange('A1:H1').merge().setValue('MAXMOTOR CRM / CONTROL COMERCIAL')
    .setBackground('#0b0d0c').setFontColor('#f4f1e9').setFontSize(20).setFontWeight('bold');
  sheet.getRange('A3:H3').setValues([['OPORTUNIDADES', '', 'VENDIDAS', '', 'CONVERSION', '', 'SEGUIMIENTOS VENCIDOS', '']]);
  sheet.getRange('A4').setFormula('=COUNTA(Oportunidades!A2:A)');
  sheet.getRange('C4').setFormula('=COUNTIF(Oportunidades!L2:L,"Vendido")');
  sheet.getRange('E4').setFormula('=IFERROR(C4/A4,0)');
  sheet.getRange('G4').setFormula('=COUNTIFS(Oportunidades!L2:L,"<>Vendido",Oportunidades!L2:L,"<>Perdido",Oportunidades!N2:N,"<"&TODAY())');
  sheet.getRange('E4').setNumberFormat('0.0%');
  sheet.getRange('A3:H4').setBackground('#151815').setFontColor('#f4f1e9');
  sheet.getRange('A4:H4').setFontSize(18).setFontWeight('bold');
  sheet.getRange('A7:B7').setValues([['ESTADO', 'TOTAL']]).setBackground('#dc493a').setFontColor('#ffffff').setFontWeight('bold');
  CRM_CATALOGS.ESTADO.forEach((status, index) => {
    const row = index + 8;
    sheet.getRange(row, 1).setValue(status);
    sheet.getRange(row, 2).setFormula(`=COUNTIF(Oportunidades!L:L,A${row})`);
  });
  sheet.getRange('D7:E7').setValues([['CANAL', 'TOTAL']]).setBackground('#dc493a').setFontColor('#ffffff').setFontWeight('bold');
  CRM_CATALOGS.CANAL.forEach((channel, index) => {
    const row = index + 8;
    sheet.getRange(row, 4).setValue(channel);
    sheet.getRange(row, 5).setFormula(`=COUNTIF(Oportunidades!K:K,D${row})`);
  });
  sheet.setFrozenRows(1);
  [180, 100, 40, 190, 100, 40, 230, 100].forEach((width, index) => sheet.setColumnWidth(index + 1, width));
  const statusChart = sheet.newChart().asPieChart().addRange(sheet.getRange('A7:B11'))
    .setPosition(7, 7, 0, 0).setOption('title', 'Embudo por estado').setOption('pieHole', 0.45).build();
  sheet.insertChart(statusChart);
}

function refreshDashboard() {
  setupDashboard_(openCrmSpreadsheet_());
  SpreadsheetApp.flush();
}

function installCrmTriggers() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'sendFollowupDigest')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
  const hour = Math.max(0, Math.min(23, Number(getSetting_('HORA_RESUMEN') || 8)));
  ScriptApp.newTrigger('sendFollowupDigest').timeBased().everyDays(1).atHour(hour).create();
  SpreadsheetApp.getUi().alert('Recordatorio diario instalado.');
}

function openCrmSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('CRM_SPREADSHEET_ID');
  if (!id) throw new Error('Ejecuta setupCrm antes de usar la aplicacion.');
  return SpreadsheetApp.openById(id);
}

function getCatalogMap_() {
  const sheet = openCrmSpreadsheet_().getSheetByName(CRM.sheets.catalogs);
  const rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues() : [];
  const grouped = rows.reduce((map, row) => {
    if (row[2] !== false && String(row[0]).trim() && String(row[1]).trim()) {
      const type = String(row[0]).trim().toUpperCase();
      if (!map[type]) map[type] = [];
      map[type].push({ value: String(row[1]).trim(), order: Number(row[3]) || 9999 });
    }
    return map;
  }, {});
  Object.keys(grouped).forEach(type => {
    grouped[type] = grouped[type].sort((a, b) => a.order - b.order || a.value.localeCompare(b.value)).map(item => item.value);
  });
  return grouped;
}

function getSetting_(key) {
  const sheet = openCrmSpreadsheet_().getSheetByName(CRM.sheets.settings);
  if (sheet.getLastRow() < 2) return '';
  const row = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues()
    .find(item => String(item[0]).trim() === key);
  return row ? String(row[1]).trim() : '';
}
