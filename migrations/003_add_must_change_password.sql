-- Add must_change_password column to user_profiles
-- This tracks whether a student needs to change their temporary password

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- Set existing students to false (they don't need to change)
UPDATE user_profiles SET must_change_password = false WHERE must_change_password IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.must_change_password IS 'True if user must change password on next login (for new student accounts)';
