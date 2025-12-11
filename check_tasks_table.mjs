import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load env
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (\!supabaseUrl || \!serviceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function checkTasks() {
  console.log("Checking tasks table...");
  
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .limit(5);

  if (error) {
    console.error("Error querying tasks:", error.message);
    console.error("Error code:", error.code);
    console.error("Error hint:", error.hint);
  } else {
    console.log("Tasks found:", data?.length || 0);
    console.log("Sample data:", JSON.stringify(data, null, 2));
  }
}

checkTasks();
