UPDATE points_ledger
SET points=points*100
WHERE movement_type='earn'
  AND invoice_id IS NOT NULL
  AND points=(
    SELECT CAST(i.amount_cents/3000 AS INTEGER)
    FROM invoices i
    WHERE i.id=points_ledger.invoice_id
  );
