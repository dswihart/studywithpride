/**
 * Contact Service
 *
 * Handles contact logging and communication tracking:
 * - Contact history management
 * - Follow-up scheduling
 * - Funnel stage updates based on checklist
 *
 * Story: Contact Logging Workflow
 */

import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { ServiceResult, ContactLogEntry } from "./types"
import { LeadService } from "./LeadService"

export interface ContactHistoryRecord {
  id: string
  lead_id: string
  contact_type: string
  outcome: string
  notes: string | null
  follow_up_action: string | null
  follow_up_date: string | null
  ready_to_proceed: boolean | null
  interested: boolean | null
  has_education_docs: boolean | null
  has_funds: boolean | null
  contacted_at: string
  created_at: string
}

export class ContactService {
  /**
   * Log a contact with a lead
   */
  static async logContact(
    entry: ContactLogEntry
  ): Promise<ServiceResult<ContactHistoryRecord>> {
    try {
      const supabase = await createClient()

      // Validate lead exists
      const leadResult = await LeadService.getLeadById(entry.leadId)
      if (!leadResult.success) {
        return { success: false, error: "Lead not found", code: "NOT_FOUND" }
      }

      // Insert contact history record
      const { data: record, error } = await supabase
        .from("contact_history")
        .insert({
          lead_id: entry.leadId,
          contact_type: entry.contactType,
          outcome: entry.outcome,
          notes: entry.notes || null,
          follow_up_action: entry.followUpAction || null,
          follow_up_date: entry.followUpDate || null,
          ready_to_proceed: entry.readyToProceed || false,
          interested: entry.interested || false,
          has_education_docs: entry.hasEducationDocs || false,
          has_funds: entry.hasFunds || false,
          contacted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error("[ContactService.logContact] Error:", error)
        return { success: false, error: "Failed to log contact", code: "DB_ERROR" }
      }

      // Update lead's last contact date and funnel stage
      await this.updateLeadFromContact(entry)

      return { success: true, data: record }
    } catch (error: any) {
      console.error("[ContactService.logContact] Exception:", error)
      return { success: false, error: error.message, code: "EXCEPTION" }
    }
  }

  /**
   * Get contact history for a lead
   */
  static async getContactHistory(
    leadId: string,
    limit: number = 50
  ): Promise<ServiceResult<ContactHistoryRecord[]>> {
    try {
      const supabase = await createClient()

      const { data: records, error } = await supabase
        .from("contact_history")
        .select("*")
        .eq("lead_id", leadId)
        .order("contacted_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("[ContactService.getContactHistory] Error:", error)
        return { success: false, error: "Failed to fetch contact history", code: "DB_ERROR" }
      }

      return { success: true, data: records || [] }
    } catch (error: any) {
      console.error("[ContactService.getContactHistory] Exception:", error)
      return { success: false, error: error.message, code: "EXCEPTION" }
    }
  }

  /**
   * Get pending follow-ups for recruiter
   */
  static async getPendingFollowUps(
    daysAhead: number = 7
  ): Promise<ServiceResult<ContactHistoryRecord[]>> {
    try {
      const supabase = await createClient()
      const today = new Date()
      const futureDate = new Date(today)
      futureDate.setDate(futureDate.getDate() + daysAhead)

      const { data: records, error } = await supabase
        .from("contact_history")
        .select("*, leads!inner(prospect_name, prospect_email, phone)")
        .not("follow_up_date", "is", null)
        .gte("follow_up_date", today.toISOString().split("T")[0])
        .lte("follow_up_date", futureDate.toISOString().split("T")[0])
        .order("follow_up_date", { ascending: true })

      if (error) {
        console.error("[ContactService.getPendingFollowUps] Error:", error)
        return { success: false, error: "Failed to fetch follow-ups", code: "DB_ERROR" }
      }

      return { success: true, data: records || [] }
    } catch (error: any) {
      console.error("[ContactService.getPendingFollowUps] Exception:", error)
      return { success: false, error: error.message, code: "EXCEPTION" }
    }
  }

  /**
   * Update lead data based on contact log checklist
   */
  private static async updateLeadFromContact(
    entry: ContactLogEntry
  ): Promise<void> {
    try {
      const supabase = await createClient()

      // Calculate funnel stage based on checklist
      const funnelStage = this.calculateFunnelStage(entry)

      // Determine contact status based on outcome
      let contactStatus: string | undefined
      if (entry.readyToProceed) {
        contactStatus = "ready_to_proceed"
      } else if (entry.interested) {
        contactStatus = "interested"
      }

      // Build update object
      const updates: Record<string, any> = {
        last_contact_date: new Date().toISOString(),
        funnel_stage: funnelStage
      }

      if (contactStatus) {
        updates.contact_status = contactStatus
      }

      await supabase
        .from("leads")
        .update(updates)
        .eq("id", entry.leadId)
    } catch (error) {
      console.error("[ContactService.updateLeadFromContact] Error:", error)
      // Non-critical, don't throw
    }
  }

  /**
   * Calculate funnel stage from checklist fields
   * Stage 1: Interested
   * Stage 2: Has Education Docs
   * Stage 3: Ready to Proceed (English verified)
   * Stage 4: Has Funds
   */
  private static calculateFunnelStage(entry: ContactLogEntry): number {
    if (entry.hasFunds) return 4
    if (entry.readyToProceed) return 3
    if (entry.hasEducationDocs) return 2
    if (entry.interested) return 1
    return 1 // Default to stage 1
  }

  /**
   * Get recent activity across all leads
   */
  static async getRecentActivity(
    limit: number = 20
  ): Promise<ServiceResult<ContactHistoryRecord[]>> {
    try {
      const supabase = await createClient()

      const { data: records, error } = await supabase
        .from("contact_history")
        .select("*, leads!inner(prospect_name, prospect_email)")
        .order("contacted_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("[ContactService.getRecentActivity] Error:", error)
        return { success: false, error: "Failed to fetch recent activity", code: "DB_ERROR" }
      }

      return { success: true, data: records || [] }
    } catch (error: any) {
      console.error("[ContactService.getRecentActivity] Exception:", error)
      return { success: false, error: error.message, code: "EXCEPTION" }
    }
  }
}
