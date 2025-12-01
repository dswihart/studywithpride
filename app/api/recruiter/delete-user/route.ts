/**
 * Delete User API
 * POST /api/recruiter/delete-user
 *
 * Only admins can delete users
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
    // Only admins can delete users
    const roleCheck = await requireRole("admin")
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: "Only admins can delete users" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      )
    }

    // Get user info first
    const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user_id)

    if (getUserError || !userData.user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Delete user profile if exists
    await supabaseAdmin
      .from("user_profiles")
      .delete()
      .eq("id", user_id)

    // Delete application state if exists
    try {
      await supabaseAdmin
        .from("application_state")
        .delete()
        .eq("user_id", user_id)
    } catch (e) {
      // Table may not exist
    }

    // Delete from auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id)

    if (deleteError) {
      console.error("[delete-user] Error deleting user:", deleteError)
      return NextResponse.json(
        { success: false, error: "Failed to delete user" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      deleted_email: userData.user.email,
    })
  } catch (error) {
    console.error("[delete-user] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
