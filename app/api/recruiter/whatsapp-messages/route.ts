import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch messages for this lead
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('sent_at', { ascending: true })

    if (error) {
      console.error('Error fetching WhatsApp messages:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch messages', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
