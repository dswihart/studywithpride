import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

const supabaseUrl = "https://eurovhkmzgqtjrkjwrpb.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cm92aGttemdxdGpya2p3cnBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI1NTE4MiwiZXhwIjoyMDc3ODMxMTgyfQ.XLbVOcpZchoh9yIF4Z3bsv8L4qiREQRKK-9oODOSOI0";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cm92aGttemdxdGpya2p3cnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTUxODIsImV4cCI6MjA3NzgzMTE4Mn0.AGofibiNYhk-8mVWefky8XLp_BY7ZNa9Lovksu3hRYo";

const supabase = createClient(supabaseUrl, anonKey);

async function runMigration() {
  console.log("=== Running Database Migration ===\n");

  // Sign in as admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "admin@studywithpride.com",
    password: "Admin123\!Secure"
  });

  if (authError || \!authData.session) {
    console.error("Authentication failed:", authError?.message);
    return;
  }

  const token = authData.session.access_token;
  console.log("✓ Authenticated as admin");
  console.log("✓ Calling migration endpoint...\n");

  // Call migration endpoint
  const response = await fetch("http://localhost:3000/api/admin/migrate-leads", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  const result = await response.json();
  
  console.log("Response Status:", response.status);
  console.log("Response:", JSON.stringify(result, null, 2));

  if (response.ok) {
    console.log("\n✓ Migration completed successfully\!");
  } else {
    console.log("\n✗ Migration failed");
  }
}

runMigration().then(() => process.exit(0)).catch(console.error);
