import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { application_id } = body

    if (!application_id) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Delete the application (only if it belongs to the user)
    const { error: deleteError } = await supabase
      .from('application_states')
      .delete()
      .eq('id', application_id)
      .eq('user_id', user.id) // Ensure user can only delete their own applications

    if (deleteError) {
      console.error('Error deleting application:', deleteError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete application' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'University application deleted successfully'
    })

  } catch (error) {
    console.error('Error in delete-university API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
