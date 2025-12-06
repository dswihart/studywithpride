/**
 * Public Tracking Endpoint
 * GET /track/[token] - Records a visit and redirects to destination
 * 
 * This endpoint is PUBLIC (no auth required) so leads can click links
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service role for public access (no auth context)
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceKey)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    const supabase = getServiceClient()

    // Look up the tracking link
    const { data: link, error: linkError } = await supabase
      .from("lead_tracking_links")
      .select("id, destination_url, is_active, expires_at")
      .eq("token", token)
      .single()

    if (linkError || !link) {
      console.log("[track] Link not found:", token)
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Check if link is active
    if (!link.is_active) {
      console.log("[track] Link inactive:", token)
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Check if link has expired
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      console.log("[track] Link expired:", token)
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Record the visit
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || request.headers.get("x-real-ip") 
      || "unknown"
    const userAgent = request.headers.get("user-agent") || null
    const referrer = request.headers.get("referer") || null

    const { error: visitError } = await supabase
      .from("link_visits")
      .insert({
        link_id: link.id,
        ip_address: ip !== "unknown" ? ip : null,
        user_agent: userAgent,
        referrer: referrer
      })

    if (visitError) {
      console.error("[track] Failed to record visit:", visitError)
      // Still redirect even if recording fails
    }

    console.log("[track] Visit recorded for token:", token)

    // Redirect to destination
    return NextResponse.redirect(link.destination_url)

  } catch (error: any) {
    console.error("[track] Error:", error)
    return NextResponse.redirect(new URL("/", request.url))
  }
}
