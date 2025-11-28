-- Create tasks table for lead follow-up management
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) NOT NULL DEFAULT 'follow_up',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- Add RLS policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all tasks
CREATE POLICY "Allow authenticated users to read tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert tasks
CREATE POLICY "Allow authenticated users to insert tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update tasks
CREATE POLICY "Allow authenticated users to update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete tasks
CREATE POLICY "Allow authenticated users to delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- Add comment for documentation
COMMENT ON TABLE tasks IS 'Follow-up tasks for lead management';
COMMENT ON COLUMN tasks.task_type IS 'Type: follow_up, call, email, meeting, whatsapp, other';
COMMENT ON COLUMN tasks.priority IS 'Priority: low, medium, high, urgent';
COMMENT ON COLUMN tasks.status IS 'Status: pending, in_progress, completed, cancelled';
