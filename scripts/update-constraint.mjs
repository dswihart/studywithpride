import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envContent = readFileSync(".env.local", "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join("=").trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Drop old constraint and add new one with archived
const { data, error } = await supabase.rpc("exec_sql", {
  sql: `
    ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_contact_status_check;
    ALTER TABLE leads ADD CONSTRAINT leads_contact_status_check 
    CHECK (contact_status IN (
      not_contacted, contacted, interested, qualified, 
      converted, unqualified, referral, notinterested, 
      wrongnumber, archived
    ));
  `
});

if (error) {
  console.error("RPC Error:", error);
  console.log("Trying direct SQL approach...");
} else {
  console.log("Constraint updated successfully");
}
