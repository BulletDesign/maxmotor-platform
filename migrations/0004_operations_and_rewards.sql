CREATE TABLE product_families (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE operational_products (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES product_families(id),
  name TEXT NOT NULL,
  warranty_days INTEGER,
  warranty_km INTEGER,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(family_id,name)
);

CREATE TABLE installations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  product_id TEXT NOT NULL REFERENCES operational_products(id),
  invoice_id TEXT REFERENCES invoices(id),
  installed_at TEXT NOT NULL,
  installed_km INTEGER NOT NULL DEFAULT 0,
  next_service_at TEXT,
  next_service_km INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','service_due','expired','void')),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rewards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL CHECK(points_cost > 0),
  stock_limit INTEGER NOT NULL DEFAULT 0 CHECK(stock_limit >= 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE redemptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  reward_id TEXT NOT NULL REFERENCES rewards(id),
  points_reserved INTEGER NOT NULL CHECK(points_reserved > 0),
  status TEXT NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','approved','rejected','delivered','cancelled')),
  reviewed_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_operational_products_family ON operational_products(family_id,active);
CREATE INDEX idx_installations_user ON installations(user_id,created_at);
CREATE INDEX idx_installations_vehicle ON installations(vehicle_id,status);
CREATE INDEX idx_rewards_active ON rewards(active,points_cost);
CREATE INDEX idx_redemptions_user ON redemptions(user_id,status);
CREATE INDEX idx_redemptions_status ON redemptions(status,created_at);

INSERT INTO product_families (id,name) VALUES
('family-suspension','Suspensiones'),
('family-covers','Tapas y lonas'),
('family-protection','Bullbars y protección'),
('family-towing','Barras de tiro'),
('family-load','Sistemas de carga'),
('family-lighting','Iluminación'),
('family-interior','Interior'),
('family-polyurethane','Recubrimiento de poliuretano');
