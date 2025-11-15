import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/role-guard'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppTemplateMessage } from '@/src/services/messaging-service'
import { updateLeadContactStatus } from '@/src/db/utils/update-lead-status'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const roleCheck = await requireRole('recruiter')

    if (!roleCheck.authorized) {
      return NextResponse.json({ success: false, error: roleCheck.reason || 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { lead_id: leadId, template_id: templateId } = body || {}

    if (!leadId || typeof leadId !== 'string' || !templateId || typeof templateId !== 'string') {
      return NextResponse.json({ success: false, error: 'lead_id and template_id are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, prospect_name, prospect_email, phone')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    if (!lead.phone) {
      return NextResponse.json({ success: false, error: 'Lead does not have a phone number' }, { status: 400 })
    }

    await sendWhatsAppTemplateMessage({
      phoneNumber: lead.phone,
      templateId,
      variables: {
        name: lead.prospect_name || 'Student',
        email: lead.prospect_email || '',
      },
    })

    await updateLeadContactStatus(lead.id, 'contacted')

    const elapsedTime = Date.now() - startTime
    if (elapsedTime > 250) {
      console.warn(`[send-whatsapp] Execution ${elapsedTime}ms exceeded 250ms target`)
    }

    return NextResponse.json({ success: true, metadata: { leadId, templateId, elapsedTime } })
  } catch (error: any) {
    console.error('[send-whatsapp] Error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to send message' }, { status: 500 })
  }
}
