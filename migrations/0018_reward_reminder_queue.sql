PRAGMA foreign_keys = ON;

CREATE TABLE reward_reminder_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  contact_status TEXT NOT NULL DEFAULT 'active' CHECK(contact_status IN ('active','opted_out','invalid_phone')),
  paused_until TEXT,
  updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reward_reminder_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK(action IN ('sent','not_sent','skipped','postponed','opted_out','invalid_phone')),
  points_snapshot INTEGER NOT NULL,
  reward_signature TEXT NOT NULL,
  rewards_json TEXT NOT NULL,
  message_text TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reward_reminder_events_user_created ON reward_reminder_events(user_id,created_at);
CREATE INDEX idx_reward_reminder_events_signature ON reward_reminder_events(user_id,reward_signature,action);
CREATE INDEX idx_reward_reminder_preferences_status ON reward_reminder_preferences(contact_status,paused_until);
