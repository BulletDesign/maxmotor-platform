export async function getInvoiceHistory(db, userId) {
  const [invoiceData, itemData] = await Promise.all([
    db.prepare(`SELECT i.id,i.invoice_number invoiceNumber,i.amount_cents amountCents,
      i.issued_at issuedAt,i.created_at createdAt,i.points_enabled pointsEnabled,
      COALESCE(SUM(CASE WHEN pl.points>0 THEN pl.points ELSE 0 END),0) pointsEarned,
      COALESCE(actor.full_name,'Sistema Maxmotor') createdByName
      FROM invoices i
      LEFT JOIN points_ledger pl ON pl.invoice_id=i.id
      LEFT JOIN users actor ON actor.id=i.created_by
      WHERE i.user_id=?1
      GROUP BY i.id,i.invoice_number,i.amount_cents,i.issued_at,i.created_at,i.points_enabled,actor.full_name
      ORDER BY datetime(i.issued_at) DESC,datetime(i.created_at) DESC`).bind(userId).all(),
    db.prepare(`SELECT ins.invoice_id invoiceId,p.name productName,f.name familyName,
      ins.coverage_type coverageType,v.brand,v.model,v.plate
      FROM installations ins
      JOIN operational_products p ON p.id=ins.product_id
      JOIN product_families f ON f.id=p.family_id
      LEFT JOIN vehicles v ON v.id=ins.vehicle_id
      WHERE ins.user_id=?1 AND ins.invoice_id IS NOT NULL AND ins.status!='void'
      ORDER BY datetime(ins.created_at),p.name`).bind(userId).all(),
  ]);

  const itemsByInvoice = new Map();
  for (const item of itemData.results || []) {
    const items = itemsByInvoice.get(item.invoiceId) || [];
    items.push(item);
    itemsByInvoice.set(item.invoiceId, items);
  }

  return (invoiceData.results || []).map((invoice) => ({
    ...invoice,
    pointsEnabled: Boolean(Number(invoice.pointsEnabled)),
    pointsEarned: Number(invoice.pointsEarned || 0),
    items: itemsByInvoice.get(invoice.id) || [],
  }));
}
