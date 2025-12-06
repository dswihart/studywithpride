/**
 * Tracking Links API for Recruiters
 * POST /api/recruiter/tracking-links - Create a new tracking link for a lead
 * GET /api/recruiter/tracking-links?lead_id=xxx - Get all tracking links for a lead
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/role-guard"
import crypto from "crypto"

interface TrackingLink {
  id: string
  lead_id: string
  token: string
  destination_url: string
  label: string | null
  created_at: string
  expires_at: string | null
  is_active: boolean
  visit_count?: number
  last_visited?: string | null
}

// Generate a unique token for tracking links
function generateToken(): string {
  return crypto.randomBytes(16).toString("hex")
}

// GET - Fetch tracking links for a lead
export async function GET(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")
    if (\!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || "Forbidden" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get("lead_id")

    if (\!leadId) {
      return NextResponse.json(
        { success: false, error: "lead_id is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get tracking links with visit counts
    const { data: links, error } = await supabase
      .from("lead_tracking_links")
      .select(`
        *,
        link_visits (
          id,
          visited_at
        )
      `)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[tracking-links] GET error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch tracking links" },
        { status: 500 }
      )
    }

    // Transform to include visit count and last visited
    const transformedLinks = (links || []).map((link: any) => ({
      id: link.id,
      lead_id: link.lead_id,
      token: link.token,
      destination_url: link.destination_url,
      label: link.label,
      created_at: link.created_at,
      expires_at: link.expires_at,
      is_active: link.is_active,
      visit_count: link.link_visits?.length || 0,
      last_visited: link.link_visits?.length > 0
        ? link.link_visits.sort((a: any, b: any) => 
            new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime()
          )[0].visited_at
        : null
    }))

    return NextResponse.json({
      success: true,
      data: transformedLinks
    })

  } catch (error: any) {
    console.error("[tracking-links] GET error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create a new tracking link
export async function POST(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")
    if (\!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { lead_id, destination_url, label, expires_in_days } = body

    if (\!lead_id || \!destination_url) {
      return NextResponse.json(
        { success: false, error: "lead_id and destination_url are required" },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(destination_url)
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid destination URL" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const token = generateToken()

    // Calculate expiry if specified
    let expires_at = null
    if (expires_in_days && expires_in_days > 0) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + expires_in_days)
      expires_at = expiry.toISOString()
    }

    const { data: link, error } = await supabase
      .from("lead_tracking_links")
      .insert({
        lead_id,
        token,
        destination_url,
        label: label || null,
        expires_at,
        created_by: roleCheck.user?.id || null
      })
      .select()
      .single()

    if (error) {
      console.error("[tracking-links] POST error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to create tracking link" },
        { status: 500 }
      )
    }

    // Build the tracking URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://studywithpride.com"
    const trackingUrl = `${baseUrl}/track/${token}`

    return NextResponse.json({
      success: true,
      data: {
        ...link,
        tracking_url: trackingUrl
      }
    })

  } catch (error: any) {
    console.error("[tracking-links] POST error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
