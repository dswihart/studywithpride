import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from("leads")
  .select("intake")
  .limit(1);

if (error) {
  console.log("Error:", error.message);
  if (error.message.includes("intake")) {
    console.log("Column needs to be added. Run in Supabase SQL Editor:");
    console.log("ALTER TABLE leads ADD COLUMN intake TEXT;");
  }
} else {
  console.log("Column exists! Sample:", data);
}
