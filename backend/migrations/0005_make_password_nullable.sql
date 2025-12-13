-- Make password_hash nullable for provisional users
-- Note: D1 handles transactions automatically, no need for explicit BEGIN/COMMIT

-- SQLite doesn't support ALTER COLUMN directly, so we need to recreate the table
-- Create new table with nullable password_hash
CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,  -- Now nullable
  is_admin BOOLEAN DEFAULT 0,
  is_whitelisted BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  name TEXT,
  is_provisional INTEGER DEFAULT 0,
  signup_code TEXT
);

-- Copy data from old table
INSERT INTO users_new (id, email, password_hash, is_admin, is_whitelisted, created_at, updated_at, name, is_provisional, signup_code)
SELECT id, email, password_hash, is_admin, is_whitelisted, created_at, updated_at, name, is_provisional, signup_code
FROM users;

-- Drop old table
DROP TABLE users;

-- Rename new table
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_signup_code ON users(signup_code);
