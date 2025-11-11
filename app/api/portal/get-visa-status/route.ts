import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Secured Read Serverless Function (Story 4.3 AC2)
 * Retrieves student's visa tracking state from Transactional DB
 * Target: <100ms latency
 */
export async function GET(request: NextRequest) {
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

    // Fetch user's visa tracking data from application_states table
    const { data: applications, error: dbError } = await supabase
      .from('application_states')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Database query failed' },
        { status: 500 }
      )
    }

    // Performance logging (AC - <100ms target)
    const responseTime = Date.now() - startTime
    console.log(`[get-visa-status] User: ${user.id} | Response time: ${responseTime}ms`)

    if (responseTime > 100) {
      console.warn(`[PERFORMANCE WARNING] get-visa-status exceeded 100ms: ${responseTime}ms`)
    }

    return NextResponse.json({
      success: true,
      data: applications || [],
      metadata: {
        user_id: user.id,
        response_time_ms: responseTime,
      },
    })
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    console.error('get-visa-status error:', error)

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
