-- Add support for provisional users (users created by admin without password)
ALTER TABLE users ADD COLUMN is_provisional INTEGER DEFAULT 0;

-- Update password_hash column to allow NULL for provisional users
-- Note: SQLite doesn't support modifying columns directly,
-- but the column was already created without NOT NULL constraint in initial migration
