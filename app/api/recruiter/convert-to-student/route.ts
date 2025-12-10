/**
 * Lead-to-Student Conversion API
 * POST /api/recruiter/convert-to-student
 * GET /api/recruiter/convert-to-student?lead_id=xxx
 *
 * Thin route handler that delegates to ConversionService
 */

import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth/role-guard"
import { ConversionService } from "@/lib/services"

interface ConversionResponse {
  success: boolean
  student_user_id?: string
  error?: string
  message?: string
  already_exists?: boolean
}

export async function POST(request: NextRequest): Promise<NextResponse<ConversionResponse>> {
  // Check recruiter role
  const roleCheck = await requireRole("recruiter")
  if (!roleCheck.authorized) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    )
  }

  // Parse request body
  const body = await request.json()
  const { lead_id, intake_period, readiness_comments } = body

  if (!lead_id) {
    return NextResponse.json(
      { success: false, error: "lead_id is required" },
      { status: 400 }
    )
  }

  // Delegate to service
  const result = await ConversionService.convertLeadToStudent({
    leadId: lead_id,
    intakePeriod: intake_period,
    readinessComments: readiness_comments
  })

  if (!result.success) {
    const status = result.code === "NOT_FOUND" ? 404 :
                   result.code === "MISSING_EMAIL" ? 400 : 500
    return NextResponse.json(
      { success: false, error: result.error },
      { status }
    )
  }

  return NextResponse.json({
    success: true,
    student_user_id: result.data!.studentUserId,
    message: result.data!.message,
    already_exists: result.data!.alreadyExisted
  })
}

export async function GET(request: NextRequest) {
  // Check recruiter role
  const roleCheck = await requireRole("recruiter")
  if (!roleCheck.authorized) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    )
  }

  // Get lead_id from query params
  const { searchParams } = new URL(request.url)
  const leadId = searchParams.get("lead_id")

  if (!leadId) {
    return NextResponse.json(
      { success: false, error: "lead_id required" },
      { status: 400 }
    )
  }

  // Delegate to service
  const result = await ConversionService.getConversionStatus(leadId)

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.code === "NOT_FOUND" ? 404 : 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      is_converted: result.data!.isConverted,
      student_user_id: result.data!.studentUserId,
      converted_at: result.data!.convertedAt,
      conversion_source: result.data!.conversionSource
    }
  })
}
