import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (\!supabaseUrl || \!anonKey) {
  console.error("Error: Missing required environment variables");
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

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
