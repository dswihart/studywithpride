import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { requireRole } from '@/lib/auth/role-guard'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const roleCheck = await requireRole('recruiter')
    if (!roleCheck.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[whatsapp-messages] Supabase configuration missing')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey)

    console.log('[whatsapp-messages] Fetching messages for lead:', leadId)

    // Fetch messages for this lead
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('sent_at', { ascending: true })

    if (error) {
      console.error('[whatsapp-messages] Error fetching messages:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch messages', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    console.log(`[whatsapp-messages] Found ${messages?.length || 0} messages for lead ${leadId}`)

    return NextResponse.json({ messages: messages || [] })
  } catch (error: any) {
    console.error('[whatsapp-messages] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
