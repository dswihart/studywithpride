/**
 * WhatsApp Send Message API Endpoint
 * POST /api/recruiter/send-whatsapp
 * 
 * Features:
 * - RBAC protection (recruiter/admin only)
 * - Template and text message support
 * - Automatic lead status updates
 * - Message history tracking
 * - Phone number validation
 */

import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth/role-guard"
import { createWhatsAppService } from "@/lib/whatsapp/messaging-service"
import { updateLeadStatusAfterWhatsApp } from "@/lib/db/utils/update-lead-status"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { getTemplate, expandTemplate } from "@/lib/whatsapp/templates"

interface SendWhatsAppRequest {
  leadId: string
  templateId?: string
  templateParams?: string[]
  text?: string
}

interface SendWhatsAppResponse {
  success: boolean
  data?: {
    messageId: string
    leadId: string
    contactStatus: string
    leadStatusUpdated: boolean
  }
  error?: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const roleCheck = await requireRole("recruiter")
    
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { 
          success: false, 
          error: roleCheck.reason || "Forbidden" 
        } as SendWhatsAppResponse,
        { status: 403 }
      )
    }
    
    const body: SendWhatsAppRequest = await request.json()
    const { leadId, templateId, templateParams, text } = body
    
    if (!leadId) {
      return NextResponse.json(
        { success: false, error: "leadId is required" } as SendWhatsAppResponse,
        { status: 400 }
      )
    }
    
    if (!templateId && !text) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Either templateId or text must be provided" 
        } as SendWhatsAppResponse,
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, prospect_name, prospect_email, phone, phone_valid, contact_status")
      .eq("id", leadId)
      .single()
    
    if (leadError || !lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" } as SendWhatsAppResponse,
        { status: 404 }
      )
    }
    
    if (!lead.phone) {
      return NextResponse.json(
        { success: false, error: "Lead has no phone number" } as SendWhatsAppResponse,
        { status: 400 }
      )
    }
    
    if (!lead.phone_valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Lead phone number is invalid or not in E.164 format" 
        } as SendWhatsAppResponse,
        { status: 400 }
      )
    }
    
    const whatsappService = createWhatsAppService()
    
    // Get template object and extract WhatsApp template name
    let whatsappTemplateName: string | undefined
    let languageCode: string | undefined
    if (templateId) {
      const template = getTemplate(templateId)
      if (!template) {
        return NextResponse.json(
          { success: false, error: `Template not found: ${templateId}` } as SendWhatsAppResponse,
          { status: 400 }
        )
      }
      whatsappTemplateName = template.whatsappTemplateName
      languageCode = template.languageCode
      
      console.log("[send-whatsapp] Using template:", {
        internalId: templateId,
        whatsappName: whatsappTemplateName,
        language: languageCode
      })
    }
    
    const sendResult = await whatsappService.sendMessage({
      to: lead.phone,
      templateId: whatsappTemplateName,
      templateParams,
      text,
      languageCode
    })
    
    if (!sendResult.success) {
      console.error("[send-whatsapp] Failed to send:", sendResult.error)
      return NextResponse.json(
        { 
          success: false, 
          error: sendResult.error || "Failed to send WhatsApp message" 
        } as SendWhatsAppResponse,
        { status: 500 }
      )
    }
    
    const updateResult = await updateLeadStatusAfterWhatsApp({
      leadId: lead.id,
      messageId: sendResult.messageId!,
      sentBy: roleCheck.user?.id!
    })
    
    if (!updateResult.success) {
      console.warn("[send-whatsapp] Message sent but lead status update failed:", updateResult.error)
    }
    
    // Determine the content to save
    let contentToSave = text || ""
    if (templateId && templateParams) {
      const template = getTemplate(templateId)
      if (template) {
        contentToSave = expandTemplate(template.body, templateParams)
      } else {
        contentToSave = `Template: ${templateId}`
      }
    }
    
    // Use service role client to bypass RLS for saving message history
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[send-whatsapp] Supabase configuration missing - cannot save message history")
    } else {
      try {
        const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey)
        
        console.log("[send-whatsapp] Attempting to save message to database:", {
          lead_id: leadId,
          message_id: sendResult.messageId,
          direction: "outbound",
          message_type: templateId ? "template" : "text",
          template_id: templateId,
          sent_by: roleCheck.user?.id,
          content_preview: contentToSave.substring(0, 50) + "..."
        })
        
        const { data: insertedMessage, error: messageInsertError } = await serviceClient
          .from("whatsapp_messages")
          .insert({
            lead_id: leadId,
            message_id: sendResult.messageId,
            direction: "outbound",
            message_type: templateId ? "template" : "text",
            content: contentToSave,
            template_id: templateId,
            status: "sent",
            sent_by: roleCheck.user?.id,
            metadata: {
              template_params: templateParams,
              provider: sendResult.provider,
              response_time: sendResult.responseTime
            }
          })
          .select()
        
        if (messageInsertError) {
          console.error("[send-whatsapp] Failed to save message to database:", {
            error: messageInsertError,
            message: messageInsertError.message,
            code: messageInsertError.code,
            details: messageInsertError.details,
            hint: messageInsertError.hint
          })
        } else {
          console.log("[send-whatsapp] Message saved successfully:", insertedMessage)
        }
      } catch (dbError: any) {
        console.error("[send-whatsapp] Exception while saving message:", dbError)
      }
    }
    
    const totalTime = Date.now() - startTime
    
    if (totalTime > 500) {
      console.warn(`[send-whatsapp] Slow API response: ${totalTime}ms (target: <500ms)`)
    }
    
    return NextResponse.json(
      {
        success: true,
        data: {
          messageId: sendResult.messageId!,
          leadId: lead.id,
          contactStatus: "contacted",
          leadStatusUpdated: updateResult.success
        }
      } as SendWhatsAppResponse,
      { status: 200 }
    )
    
  } catch (error: any) {
    console.error("[send-whatsapp] Exception:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error" 
      } as SendWhatsAppResponse,
      { status: 500 }
    )
  }
}
