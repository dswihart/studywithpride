/**
 * Story 5.1-A: Secure Lead Write API for Recruiters (Enhanced with Prospect Fields + Phone)
 * POST /api/recruiter/leads-write
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/role-guard'

// Request payload interface
interface LeadWriteRequest {
  id?: string
  user_id?: string
  country?: string
  contact_status: 'not_contacted' | 'referral' | 'contacted' | 'interested' | 'qualified' | 'converted' | 'unqualified' | 'notinterested' | 'wrongnumber' | 'archived' | 'archived_referral'
  last_contact_date?: string
  notes?: string
  prospect_email?: string
  prospect_name?: string
  referral_source?: string
  phone?: string
  campaign?: string
  created_time?: string
  lead_quality?: string
  recruit_priority?: number
}

// Response interface
interface LeadWriteResponse {
  success: boolean
  data?: {
    id: string
    created_at: string
  }
  error?: string
}

/**
 * POST handler for creating/updating leads
 */
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
        } as LeadWriteResponse,
        { status: 403 }
      )
    }

    // Parse request body
    const body: LeadWriteRequest = await request.json()

    // Validate contact_status is provided
    if (!body.contact_status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request: Missing required field (contact_status)'
        } as LeadWriteResponse,
        { status: 400 }
      )
    }

    // Validate contact_status enum
    const validStatuses = ['not_contacted', 'referral', 'contacted', 'interested', 'qualified', 'converted', 'unqualified', 'notinterested', 'wrongnumber', 'archived', 'archived_referral']
    if (!validStatuses.includes(body.contact_status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request: Invalid contact_status. Must be one of: ' + validStatuses.join(', ')
        } as LeadWriteResponse,
        { status: 400 }
      )
    }

    // For new leads, require user_id and country
    if (!body.id && (!body.user_id || !body.country)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request: Missing required fields for new lead (user_id, country)'
        } as LeadWriteResponse,
        { status: 400 }
      )
    }

    // Database insertion with performance tracking
    const supabase = await createClient()

    let result

    if (body.id) {
      // Update existing lead by ID - build update object dynamically
      const updateFields: Record<string, any> = {
        contact_status: body.contact_status,
      }

      // Only update last_contact_date if explicitly provided (FIX: don't overwrite with null)
      if (body.last_contact_date !== undefined) {
        updateFields.last_contact_date = body.last_contact_date
      }

      // Only update fields that are provided
      if (body.country !== undefined) updateFields.country = body.country
      if (body.notes !== undefined) updateFields.notes = body.notes
      if (body.prospect_email !== undefined) updateFields.prospect_email = body.prospect_email
      if (body.prospect_name !== undefined) updateFields.prospect_name = body.prospect_name
      if (body.referral_source !== undefined) updateFields.referral_source = body.referral_source
      if (body.phone !== undefined) updateFields.phone = body.phone
      if (body.lead_quality !== undefined) updateFields.lead_quality = body.lead_quality
      if (body.campaign !== undefined) updateFields.campaign = body.campaign
      if (body.created_time !== undefined) updateFields.created_time = body.created_time
      if (body.recruit_priority !== undefined) updateFields.recruit_priority = body.recruit_priority

      const { data, error } = await supabase
        .from('leads')
        .update(updateFields)
        .eq('id', body.id)
        .select('id, created_at')
        .single()

      if (error) {
        console.error('[leads-write] Update error:', error)
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to update lead: ' + error.message
          } as LeadWriteResponse,
          { status: 500 }
        )
      }

      result = data
    } else {
      // Insert new lead
      const { data, error } = await supabase
        .from('leads')
        .insert({
          user_id: body.user_id,
          country: body.country,
          contact_status: body.contact_status,
          last_contact_date: body.last_contact_date || null,
          created_time: body.created_time || null,
          notes: body.notes || null,
          prospect_email: body.prospect_email || null,
          prospect_name: body.prospect_name || null,
          referral_source: body.referral_source || null,
          phone: body.phone || null,
          lead_quality: body.lead_quality || null,
          campaign: body.campaign || null,
        })
        .select('id, created_at')
        .single()

      if (error) {
        console.error('[leads-write] Insert error:', error)
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to create lead: ' + error.message
          } as LeadWriteResponse,
          { status: 500 }
        )
      }

      result = data
    }

    // Check performance
    const elapsedTime = Date.now() - startTime
    console.log('[leads-write] Operation completed in ' + elapsedTime + 'ms')


    return NextResponse.json(
      {
        success: true,
        data: result
      } as LeadWriteResponse,
      { status: 200 }
    )

  } catch (error: any) {
    console.error('[leads-write] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + error.message
      } as LeadWriteResponse,
      { status: 500 }
    )
  }
}
