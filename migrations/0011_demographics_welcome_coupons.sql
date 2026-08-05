ALTER TABLE users ADD COLUMN birth_date TEXT;
ALTER TABLE users ADD COLUMN origin_province TEXT;
ALTER TABLE users ADD COLUMN origin_city TEXT;

CREATE TABLE coupons (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK(discount_percent > 0 AND discount_percent <= 100),
  terms TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','redeemed','expired','void')),
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  redeemed_at TEXT
);

CREATE UNIQUE INDEX idx_coupons_welcome_user ON coupons(user_id) WHERE discount_percent=10;
CREATE INDEX idx_coupons_user_status ON coupons(user_id,status,created_at);
CREATE INDEX idx_users_origin_province ON users(origin_province,created_at);
CREATE INDEX idx_users_birth_date ON users(birth_date);
