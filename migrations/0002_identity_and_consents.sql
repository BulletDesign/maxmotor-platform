ALTER TABLE users ADD COLUMN national_id TEXT;
CREATE UNIQUE INDEX idx_users_national_id ON users(national_id) WHERE national_id IS NOT NULL;

CREATE TABLE consents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  version TEXT NOT NULL,
  accepted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, consent_type, version)
);

CREATE INDEX idx_consents_user ON consents(user_id);
