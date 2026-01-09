-- Migration to OAuth2 authentication with S-Auth
-- This removes password-based auth and adds OAuth2 fields

-- Step 1: Add new OAuth2 fields to users table
ALTER TABLE users ADD COLUMN oauth_provider TEXT DEFAULT 'sauth';
ALTER TABLE users ADD COLUMN oauth_subject TEXT; -- 'sub' from S-Auth (e.g., 'JD-7392')
ALTER TABLE users ADD COLUMN given_name TEXT;
ALTER TABLE users ADD COLUMN family_name TEXT;
ALTER TABLE users ADD COLUMN access_level TEXT DEFAULT 'user'; -- from S-Auth
ALTER TABLE users ADD COLUMN last_login DATETIME;

-- Step 2: Make password_hash nullable (for transition period)
-- Already done in migration 0005, so password_hash is already nullable

-- Step 3: Create unique index on oauth_subject
CREATE UNIQUE INDEX idx_users_oauth_subject ON users(oauth_subject) WHERE oauth_subject IS NOT NULL;

-- Step 4: Update name field to be computed from given_name + family_name
-- (This will be handled in application logic on user sync)

-- Step 5: Remove provisional user fields (no longer needed with OAuth2)
-- We'll keep is_provisional for backward compatibility during migration
-- But new users won't use it

-- Step 6: Remove signup_code (no longer needed)
-- Keep for backward compatibility during migration

-- Note: We're NOT dropping password_hash to allow gradual migration
-- Users can still use passwords until they log in with OAuth2
-- After all users have migrated, we can drop these columns:
-- - password_hash
-- - is_provisional
-- - signup_code
