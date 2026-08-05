ALTER TABLE users ADD COLUMN job_title TEXT;
ALTER TABLE users ADD COLUMN created_by TEXT REFERENCES users(id);

ALTER TABLE operational_products ADD COLUMN coverage_available INTEGER NOT NULL DEFAULT 1 CHECK(coverage_available IN (0,1));
ALTER TABLE operational_products ADD COLUMN tracking_mode TEXT NOT NULL DEFAULT 'both' CHECK(tracking_mode IN ('none','time','mileage','both'));
UPDATE operational_products
SET tracking_mode=CASE
  WHEN COALESCE(service_days,0)>0 AND COALESCE(service_km,0)>0 THEN 'both'
  WHEN COALESCE(service_days,0)>0 THEN 'time'
  WHEN COALESCE(service_km,0)>0 THEN 'mileage'
  ELSE 'none'
END;

ALTER TABLE installations ADD COLUMN tracking_mode TEXT NOT NULL DEFAULT 'both' CHECK(tracking_mode IN ('none','time','mileage','both'));
UPDATE installations
SET tracking_mode=CASE
  WHEN coverage_type='limited' THEN 'none'
  WHEN next_service_at IS NOT NULL AND next_service_km IS NOT NULL THEN 'both'
  WHEN next_service_at IS NOT NULL THEN 'time'
  WHEN next_service_km IS NOT NULL THEN 'mileage'
  ELSE 'none'
END;

CREATE INDEX idx_users_staff_status ON users(role,status,created_at);
