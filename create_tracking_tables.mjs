import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://eurovhkmzgqtjrkjwrpb.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cm92aGttemdxdGpya2p3cnBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI1NTE4MiwiZXhwIjoyMDc3ODMxMTgyfQ.XLbVOcpZchoh9yIF4Z3bsv8L4qiREQRKK-9oODOSOI0";

const supabase = createClient(supabaseUrl, serviceKey);

// Check if we can access the Management API
const projectRef = "eurovhkmzgqtjrkjwrpb";

async function createTablesViaAPI() {
  const sql = `
    -- Create lead_tracking_links table
    CREATE TABLE IF NOT EXISTS lead_tracking_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      token VARCHAR(64) UNIQUE NOT NULL,
      destination_url TEXT NOT NULL,
      label VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ,
      created_by UUID,
      is_active BOOLEAN DEFAULT true
    );

    -- Create link_visits table
    CREATE TABLE IF NOT EXISTS link_visits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      link_id UUID NOT NULL REFERENCES lead_tracking_links(id) ON DELETE CASCADE,
      visited_at TIMESTAMPTZ DEFAULT NOW(),
      ip_address INET,
      user_agent TEXT,
      referrer TEXT
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_tracking_links_lead_id ON lead_tracking_links(lead_id);
    CREATE INDEX IF NOT EXISTS idx_tracking_links_token ON lead_tracking_links(token);
    CREATE INDEX IF NOT EXISTS idx_link_visits_link_id ON link_visits(link_id);
    CREATE INDEX IF NOT EXISTS idx_link_visits_visited_at ON link_visits(visited_at DESC);
  `;

  // Try the SQL endpoint
  const response = await fetch(\`https://\${projectRef}.supabase.co/rest/v1/\`, {
    method: "POST",
    headers: {
      "apikey": serviceKey,
      "Authorization": \`Bearer \${serviceKey}\`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ query: sql })
  });

  console.log("Response status:", response.status);
  const text = await response.text();
  console.log("Response:", text);
}

createTablesViaAPI();
