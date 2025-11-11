import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Auth Callback Route Handler (Story 4.1 - Enhanced)
 * 
 * Handles both OAuth callbacks and email confirmation flows.
 * Supports both HTTP and HTTPS redirects for development/production.
 */

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/student-portal"
  
  // Determine the correct origin (prefer HTTPS in production)
  const host = request.headers.get("host")
  const protocol = process.env.NODE_ENV === "production" ? "https" : 
                   host?.includes("localhost") ? "http" : "https"
  const origin = `${protocol}://${host}`

  if (code) {
    const supabase = await createClient()

    try {
      // Exchange the auth code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        // Redirect to login with error
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      // Get user data to determine redirect based on role
      const { data: { user } } = await supabase.auth.getUser()
      const userRole = user?.user_metadata?.role

      // Role-based redirect logic
      let redirectPath = next

      if (userRole === 'recruiter' || userRole === 'admin') {
        redirectPath = '/admin/recruitment/dashboard'
      } else if (redirectPath === '/student-portal') {
        // Keep default for students
        redirectPath = '/student-portal'
      }

      // Successful authentication - redirect to role-appropriate destination
      return NextResponse.redirect(`${origin}${redirectPath}`)
    } catch (error) {
      console.error("Unexpected error during auth callback:", error)
      return NextResponse.redirect(`${origin}/login?error=unexpected_error`)
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
