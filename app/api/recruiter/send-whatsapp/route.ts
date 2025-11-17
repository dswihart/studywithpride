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
    
    const sendResult = await whatsappService.sendMessage({
      to: lead.phone,
      templateId,
      templateParams,
      text
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
    
    const { error: messageInsertError } = await supabase
      .from("whatsapp_messages")
      .insert({
        lead_id: leadId,
        message_id: sendResult.messageId,
        direction: "outbound",
        message_type: templateId ? "template" : "text",
        content: text || `Template: ${templateId}`,
        template_id: templateId,
        status: "sent",
        sent_by: roleCheck.user?.id,
        metadata: {
          template_params: templateParams,
          provider: sendResult.provider,
          response_time: sendResult.responseTime
        }
      })
    
    if (messageInsertError) {
      console.error("[send-whatsapp] Failed to save message to database:", messageInsertError)
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
