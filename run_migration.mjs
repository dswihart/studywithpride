import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabaseUrl = "https://eurovhkmzgqtjrkjwrpb.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cm92aGttemdxdGpya2p3cnBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI1NTE4MiwiZXhwIjoyMDc3ODMxMTgyfQ.XLbVOcpZchoh9yIF4Z3bsv8L4qiREQRKK-9oODOSOI0";

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log("=== Running Lead Database Migration ===\n");

  // Read the migration SQL file
  const migrationSQL = fs.readFileSync("../src/db/migrations/002_create_leads_table.sql", "utf8");
  
  // Split by semicolons and filter out comments and empty statements
  const statements = migrationSQL
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--") && !s.startsWith("COMMENT"));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 60).replace(/\n/g, " ");
    console.log(`${i + 1}. ${preview}...`);
    
    try {
      // Try using the exec_sql RPC function if available
      const { data, error } = await supabase.rpc("exec_sql", {
        sql_query: stmt + ";"
      });
      
      if (error) {
        // Check if error is benign (already exists)
        if (error.message.includes("already exists") || error.message.includes("IF NOT EXISTS")) {
          console.log("   ↳ Already exists (skipped)");
          skipCount++;
        } else {
          console.log("   ↳ Note:", error.message);
        }
      } else {
        console.log("   ✓ Success");
        successCount++;
      }
    } catch (e) {
      console.log("   ↳ Error:", e.message);
    }
  }

  // Verify table exists by trying to select from it
  console.log("\n4. Verifying migration...");
  const { data, error } = await supabase
    .from("leads")
    .select("count")
    .limit(1);

  if (!error) {
    console.log("   ✓ SUCCESS - Leads table is accessible");
  } else {
    console.log("   Warning:", error.message);
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Successful: ${successCount}, Skipped: ${skipCount}`);
}

runMigration().then(() => process.exit(0)).catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
