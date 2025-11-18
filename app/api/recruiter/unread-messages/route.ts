import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/recruiter/unread-messages
 * Returns count of inbound WhatsApp messages per lead
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get all inbound messages grouped by lead
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('lead_id')
      .eq('direction', 'inbound')

    if (error) {
      console.error('Error fetching message counts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Count messages per lead
    const counts: Record<string, number> = {}
    messages?.forEach((msg: any) => {
      counts[msg.lead_id] = (counts[msg.lead_id] || 0) + 1
    })

    return NextResponse.json({ counts })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
