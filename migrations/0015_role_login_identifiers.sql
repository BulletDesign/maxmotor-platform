CREATE TABLE role_login_identifiers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  identifier TEXT NOT NULL COLLATE NOCASE,
  role TEXT NOT NULL CHECK(role IN ('employee','superadmin')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(identifier,role)
);

CREATE INDEX idx_role_login_identifier ON role_login_identifiers(identifier,role);
