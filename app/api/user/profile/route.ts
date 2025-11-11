import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { UserProfileUpdate, ApiResponse, UserProfile } from "@/lib/types/database"

/**
 * User Profile API Route (Story 4.2)
 * 
 * Secure serverless function for user profile operations
 * Enforces authentication and Row Level Security
 * Performance target: <50ms response time
 */

// GET /api/user/profile - Get current user profile
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Fetch user profile (RLS automatically filters to current user)
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    
    if (error) {
      console.error("Profile fetch error:", error)
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Failed to fetch profile" },
        { status: 500 }
      )
    }
    
    const responseTime = Date.now() - startTime
    console.log(`Profile GET completed in ${responseTime}ms`)
    
    return NextResponse.json<ApiResponse<UserProfile>>({
      success: true,
      data: profile
    })
    
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/user/profile - Update current user profile
export async function PATCH(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Parse request body
    const updates: UserProfileUpdate = await request.json()
    
    // Validate updates
    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "No updates provided" },
        { status: 400 }
      )
    }
    
    // Update profile (RLS ensures user can only update their own)
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single()
    
    if (error) {
      console.error("Profile update error:", error)
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      )
    }
    
    const responseTime = Date.now() - startTime
    console.log(`Profile PATCH completed in ${responseTime}ms`)
    
    // Performance assertion (AC5: <50ms target)
    if (responseTime > 50) {
      console.warn(`Performance warning: Profile update took ${responseTime}ms (target: <50ms)`)
    }
    
    return NextResponse.json<ApiResponse<UserProfile>>({
      success: true,
      data: profile,
      message: "Profile updated successfully"
    })
    
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
