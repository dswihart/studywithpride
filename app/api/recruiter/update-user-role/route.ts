/**
 * Update User Role API
 * POST /api/recruiter/update-user-role
 *
 * Allows admins to change user roles
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRole } from "@/lib/auth/role-guard"

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_ROLES = ["student", "recruiter", "admin"]

export async function POST(request: NextRequest) {
  try {
    // Only admins can change roles
    const roleCheck = await requireRole("admin")
    if (!roleCheck.authorized) {
      // Also allow recruiters to view but not modify
      const recruiterCheck = await requireRole("recruiter")
      if (!recruiterCheck.authorized) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
      }
      // Recruiters can't change roles
      return NextResponse.json(
        { success: false, error: "Only admins can change user roles" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { user_id, new_role } = body

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      )
    }

    if (!new_role || !VALID_ROLES.includes(new_role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      )
    }

    // Get current user data
    const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user_id)

    if (getUserError || !userData.user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Update user metadata with new role
    const currentMetadata = userData.user.user_metadata || {}
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      user_metadata: {
        ...currentMetadata,
        role: new_role,
      },
    })

    if (updateError) {
      console.error("[update-user-role] Error updating user:", updateError)
      return NextResponse.json(
        { success: false, error: "Failed to update user role" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${new_role}`,
      data: {
        user_id,
        new_role,
        email: userData.user.email,
      },
    })
  } catch (error) {
    console.error("[update-user-role] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch user's current role
export async function GET(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")
    if (!roleCheck.authorized) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      )
    }

    const { data: userData, error } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (error || !userData.user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user_id: userId,
        email: userData.user.email,
        role: userData.user.user_metadata?.role || "student",
        full_name: userData.user.user_metadata?.full_name,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
