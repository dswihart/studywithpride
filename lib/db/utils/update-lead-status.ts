/**
 * Database Utility: Update Lead Status After WhatsApp Message
 * 
 * Automatically updates lead status to "contacted" after WhatsApp message is sent
 * Also updates last_contact_date (WhatsApp messages are tracked separately in whatsapp_messages table)
 * 
 * Performance target: <150ms
 */

import { createClient } from "@supabase/supabase-js"

export interface UpdateLeadStatusParams {
  leadId: string
  messageId: string
  sentBy: string // User ID of recruiter who sent the message
}

export interface UpdateLeadStatusResult {
  success: boolean
  leadId?: string
  previousStatus?: string
  newStatus?: string
  error?: string
  elapsedTime?: number
}

/**
 * Update lead status after WhatsApp message is sent
 */
export async function updateLeadStatusAfterWhatsApp(
  params: UpdateLeadStatusParams
): Promise<UpdateLeadStatusResult> {
  const startTime = Date.now()
  
  try {
    // Create Supabase client using service role for admin access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        success: false,
        error: "Supabase configuration missing",
        elapsedTime: Date.now() - startTime
      }
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // First, get the current lead to know the previous status
    const { data: lead, error: fetchError } = await supabase
      .from("leads")
      .select("contact_status")
      .eq("id", params.leadId)
      .single()
    
    if (fetchError || !lead) {
      return {
        success: false,
        error: fetchError?.message || "Lead not found",
        elapsedTime: Date.now() - startTime
      }
    }
    
    const previousStatus = lead.contact_status
    
    // Update the lead - WhatsApp messages are tracked in whatsapp_messages table, not in notes
    const { error: updateError } = await supabase
      .from("leads")
      .update({
        contact_status: "contacted",
        last_contact_date: new Date().toISOString()
      })
      .eq("id", params.leadId)
    
    if (updateError) {
      return {
        success: false,
        error: updateError.message,
        elapsedTime: Date.now() - startTime
      }
    }
    
    const elapsedTime = Date.now() - startTime
    
    // Log performance warning if > 150ms
    if (elapsedTime > 150) {
      console.warn(`[updateLeadStatus] Slow database update: ${elapsedTime}ms (target: <150ms)`)
    }
    
    return {
      success: true,
      leadId: params.leadId,
      previousStatus,
      newStatus: "contacted",
      elapsedTime
    }
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error",
      elapsedTime: Date.now() - startTime
    }
  }
}
