/**
 * Link Visits API for Recruiters
 * GET /api/recruiter/link-visits?link_id=xxx - Get all visits for a specific link
 * GET /api/recruiter/link-visits?lead_id=xxx - Get all visits across all links for a lead
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/role-guard"

interface LinkVisit {
  id: string
  link_id: string
  visited_at: string
  ip_address: string | null
  user_agent: string | null
  referrer: string | null
  link?: {
    label: string | null
    destination_url: string
  }
}

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
    const linkId = searchParams.get("link_id")
    const leadId = searchParams.get("lead_id")

    if (\!linkId && \!leadId) {
      return NextResponse.json(
        { success: false, error: "link_id or lead_id is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    if (linkId) {
      // Get visits for a specific link
      const { data: visits, error } = await supabase
        .from("link_visits")
        .select("*")
        .eq("link_id", linkId)
        .order("visited_at", { ascending: false })

      if (error) {
        console.error("[link-visits] Error:", error)
        return NextResponse.json(
          { success: false, error: "Failed to fetch visits" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: visits || []
      })
    }

    if (leadId) {
      // Get all visits for all links belonging to a lead
      const { data: links, error: linksError } = await supabase
        .from("lead_tracking_links")
        .select(`
          id,
          label,
          destination_url,
          link_visits (
            id,
            visited_at,
            ip_address,
            user_agent,
            referrer
          )
        `)
        .eq("lead_id", leadId)

      if (linksError) {
        console.error("[link-visits] Error:", linksError)
        return NextResponse.json(
          { success: false, error: "Failed to fetch visits" },
          { status: 500 }
        )
      }

      // Flatten visits with link info
      const allVisits: LinkVisit[] = []
      for (const link of links || []) {
        for (const visit of (link.link_visits as any[]) || []) {
          allVisits.push({
            ...visit,
            link: {
              label: link.label,
              destination_url: link.destination_url
            }
          })
        }
      }

      // Sort by visited_at descending
      allVisits.sort((a, b) => 
        new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime()
      )

      return NextResponse.json({
        success: true,
        data: allVisits
      })
    }

  } catch (error: any) {
    console.error("[link-visits] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
