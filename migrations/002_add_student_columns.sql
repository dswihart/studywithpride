-- Add missing columns to user_profiles for student data
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS crm_lead_id UUID REFERENCES leads(id);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS intake_term TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS program_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_crm_lead_id ON user_profiles(crm_lead_id);
