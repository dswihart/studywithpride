/**
 * API Route: Bulk Update Leads
 * Updates multiple leads at once (contact_status, referral_source, campaign, barcelona_timeline, last_contact_date)
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()
    const { leadIds, updates } = body

    console.log('[leads-bulk-update] Received:', { leadIds, updates })

    // Validate input
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid lead IDs'
      }, { status: 400 })
    }

    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No updates provided'
      }, { status: 400 })
    }

    // Build update object with only allowed fields
    const allowedUpdates: Record<string, string | number | null> = {}

    if (updates.contact_status) {
      allowedUpdates.contact_status = updates.contact_status
    }

    if (updates.referral_source !== undefined) {
      allowedUpdates.referral_source = updates.referral_source
      // Auto-mark as contacted when referred to an agent (unless status is explicitly set)
      if (!allowedUpdates.contact_status) {
        allowedUpdates.contact_status = "contacted"
      }
      // Auto-set last contact date to now (unless explicitly provided)
      if (!updates.last_contact_date) {
        allowedUpdates.last_contact_date = new Date().toISOString()
      }
    }

    if (updates.campaign !== undefined) {
      allowedUpdates.campaign = updates.campaign
    }

    if (updates.barcelona_timeline !== undefined) {
      allowedUpdates.barcelona_timeline = updates.barcelona_timeline
    }

    if (updates.last_contact_date !== undefined) {
      allowedUpdates.last_contact_date = updates.last_contact_date
    }

    console.log('[leads-bulk-update] Allowed updates:', allowedUpdates)

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid updates provided'
      }, { status: 400 })
    }

    // Perform bulk update
    const { data, error } = await supabase
      .from('leads')
      .update(allowedUpdates)
      .in('id', leadIds)
      .select()

    if (error) {
      console.error('[leads-bulk-update] Error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update leads'
      }, { status: 500 })
    }

    console.log('[leads-bulk-update] Success, updated:', data?.length)

    return NextResponse.json({
      success: true,
      data: {
        updated: data?.length || 0,
        leads: data
      }
    })

  } catch (error) {
    console.error('[leads-bulk-update] Exception:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
