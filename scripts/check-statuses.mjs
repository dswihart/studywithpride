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

const { data, error } = await supabase
  .from("leads")
  .select("contact_status");

if (error) {
  console.error("Error:", error);
  process.exit(1);
}

const statusCounts = {};
data.forEach(l => {
  const status = l.contact_status || "NULL";
  statusCounts[status] = (statusCounts[status] || 0) + 1;
});

console.log("Current contact_status values in database:");
Object.entries(statusCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([status, count]) => {
    console.log("  " + status + ": " + count);
  });
