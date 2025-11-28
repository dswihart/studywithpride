const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://eurovhkmzgqtjrkjwrpb.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cm92aGttemdxdGpya2p3cnBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI1NTE4MiwiZXhwIjoyMDc3ODMxMTgyfQ.XLbVOcpZchoh9yIF4Z3bsv8L4qiREQRKK-9oODOSOI0";

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

setAdminRole("dswihart@gmail.com");
