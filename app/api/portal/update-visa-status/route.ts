import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Secured Write Serverless Function (Story 4.3 AC3)
 * Saves student's visa checklist progress to Transactional DB
 * Target: <100ms latency
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // AC5: Validate user authentication token
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No valid authentication token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      university_name,
      program_name,
      intake_term,
      checklist_progress,
      visa_status,
      application_status,
      notes,
    } = body

    // Upsert visa tracking data (update if exists, insert if new)
    const { data, error: dbError } = await supabase
      .from('application_states')
      .upsert(
        {
          user_id: user.id,
          university_name,
          program_name,
          intake_term,
          checklist_progress: checklist_progress || {},
          visa_status: visa_status || 'not_started',
          application_status: application_status || 'draft',
          notes,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,university_name,program_name,intake_term',
        }
      )
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to save visa status' },
        { status: 500 }
      )
    }

    // Performance logging (AC - <100ms target)
    const responseTime = Date.now() - startTime
    console.log(`[update-visa-status] User: ${user.id} | Response time: ${responseTime}ms`)

    if (responseTime > 100) {
      console.warn(`[PERFORMANCE WARNING] update-visa-status exceeded 100ms: ${responseTime}ms`)
    }

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        user_id: user.id,
        response_time_ms: responseTime,
      },
    })
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    console.error('update-visa-status error:', error)

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH endpoint for partial updates
 */
export async function PATCH(request: NextRequest) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { application_id, ...updates } = body

    if (!application_id) {
      return NextResponse.json(
        { success: false, error: 'application_id is required' },
        { status: 400 }
      )
    }

    // Update only the provided fields
    const { data, error: dbError } = await supabase
      .from('application_states')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', application_id)
      .eq('user_id', user.id) // Security: ensure user owns this record
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to update visa status' },
        { status: 500 }
      )
    }

    const responseTime = Date.now() - startTime
    console.log(`[update-visa-status PATCH] User: ${user.id} | Response time: ${responseTime}ms`)

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        user_id: user.id,
        response_time_ms: responseTime,
      },
    })
  } catch (error: any) {
    console.error('update-visa-status PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
