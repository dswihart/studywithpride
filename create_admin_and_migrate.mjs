import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (\!supabaseUrl || \!serviceKey) {
  console.error("Error: Missing required environment variables");
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log("=== Setting up Admin User and Running Migration ===\n");

  // Step 1: Create or get admin user
  console.log("1. Creating admin user...");
  const adminEmail = "admin@studywithpride.com";
  const adminPassword = "Admin123\!Secure";

  const { data: adminUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      role: "admin"
    }
  });

  if (createError) {
    if (createError.message.includes("already registered")) {
      console.log("   ↳ Admin user already exists");
      // Get existing user
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const existing = users?.users?.find(u => u.email === adminEmail);
      if (existing && \!existing.user_metadata?.role) {
        // Update role if missing
        await supabaseAdmin.auth.admin.updateUserById(existing.id, {
          user_metadata: { role: "admin" }
        });
        console.log("   ✓ Updated admin user role");
      }
    } else {
      console.log("   ↳ Error:", createError.message);
    }
  } else {
    console.log(`   ✓ Admin user created: ${adminEmail}`);
  }

  // Step 2: Create recruiter user for testing
  console.log("\n2. Creating test recruiter user...");
  const recruiterEmail = "recruiter@studywithpride.com";
  const recruiterPassword = "Recruiter123\!Secure";

  const { data: recruiterUser, error: recruiterError } = await supabaseAdmin.auth.admin.createUser({
    email: recruiterEmail,
    password: recruiterPassword,
    email_confirm: true,
    user_metadata: {
      role: "recruiter"
    }
  });

  if (recruiterError) {
    if (recruiterError.message.includes("already registered")) {
      console.log("   ↳ Recruiter user already exists");
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const existing = users?.users?.find(u => u.email === recruiterEmail);
      if (existing) {
        await supabaseAdmin.auth.admin.updateUserById(existing.id, {
          user_metadata: { role: "recruiter" }
        });
        console.log("   ✓ Updated recruiter user role");
      }
    } else {
      console.log("   ↳ Error:", recruiterError.message);
    }
  } else {
    console.log(`   ✓ Recruiter user created: ${recruiterEmail}`);
  }

  // Step 3: Sign in as admin and get JWT
  console.log("\n3. Authenticating as admin...");
  if (\!anonKey) {
    console.log("   ↳ NEXT_PUBLIC_SUPABASE_ANON_KEY not set, skipping migration");
    console.log("\n=== Setup Complete (migration skipped) ===");
    return;
  }
  
  const supabaseClient = createClient(supabaseUrl, anonKey);
  
  const { data: session, error: signInError } = await supabaseClient.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword
  });

  if (signInError || \!session) {
    console.log("   ↳ Could not sign in:", signInError?.message);
    console.log("\n=== Setup Complete (migration skipped) ===");
    console.log("\nCreated users:");
    console.log("- Admin: admin@studywithpride.com / Admin123\!Secure");
    console.log("- Recruiter: recruiter@studywithpride.com / Recruiter123\!Secure");
    console.log("\nPlease run migration manually via Supabase Dashboard or API");
    return;
  }

  const token = session.session.access_token;
  console.log("   ✓ Authenticated successfully");

  // Step 4: Call migration endpoint
  console.log("\n4. Running database migration...");
  try {
    const response = await fetch("http://localhost:3000/api/admin/migrate-leads", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log("   ✓ Migration completed successfully");
      if (result.details) {
        console.log("   Details:", JSON.stringify(result.details, null, 2));
      }
    } else {
      console.log("   ↳ Migration response:", result);
    }
  } catch (e) {
    console.log("   ↳ Error calling migration endpoint:", e.message);
  }

  console.log("\n=== Setup Complete ===");
  console.log("\nCreated users:");
  console.log("- Admin: admin@studywithpride.com / Admin123\!Secure");
  console.log("- Recruiter: recruiter@studywithpride.com / Recruiter123\!Secure");
}

main().then(() => process.exit(0)).catch((e) => {
  console.error("Setup failed:", e);
  process.exit(1);
});
