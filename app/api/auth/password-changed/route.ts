import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Password Changed API
 * POST - Mark the user's password as changed (clear must_change_password flag)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Update the user's profile to clear the must_change_password flag
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        must_change_password: false,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("[password-changed] Update error:", updateError)
      return NextResponse.json(
        { success: false, error: "Failed to update password status" },
        { status: 500 }
      )
    }

    console.log(`[password-changed] Password change flag cleared for user: ${user.id}`)

    return NextResponse.json({
      success: true,
      message: "Password change flag cleared"
    })

  } catch (error) {
    console.error("[password-changed] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
