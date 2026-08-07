function sendFollowupDigest() {
  const ss = openCrmSpreadsheet_();
  const opportunities = dataRows_(ss.getSheetByName(CRM.sheets.opportunities));
  const clients = dataRows_(ss.getSheetByName(CRM.sheets.clients));
  const clientMap = Object.fromEntries(clients.map(row => [String(row[0]), row]));
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const due = opportunities.filter(row => {
    const followup = row[13];
    return followup instanceof Date && followup <= today && !['Vendido', 'Perdido'].includes(String(row[11]));
  });
  const grouped = due.reduce((map, row) => {
    const advisor = String(row[4] || '').trim().toLowerCase();
    if (!advisor) return map;
    if (!map[advisor]) map[advisor] = [];
    map[advisor].push({ row, client: clientMap[String(row[3])] || [] });
    return map;
  }, {});

  Object.keys(grouped).forEach(email => {
    const rows = grouped[email].map(item => {
      const client = item.client;
      const opportunity = item.row;
      return `<tr><td>${escapeHtml_(client[3])}</td><td>${escapeHtml_(client[4])}</td><td>${escapeHtml_(opportunity[9])}</td><td>${escapeHtml_(opportunity[11])}</td><td>${escapeHtml_(formatDate_(opportunity[13]))}</td></tr>`;
    }).join('');
    MailApp.sendEmail({
      to: email,
      subject: `Maxmotor CRM: ${grouped[email].length} seguimientos pendientes`,
      htmlBody: `<h2>Seguimientos pendientes</h2><table border="1" cellpadding="8" cellspacing="0"><tr><th>Cliente</th><th>Telefono</th><th>Producto</th><th>Estado</th><th>Fecha</th></tr>${rows}</table>`,
    });
  });
}

function notifyNewOpportunity_(data, opportunityId, advisorEmail) {
  if (getSetting_('NOTIFICAR_NUEVA_OPORTUNIDAD').toUpperCase() !== 'TRUE') return;
  const ownerEmail = getSetting_('EMAIL_DUENO');
  if (!ownerEmail) return;
  MailApp.sendEmail({
    to: ownerEmail,
    subject: `Nueva oportunidad ${opportunityId}: ${data.product}`,
    htmlBody: `<p><strong>${escapeHtml_(data.name)}</strong> consulto por <strong>${escapeHtml_(data.product)}</strong>.</p><p>${escapeHtml_(data.brand)} ${escapeHtml_(data.model)} · ${escapeHtml_(data.province)} · ${escapeHtml_(data.status)}</p><p>Asesor: ${escapeHtml_(advisorEmail)}</p>`,
  });
}

function escapeHtml_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
