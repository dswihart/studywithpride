/**
 * API Route: Task Management for Lead Follow-ups
 * GET /api/recruiter/tasks - List tasks (also searches contact logs)
 * POST /api/recruiter/tasks - Create task
 * PUT /api/recruiter/tasks - Update task
 * DELETE /api/recruiter/tasks - Delete task
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { requireRole } from '@/lib/auth/role-guard'

interface Task {
  id: string
  lead_id: string | null
  title: string
  description: string | null
  task_type: string
  priority: string
  status: string
  due_date: string | null
  completed_at: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

interface ContactLog {
  id: string
  lead_id: string
  contact_type: string
  outcome: string | null
  notes: string | null
  contacted_at: string
  leads?: {
    id: string
    prospect_name: string | null
    prospect_email: string | null
    phone: string | null
  } | null
}

// Create Supabase client with service role key (bypasses RLS)
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing')
  }

  return createServiceClient(supabaseUrl, supabaseServiceKey)
}

// GET - List tasks with optional filters, also searches contact logs
export async function GET(request: NextRequest) {
  try {
    const roleCheck = await requireRole('recruiter')
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const leadId = searchParams.get('lead_id')
    const dueToday = searchParams.get('due_today')
    const overdue = searchParams.get('overdue')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('tasks')
      .select(`
        *,
        leads (
          id,
          prospect_name,
          prospect_email,
          phone
        )
      `)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })
      .limit(limit)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }

    if (leadId) {
      query = query.eq('lead_id', leadId)
    }

    if (dueToday === 'true') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      query = query.gte('due_date', today.toISOString()).lt('due_date', tomorrow.toISOString())
    }

    if (overdue === 'true') {
      const now = new Date().toISOString()
      query = query.lt('due_date', now).neq('status', 'completed').neq('status', 'cancelled')
    }

    // Search in title and description
    if (search && search.trim()) {
      const searchTerm = search.trim()
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    const { data: tasksData, error: tasksError } = await query

    if (tasksError) {
      console.error('[tasks] GET error:', tasksError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    // If searching, also search contact logs
    let contactLogs: ContactLog[] = []
    if (search && search.trim()) {
      const searchTerm = search.trim()
      const { data: logsData, error: logsError } = await supabase
        .from('contact_history')
        .select(`
          id,
          lead_id,
          contact_type,
          outcome,
          notes,
          contacted_at,
          readiness_comments,
          leads (
            id,
            prospect_name,
            prospect_email,
            phone
          )
        `)
        .or(`notes.ilike.%${searchTerm}%,outcome.ilike.%${searchTerm}%,readiness_comments.ilike.%${searchTerm}%`)
        .order('contacted_at', { ascending: false })
        .limit(50)

      if (!logsError && logsData) {
        contactLogs = logsData as unknown as ContactLog[]
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        tasks: tasksData || [],
        contactLogs: contactLogs,
        count: (tasksData?.length || 0) + contactLogs.length
      }
    })
  } catch (error) {
    console.error('[tasks] GET exception:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    const roleCheck = await requireRole('recruiter')
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { lead_id, title, description, task_type, priority, due_date } = body

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const taskData = {
      lead_id: lead_id || null,
      title: title.trim(),
      description: description?.trim() || null,
      task_type: task_type || 'follow_up',
      priority: priority || 'medium',
      status: 'pending',
      due_date: due_date || null,
      created_by: roleCheck.user?.id || null
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select(`
        *,
        leads (
          id,
          prospect_name,
          prospect_email,
          phone
        )
      `)
      .single()

    if (error) {
      console.error('[tasks] POST error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create task' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { task: data }
    })
  } catch (error) {
    console.error('[tasks] POST exception:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update a task
export async function PUT(request: NextRequest) {
  try {
    const roleCheck = await requireRole('recruiter')
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, title, description, task_type, priority, status, due_date } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const updateData: Record<string, any> = {}

    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (task_type !== undefined) updateData.task_type = task_type
    if (priority !== undefined) updateData.priority = priority
    if (status !== undefined) {
      updateData.status = status
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      } else {
        updateData.completed_at = null
      }
    }
    if (due_date !== undefined) updateData.due_date = due_date

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        leads (
          id,
          prospect_name,
          prospect_email,
          phone
        )
      `)
      .single()

    if (error) {
      console.error('[tasks] PUT error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update task' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { task: data }
    })
  } catch (error) {
    console.error('[tasks] PUT exception:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const roleCheck = await requireRole('recruiter')
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[tasks] DELETE error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete task' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { deleted: id }
    })
  } catch (error) {
    console.error('[tasks] DELETE exception:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
