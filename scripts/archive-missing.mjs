import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Parse .env.local manually
const envContent = readFileSync(".env.local", "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join("=").trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Get leads missing BOTH fields
const { data, error } = await supabase
  .from("leads")
  .select("id")
  .is("barcelona_timeline", null)
  .is("intake", null);

if (error) {
  console.error("Error fetching leads:", error);
  process.exit(1);
}

console.log("Found", data.length, "leads missing both barcelona_timeline and intake");

// Update in batches
const batchSize = 100;
let updated = 0;

for (let i = 0; i < data.length; i += batchSize) {
  const batch = data.slice(i, i + batchSize);
  const ids = batch.map(l => l.id);
  
  const { error: updateError } = await supabase
    .from("leads")
    .update({ contact_status: "archived" })
    .in("id", ids);
  
  if (updateError) {
    console.error("Error updating batch:", updateError);
  } else {
    updated += batch.length;
    console.log("Updated", updated, "/", data.length);
  }
}

console.log("Done! Marked", updated, "leads as archived");
