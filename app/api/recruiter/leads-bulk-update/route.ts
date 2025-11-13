/**
 * API Route: Bulk Update Leads
 * Updates multiple leads at once (contact_status and/or referral_source)
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
    const allowedUpdates: any = {}

    if (updates.contact_status) {
      allowedUpdates.contact_status = updates.contact_status
    }

    if (updates.referral_source) {
      allowedUpdates.referral_source = updates.referral_source
    }

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
      .eq('user_id', user.id)
      .select()

    if (error) {
      console.error('Bulk update error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update leads'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        updated: data?.length || 0,
        leads: data
      }
    })

  } catch (error) {
    console.error('Bulk update exception:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
