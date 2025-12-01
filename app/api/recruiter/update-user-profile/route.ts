/**
 * Update User Profile API
 * POST /api/recruiter/update-user-profile
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRole } from "@/lib/auth/role-guard"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const roleCheck = await requireRole("admin")
    const isAdmin = roleCheck.authorized
    
    if (!isAdmin) {
      // Also allow recruiters for basic profile edits (but not role changes)
      const recruiterCheck = await requireRole("recruiter")
      if (!recruiterCheck.authorized) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
      }
    }

    const body = await request.json()
    const { user_id, full_name, phone_number, country_of_origin, role } = body

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      )
    }

    // Only admins can change roles
    if (role && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Only admins can change user roles" },
        { status: 403 }
      )
    }

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("id", user_id)
      .single()

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabaseAdmin
        .from("user_profiles")
        .update({
          full_name: full_name || null,
          phone_number: phone_number || null,
          country_of_origin: country_of_origin || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user_id)

      if (updateError) {
        console.error("[update-user-profile] Update error:", updateError)
        return NextResponse.json(
          { success: false, error: "Failed to update profile" },
          { status: 500 }
        )
      }
    } else {
      // Get user email from auth
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user_id)

      if (!authUser.user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        )
      }

      // Create new profile
      const { error: insertError } = await supabaseAdmin
        .from("user_profiles")
        .insert({
          id: user_id,
          email: authUser.user.email,
          full_name: full_name || null,
          phone_number: phone_number || null,
          country_of_origin: country_of_origin || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error("[update-user-profile] Insert error:", insertError)
        return NextResponse.json(
          { success: false, error: "Failed to create profile" },
          { status: 500 }
        )
      }
    }

    // Build user_metadata update object
    const metadataUpdate: Record<string, any> = {
      full_name: full_name,
    }

    // Add role to metadata if provided (admin only)
    if (role && isAdmin) {
      metadataUpdate.role = role
    }

    // Update user_metadata in auth
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      user_metadata: metadataUpdate,
    })

    if (authUpdateError) {
      console.error("[update-user-profile] Auth update error:", authUpdateError)
      return NextResponse.json(
        { success: false, error: "Failed to update user auth data" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("[update-user-profile] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
