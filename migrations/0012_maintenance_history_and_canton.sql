ALTER TABLE users ADD COLUMN origin_canton TEXT;
UPDATE users SET origin_canton=origin_city WHERE origin_canton IS NULL AND origin_city IS NOT NULL;

ALTER TABLE operational_products ADD COLUMN service_days INTEGER;
ALTER TABLE operational_products ADD COLUMN service_km INTEGER;
UPDATE operational_products
SET service_days=COALESCE(warranty_days,60),
    service_km=COALESCE(warranty_km,10000);
UPDATE operational_products
SET service_days=60,service_km=10000
WHERE family_id='family-suspension';

ALTER TABLE warranty_events ADD COLUMN service_odometer_km INTEGER;
CREATE INDEX idx_users_origin_canton ON users(origin_canton,created_at);
CREATE INDEX idx_warranty_events_service_history ON warranty_events(installation_id,event_type,created_at);
