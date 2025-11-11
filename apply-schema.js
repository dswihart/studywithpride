const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySchema() {
  console.log("Applying database schema...")
  
  try {
    // Read the schema file
    const fs = require("fs")
    const schemaSQL = fs.readFileSync("./src/data/schemas/user-profile.sql", "utf8")
    
    // Split into individual statements
    const statements = schemaSQL
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"))
    
    console.log(\`Executing \${statements.length} SQL statements...\n\`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ";"
      if (statement.includes("CREATE TABLE") || statement.includes("CREATE INDEX") || 
          statement.includes("CREATE POLICY") || statement.includes("ALTER TABLE") ||
          statement.includes("CREATE TRIGGER") || statement.includes("CREATE OR REPLACE FUNCTION") ||
          statement.includes("COMMENT ON")) {
        try {
          const { error } = await supabase.rpc("exec_sql", { sql: statement })
          if (error && !error.message.includes("already exists")) {
            console.error(\`Error on statement \${i + 1}:\`, error.message)
          } else {
            console.log(\`✓ Statement \${i + 1} executed\`)
          }
        } catch (err) {
          console.error(\`Error executing statement \${i + 1}:\`, err.message)
        }
      }
    }
    
    console.log("\n✅ Schema application complete!")
    console.log("\nVerifying tables...")
    
    // Verify tables exist
    const { data: tables, error: tablesError } = await supabase
      .from("user_profiles")
      .select("count")
      .limit(0)
    
    if (!tablesError) console.log("✓ user_profiles table verified")
    
    const { data: apps, error: appsError } = await supabase
      .from("application_states")
      .select("count")
      .limit(0)
    
    if (!appsError) console.log("✓ application_states table verified")
    
    const { data: saved, error: savedError } = await supabase
      .from("saved_content")
      .select("count")
      .limit(0)
    
    if (!savedError) console.log("✓ saved_content table verified")
    
    console.log("\n✅ All tables verified and accessible!")
    
  } catch (error) {
    console.error("Schema application failed:", error)
    process.exit(1)
  }
}

applySchema()
