import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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
    const {
      university_id,
      university_name,
      program_name,
      intake_term,
      application_status
    } = body

    if (!university_id || !university_name) {
      return NextResponse.json(
        { success: false, error: 'University ID and name are required' },
        { status: 400 }
      )
    }

    // Check if application already exists for this user and university
    const { data: existing, error: checkError } = await supabase
      .from('application_states')
      .select('id, university_name')
      .eq('user_id', user.id)
      .eq('university_name', university_name)
      .maybeSingle()

    if (existing) {
      // Application already exists, return it instead of creating new
      return NextResponse.json({
        success: true,
        data: existing,
        message: 'Application already exists for this university',
        existing: true
      })
    }

    // Create new application entry with proper UUID
    const newApplication = {
      id: randomUUID(),
      user_id: user.id,
      university_name,
      program_name: program_name || '',
      intake_term: intake_term || 'Fall 2025',
      application_status: application_status || 'draft',
      documents_uploaded: [],
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Insert into application_states table
    const { data, error } = await supabase
      .from('application_states')
      .insert([newApplication])
      .select()
      .single()

    if (error) {
      console.error('Error creating application:', error)
      
      // Check for duplicate key error
      if (error.message?.includes('duplicate key') || error.code === '23505') {
        // Fetch the existing application
        const { data: existingApp } = await supabase
          .from('application_states')
          .select('id, university_name')
          .eq('user_id', user.id)
          .eq('university_name', university_name)
          .single()
        
        if (existingApp) {
          return NextResponse.json({
            success: true,
            data: existingApp,
            message: 'Application already exists for this university',
            existing: true
          })
        }
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to create application' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'University application created successfully'
    })

  } catch (error) {
    console.error('Error in add-university API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
