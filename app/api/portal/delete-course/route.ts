import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Secured Delete Course Function (Story 4.4 AC1 & AC5)
 * Removes a saved course from the student's collection
 * Includes authorization check to prevent deleting other users' saved courses
 */
export async function DELETE(request: NextRequest) {
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

    // Get course_id from query params or body
    const url = new URL(request.url)
    const course_id = url.searchParams.get('course_id') || (await request.json().catch(() => ({}))).course_id

    if (!course_id) {
      return NextResponse.json(
        { success: false, error: 'course_id is required' },
        { status: 400 }
      )
    }

    // First, verify the course belongs to this user (Authorization check)
    const { data: existingCourse, error: checkError } = await supabase
      .from('saved_content')
      .select('user_id')
      .eq('content_id', course_id)
      .eq('content_type', 'course')
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = not found, which is okay
      console.error('Database check error:', checkError)
      return NextResponse.json(
        { success: false, error: 'Failed to verify course ownership' },
        { status: 500 }
      )
    }

    // If course exists but doesn't belong to this user, return 403
    if (existingCourse && existingCourse.user_id !== user.id) {
      console.warn(`[delete-course] Authorization failed: User ${user.id} attempted to delete course ${course_id} owned by ${existingCourse.user_id}`)
      return NextResponse.json(
        { success: false, error: "Forbidden - Cannot delete another user's saved course" },
        { status: 403 }
      )
    }

    // Delete the saved course (RLS will also enforce user_id match)
    const { error: dbError } = await supabase
      .from('saved_content')
      .delete()
      .eq('user_id', user.id)
      .eq('content_id', course_id)
      .eq('content_type', 'course')

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete saved course' },
        { status: 500 }
      )
    }

    // Performance logging
    const responseTime = Date.now() - startTime
    console.log(`[delete-course] User: ${user.id} | Course: ${course_id} | Response time: ${responseTime}ms`)

    if (responseTime > 100) {
      console.warn(`[PERFORMANCE WARNING] delete-course exceeded 100ms: ${responseTime}ms`)
    }

    return NextResponse.json({
      success: true,
      message: 'Course removed from saved list',
      metadata: {
        user_id: user.id,
        course_id,
        response_time_ms: responseTime,
      },
    })
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    console.error('delete-course error:', error)

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
