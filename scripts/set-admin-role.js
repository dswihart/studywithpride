require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function setAdminRole(email) {
  // Get user by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.error("User not found:", email);
    return;
  }

  console.log("Found user:", user.id, user.email);
  console.log("Current metadata:", user.user_metadata);

  // Update user metadata to include admin role
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, role: "admin" }
  });

  if (error) {
    console.error("Error updating user:", error);
    return;
  }

  console.log("Successfully updated user role to admin");
  console.log("New metadata:", data.user.user_metadata);
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error("Usage: node set-admin-role.js <email>");
  process.exit(1);
}

setAdminRole(email);
