/**
 * DELETE /api/recruiter/leads-delete
 * Bulk delete leads API endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/role-guard'

interface LeadDeleteRequest {
  lead_ids: string[]
}

interface LeadDeleteResponse {
  success: boolean
  data?: {
    deleted_count: number
  }
  error?: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Role-based authorization check
    const roleCheck = await requireRole('recruiter')

    if (!roleCheck.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: roleCheck.reason || 'Forbidden: Recruiter access required'
        } as LeadDeleteResponse,
        { status: 403 }
      )
    }

    // Parse request body
    const body: LeadDeleteRequest = await request.json()

    // Validate required fields
    if (!body.lead_ids || !Array.isArray(body.lead_ids) || body.lead_ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request: lead_ids array is required and must not be empty'
        } as LeadDeleteResponse,
        { status: 400 }
      )
    }

    // Database deletion
    const supabase = await createClient()

    const { error, count } = await supabase
      .from('leads')
      .delete({ count: 'exact' })
      .in('id', body.lead_ids)

    if (error) {
      console.error('[leads-delete] Delete error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete leads: ' + error.message
        } as LeadDeleteResponse,
        { status: 500 }
      )
    }

    // Check performance
    const elapsedTime = Date.now() - startTime
    console.log(`[leads-delete] Deleted ${count || 0} leads in ${elapsedTime}ms`)


    return NextResponse.json(
      {
        success: true,
        data: {
          deleted_count: count || 0
        }
      } as LeadDeleteResponse,
      { status: 200 }
    )

  } catch (error: any) {
    console.error('[leads-delete] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + error.message
      } as LeadDeleteResponse,
      { status: 500 }
    )
  }
}
