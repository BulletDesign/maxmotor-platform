ALTER TABLE invoices ADD COLUMN points_enabled INTEGER NOT NULL DEFAULT 1 CHECK(points_enabled IN (0,1));

INSERT OR IGNORE INTO product_families(id,name) VALUES
('family-misc','Varios');

INSERT OR IGNORE INTO operational_products(
  id,family_id,name,warranty_days,warranty_km,service_days,service_km,coverage_available,tracking_mode,active
) VALUES
('product-hard-cover-four-panel','family-covers','Tapa Rigida de Balde 4 Partes',NULL,NULL,NULL,NULL,0,'none',1),
('product-laminated','family-misc','Laminado',NULL,NULL,NULL,NULL,0,'none',1);
