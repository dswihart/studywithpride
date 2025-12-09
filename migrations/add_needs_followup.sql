-- Add needs_followup column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS needs_followup BOOLEAN DEFAULT FALSE;

-- Add index for filtering leads that need follow-up
CREATE INDEX IF NOT EXISTS idx_leads_needs_followup ON leads(needs_followup) WHERE needs_followup = TRUE;
