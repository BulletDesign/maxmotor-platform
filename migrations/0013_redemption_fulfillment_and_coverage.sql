ALTER TABLE rewards ADD COLUMN fulfillment_type TEXT NOT NULL DEFAULT 'sale' CHECK(fulfillment_type IN ('sale','install'));
ALTER TABLE rewards ADD COLUMN product_id TEXT REFERENCES operational_products(id) ON DELETE SET NULL;

ALTER TABLE installations ADD COLUMN coverage_type TEXT NOT NULL DEFAULT 'full' CHECK(coverage_type IN ('full','limited','reward'));

CREATE TABLE redemptions_next (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id TEXT REFERENCES rewards(id) ON DELETE SET NULL,
  reward_name TEXT NOT NULL,
  reward_price_cents INTEGER NOT NULL DEFAULT 0,
  cash_after_points_cents INTEGER NOT NULL DEFAULT 0,
  fulfillment_type TEXT NOT NULL DEFAULT 'sale' CHECK(fulfillment_type IN ('sale','install')),
  product_id TEXT REFERENCES operational_products(id) ON DELETE SET NULL,
  installation_id TEXT REFERENCES installations(id) ON DELETE SET NULL,
  points_reserved INTEGER NOT NULL CHECK(points_reserved > 0),
  status TEXT NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','pending_delivery','rejected','claimed','cancelled')),
  reviewed_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO redemptions_next (
  id,user_id,reward_id,reward_name,reward_price_cents,cash_after_points_cents,fulfillment_type,product_id,points_reserved,status,reviewed_by,created_at,updated_at
)
SELECT
  rd.id,rd.user_id,rd.reward_id,r.name,r.price_cents,r.cash_after_points_cents,r.fulfillment_type,r.product_id,rd.points_reserved,
  CASE rd.status WHEN 'approved' THEN 'pending_delivery' WHEN 'delivered' THEN 'claimed' ELSE rd.status END,
  rd.reviewed_by,rd.created_at,rd.updated_at
FROM redemptions rd
JOIN rewards r ON r.id=rd.reward_id;

DROP TABLE redemptions;
ALTER TABLE redemptions_next RENAME TO redemptions;
CREATE INDEX idx_redemptions_user ON redemptions(user_id,status);
CREATE INDEX idx_redemptions_status ON redemptions(status,created_at);
CREATE INDEX idx_redemptions_reward ON redemptions(reward_id,status);
