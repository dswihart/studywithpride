const fs = require('fs');
const path = require('path');

// Read env file
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function revert() {
  const today = new Date().toISOString().split("T")[0];

  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today);

  console.log("Leads created today:", count);

  const { error } = await supabase
    .from("leads")
    .delete()
    .gte("created_at", today);

  if (error) console.log("Error:", error);
  else console.log("Deleted leads created today");

  const { count: newCount } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  console.log("Total leads now:", newCount);
}

revert();
