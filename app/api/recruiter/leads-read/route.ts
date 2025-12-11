/**
 * Story 5.1-B: Secure Lead Read API for Recruiters
 * GET /api/recruiter/leads-read
 *
 * Thin route handler that delegates to LeadService
 */

import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth/role-guard"
import { LeadService } from "@/lib/services"

interface LeadReadResponse {
  success: boolean
  data?: any[] | {
    leads: any[]
    total: number
    filtered: number
  }
  error?: string
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  // Check recruiter role
  const roleCheck = await requireRole("recruiter")
  if (!roleCheck.authorized) {
    return NextResponse.json(
      { success: false, error: roleCheck.reason || "Forbidden" } as LeadReadResponse,
      { status: 403 }
    )
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url)
  const country = searchParams.get("country") || undefined
  const contactStatus = searchParams.get("contact_status") || undefined
  const limit = parseInt(searchParams.get("limit") || "100")
  const offset = parseInt(searchParams.get("offset") || "0")
  const search = searchParams.get("search") || undefined
  const includeArchived = searchParams.get("include_archived") === "true"
  const funnelStage = searchParams.get("funnel_stage")
    ? parseInt(searchParams.get("funnel_stage")!)
    : undefined
  const leadQuality = searchParams.get("lead_quality") || undefined
  const needsFollowup = searchParams.get("needs_followup") === "true"

  // Delegate to service
  const result = await LeadService.getLeads(
    {
      country,
      contactStatus,
      search,
      includeArchived,
      funnelStage,
      leadQuality,
      needsFollowup
    },
    { limit, offset }
  )

  if (!result.success) {
    console.error("[leads-read] Error:", result.error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" } as LeadReadResponse,
      { status: 500 }
    )
  }

  const elapsedTime = Date.now() - startTime
  console.log(`[leads-read] Completed in ${elapsedTime}ms`)

  // If search is provided, return simplified format for modals
  if (search) {
    return NextResponse.json(
      {
        success: true,
        data: result.data!.items
      } as LeadReadResponse,
      { status: 200 }
    )
  }

  // Return paginated format
  return NextResponse.json(
    {
      success: true,
      data: {
        leads: result.data!.items,
        total: result.data!.total,
        filtered: result.data!.filtered
      }
    } as LeadReadResponse,
    { status: 200 }
  )
}
