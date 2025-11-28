/**
 * Bulk WhatsApp Send Message API Endpoint
 * POST /api/recruiter/bulk-send-whatsapp
 */

import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth/role-guard"
import { createWhatsAppService } from "@/lib/whatsapp/messaging-service"
import { updateLeadStatusAfterWhatsApp } from "@/lib/db/utils/update-lead-status"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { getTemplate, expandTemplate } from "@/lib/whatsapp/templates"

interface BulkSendRequest {
  leadIds: string[]
  templateId: string
  paramOverrides?: Record<string, string[]>
}

interface SendResult {
  leadId: string
  leadName: string | null
  success: boolean
  messageId?: string
  error?: string
}

interface BulkSendResponse {
  success: boolean
  data?: {
    totalRequested: number
    totalSent: number
    totalFailed: number
    results: SendResult[]
  }
  error?: string
}

const SEND_DELAY_MS = 100

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const roleCheck = await requireRole("recruiter")

    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || "Forbidden" } as BulkSendResponse,
        { status: 403 }
      )
    }

    const body: BulkSendRequest = await request.json()
    const { leadIds, templateId, paramOverrides } = body

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "leadIds array is required and must not be empty" } as BulkSendResponse,
        { status: 400 }
      )
    }

    if (leadIds.length > 100) {
      return NextResponse.json(
        { success: false, error: "Maximum 100 leads per bulk send" } as BulkSendResponse,
        { status: 400 }
      )
    }

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: "templateId is required for bulk sending" } as BulkSendResponse,
        { status: 400 }
      )
    }

    const template = getTemplate(templateId)
    if (!template) {
      return NextResponse.json(
        { success: false, error: `Template not found: ${templateId}` } as BulkSendResponse,
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("id, prospect_name, prospect_email, phone, phone_valid, contact_status, country")
      .in("id", leadIds)

    if (leadsError || !leads) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch leads" } as BulkSendResponse,
        { status: 500 }
      )
    }

    const whatsappService = createWhatsAppService()
    const results: SendResult[] = []
    let totalSent = 0
    let totalFailed = 0

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const serviceClient = supabaseUrl && supabaseServiceKey
      ? createServiceClient(supabaseUrl, supabaseServiceKey)
      : null

    for (const lead of leads) {
      if (!lead.phone || !lead.phone_valid) {
        results.push({
          leadId: lead.id,
          leadName: lead.prospect_name,
          success: false,
          error: "Invalid or missing phone number"
        })
        totalFailed++
        continue
      }

      try {
        const defaultParams = [lead.prospect_name || "there"]
        if (template.params >= 2) {
          defaultParams.push(lead.country || "your country")
        }

        const templateParams = paramOverrides?.[lead.id] || defaultParams

        const sendResult = await whatsappService.sendMessage({
          to: lead.phone,
          templateId: template.whatsappTemplateName,
          templateParams,
          languageCode: template.languageCode,
          headerImageUrl: template.headerImageUrl
        })

        if (!sendResult.success) {
          results.push({
            leadId: lead.id,
            leadName: lead.prospect_name,
            success: false,
            error: sendResult.error || "Send failed"
          })
          totalFailed++
        } else {
          await updateLeadStatusAfterWhatsApp({
            leadId: lead.id,
            messageId: sendResult.messageId!,
            sentBy: roleCheck.user?.id!
          })

          if (serviceClient) {
            const contentToSave = expandTemplate(template.body, templateParams)
            await serviceClient.from("whatsapp_messages").insert({
              lead_id: lead.id,
              message_id: sendResult.messageId,
              direction: "outbound",
              message_type: "template",
              content: contentToSave,
              template_id: templateId,
              status: "sent",
              sent_by: roleCheck.user?.id,
              metadata: {
                template_params: templateParams,
                bulk_send: true,
                languageCode: template.languageCode
              }
            })
          }

          results.push({
            leadId: lead.id,
            leadName: lead.prospect_name,
            success: true,
            messageId: sendResult.messageId
          })
          totalSent++
        }

        await delay(SEND_DELAY_MS)

      } catch (err: any) {
        results.push({
          leadId: lead.id,
          leadName: lead.prospect_name,
          success: false,
          error: err.message || "Unknown error"
        })
        totalFailed++
      }
    }

    const foundLeadIds = new Set(leads.map(l => l.id))
    for (const leadId of leadIds) {
      if (!foundLeadIds.has(leadId)) {
        results.push({
          leadId,
          leadName: null,
          success: false,
          error: "Lead not found"
        })
        totalFailed++
      }
    }

    const totalTime = Date.now() - startTime
    console.log(`[bulk-send-whatsapp] Completed: ${totalSent} sent, ${totalFailed} failed in ${totalTime}ms`)

    return NextResponse.json(
      {
        success: true,
        data: {
          totalRequested: leadIds.length,
          totalSent,
          totalFailed,
          results
        }
      } as BulkSendResponse,
      { status: 200 }
    )

  } catch (error: any) {
    console.error("[bulk-send-whatsapp] Exception:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" } as BulkSendResponse,
      { status: 500 }
    )
  }
}
