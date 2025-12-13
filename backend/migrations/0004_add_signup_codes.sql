-- Add signup codes for provisional users
ALTER TABLE users ADD COLUMN signup_code TEXT;

-- Create index for faster code lookups
CREATE INDEX IF NOT EXISTS idx_users_signup_code ON users(signup_code);
