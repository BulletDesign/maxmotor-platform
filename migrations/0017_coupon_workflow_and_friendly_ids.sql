PRAGMA defer_foreign_keys = true;

CREATE TABLE coupons_next (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK(discount_percent > 0 AND discount_percent <= 100),
  terms TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','requested','accepted','redeemed','rejected','expired','void')),
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  requested_at TEXT,
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,
  redeemed_at TEXT
);

INSERT INTO coupons_next(id,user_id,code,discount_percent,terms,status,expires_at,created_at,redeemed_at)
SELECT id,user_id,code,discount_percent,terms,status,expires_at,created_at,redeemed_at FROM coupons;

DROP TABLE coupons;
ALTER TABLE coupons_next RENAME TO coupons;

CREATE UNIQUE INDEX idx_coupons_welcome_user ON coupons(user_id) WHERE discount_percent=10;
CREATE INDEX idx_coupons_user_status ON coupons(user_id,status,created_at);
CREATE INDEX idx_coupons_status_created ON coupons(status,created_at);

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY datetime(created_at), id) AS position
  FROM users
  WHERE role='customer'
) UPDATE users SET customer_code=(SELECT printf('MM-%05d', 10000 + ranked.position) FROM ranked WHERE ranked.id=users.id) WHERE role='customer';
