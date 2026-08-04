ALTER TABLE installations ADD COLUMN warranty_id TEXT REFERENCES warranties(id);

UPDATE installations
SET warranty_id=(
  SELECT w.id FROM warranties w
  JOIN operational_products p ON p.id=installations.product_id
  WHERE w.user_id=installations.user_id
    AND w.vehicle_id=installations.vehicle_id
    AND w.product_name=p.name
    AND w.installed_at=installations.installed_at
  ORDER BY w.created_at DESC LIMIT 1
);

CREATE INDEX idx_installations_warranty ON installations(warranty_id);
