import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Secured Save Course Function (Story 4.4 AC1 & AC5)
 * Saves a course to the student's saved_content in Transactional DB
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
    const { course_id, course_data, notes, is_favorite } = body

    if (!course_id) {
      return NextResponse.json(
        { success: false, error: 'course_id is required' },
        { status: 400 }
      )
    }

    // Upsert saved course (insert or update if already exists)
    const { data, error: dbError } = await supabase
      .from('saved_content')
      .upsert(
        {
          user_id: user.id,
          content_type: 'course',
          content_id: course_id,
          content_data: course_data || {},
          notes: notes || null,
          is_favorite: is_favorite || false,
        },
        {
          onConflict: 'user_id,content_type,content_id',
        }
      )
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to save course' },
        { status: 500 }
      )
    }

    // Performance logging (AC - <100ms target)
    const responseTime = Date.now() - startTime
    console.log(`[save-course] User: ${user.id} | Course: ${course_id} | Response time: ${responseTime}ms`)

    if (responseTime > 100) {
      console.warn(`[PERFORMANCE WARNING] save-course exceeded 100ms: ${responseTime}ms`)
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
    console.error('save-course error:', error)

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to fetch all saved courses for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Fetch all saved courses for this user
    const { data: savedCourses, error: dbError } = await supabase
      .from('saved_content')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_type', 'course')
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch saved courses' },
        { status: 500 }
      )
    }

    const responseTime = Date.now() - startTime
    console.log(`[get-saved-courses] User: ${user.id} | Count: ${savedCourses?.length || 0} | Response time: ${responseTime}ms`)

    if (responseTime > 100) {
      console.warn(`[PERFORMANCE WARNING] get-saved-courses exceeded 100ms: ${responseTime}ms`)
    }

    return NextResponse.json({
      success: true,
      data: savedCourses || [],
      metadata: {
        user_id: user.id,
        count: savedCourses?.length || 0,
        response_time_ms: responseTime,
      },
    })
  } catch (error: any) {
    console.error('get-saved-courses error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
