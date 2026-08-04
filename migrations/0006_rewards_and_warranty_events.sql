ALTER TABLE rewards ADD COLUMN price_cents INTEGER NOT NULL DEFAULT 0 CHECK(price_cents >= 0);
ALTER TABLE rewards ADD COLUMN cash_after_points_cents INTEGER NOT NULL DEFAULT 0 CHECK(cash_after_points_cents >= 0);

CREATE TABLE warranty_events (
  id TEXT PRIMARY KEY,
  installation_id TEXT NOT NULL REFERENCES installations(id),
  event_type TEXT NOT NULL CHECK(event_type IN ('extended','serviced','voided')),
  previous_due_at TEXT,
  new_due_at TEXT,
  previous_due_km INTEGER,
  new_due_km INTEGER,
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warranty_events_installation ON warranty_events(installation_id,created_at);
CREATE INDEX idx_warranty_events_type ON warranty_events(event_type,created_at);
