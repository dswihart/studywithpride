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

const { data, error, count } = await supabase
  .from("leads")
  .select("id, prospect_name, prospect_email, barcelona_timeline, intake", { count: "exact" })
  .or("barcelona_timeline.is.null,intake.is.null");

if (error) {
  console.error("Error:", error);
  process.exit(1);
}

console.log("Total leads missing barcelona_timeline OR intake:", count);

const missingBoth = data.filter(l => l.barcelona_timeline === null && l.intake === null).length;
const missingTimeline = data.filter(l => l.barcelona_timeline === null && l.intake !== null).length;
const missingIntake = data.filter(l => l.barcelona_timeline !== null && l.intake === null).length;

console.log("Missing BOTH fields:", missingBoth);
console.log("Missing only barcelona_timeline:", missingTimeline);
console.log("Missing only intake:", missingIntake);

console.log("\nSample leads missing data:");
data.slice(0, 10).forEach(l => {
  console.log("- " + (l.prospect_name || "No name") + " | Timeline: " + (l.barcelona_timeline || "NULL") + " | Intake: " + (l.intake || "NULL"));
});
