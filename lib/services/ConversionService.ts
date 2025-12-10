/**
 * Conversion Service
 *
 * Handles lead-to-student conversion business logic:
 * - Creating student accounts
 * - Linking leads to student profiles
 * - Managing conversion workflow
 *
 * Story: Lead Conversion Workflow
 */

import { getAdminClient } from "@/lib/supabase/admin"
import { LeadService } from "./LeadService"
import { ServiceResult, ConversionRequest, ConversionResult, Lead } from "./types"

export class ConversionService {
  /**
   * Convert a lead to a student account
   *
   * Steps:
   * 1. Validate lead exists and has email
   * 2. Check if already converted
   * 3. Check for existing user with email
   * 4. Create auth user if needed
   * 5. Create/update user profile
   * 6. Update lead with conversion data
   * 7. Log conversion in contact history
   */
  static async convertLeadToStudent(
    request: ConversionRequest
  ): Promise<ServiceResult<ConversionResult>> {
    const { leadId, intakePeriod, readinessComments } = request
    const adminClient = getAdminClient()

    try {
      // 1. Get lead data
      const leadResult = await LeadService.getLeadByIdAdmin(leadId)
      if (!leadResult.success || !leadResult.data) {
        return { success: false, error: "Lead not found", code: "NOT_FOUND" }
      }

      const lead = leadResult.data

      // 2. Check if already converted
      if (lead.student_user_id) {
        return {
          success: true,
          data: {
            studentUserId: lead.student_user_id,
            alreadyExisted: true,
            message: "Lead already converted to student"
          }
        }
      }

      // 3. Validate email
      const email = lead.prospect_email?.toLowerCase()?.trim()
      if (!email) {
        return {
          success: false,
          error: "Lead has no email address",
          code: "MISSING_EMAIL"
        }
      }

      // 4. Check for existing user
      const { data: existingUsers } = await adminClient
        .from("user_profiles")
        .select("id, email")
        .eq("email", email)
        .limit(1)

      let studentUserId: string
      let alreadyExisted = false

      if (existingUsers && existingUsers.length > 0) {
        // Link to existing account
        studentUserId = existingUsers[0].id
        alreadyExisted = true

        await this.updateExistingUserProfile(adminClient, studentUserId, lead, leadId)
      } else {
        // Create new student account
        const createResult = await this.createNewStudentAccount(
          adminClient,
          lead,
          leadId,
          intakePeriod,
          readinessComments
        )

        if (!createResult.success) {
          return createResult
        }

        studentUserId = createResult.data!.studentUserId
      }

      // 5. Update lead with conversion data
      const updateResult = await this.markLeadAsConverted(
        adminClient,
        leadId,
        studentUserId
      )

      if (!updateResult.success) {
        return {
          success: false,
          error: updateResult.error,
          code: updateResult.code
        }
      }

      // 6. Log conversion
      await this.logConversion(adminClient, leadId, studentUserId)

      return {
        success: true,
        data: {
          studentUserId,
          alreadyExisted,
          message: alreadyExisted
            ? "Lead linked to existing student account"
            : "Student account created successfully"
        }
      }
    } catch (error: any) {
      console.error("[ConversionService.convertLeadToStudent] Exception:", error)
      return {
        success: false,
        error: "Internal server error",
        code: "EXCEPTION"
      }
    }
  }

  /**
   * Update existing user profile with CRM data
   */
  private static async updateExistingUserProfile(
    adminClient: any,
    userId: string,
    lead: Lead,
    leadId: string
  ): Promise<void> {
    await adminClient.from("user_profiles").update({
      crm_lead_id: leadId,
      full_name: lead.prospect_name || userId,
      country_of_origin: lead.country || null,
      phone_number: lead.phone || null,
      updated_at: new Date().toISOString()
    }).eq("id", userId)
  }

  /**
   * Create a new student account
   */
  private static async createNewStudentAccount(
    adminClient: any,
    lead: Lead,
    leadId: string,
    intakePeriod?: string,
    readinessComments?: string
  ): Promise<ServiceResult<ConversionResult>> {
    const email = lead.prospect_email!.toLowerCase().trim()

    // Generate temporary password
    const tempPassword = `Welcome${Date.now().toString(36)}!`

    // Create auth user
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: lead.prospect_name,
        source: "crm_conversion",
        crm_lead_id: leadId,
        role: "student"
      }
    })

    if (authError || !authUser.user) {
      console.error("[ConversionService] Auth creation error:", authError)
      return {
        success: false,
        error: authError?.message || "Failed to create user account",
        code: "AUTH_ERROR"
      }
    }

    const studentUserId = authUser.user.id

    // Create user profile
    const { error: profileError } = await adminClient.from("user_profiles").insert({
      id: studentUserId,
      email,
      full_name: lead.prospect_name || null,
      country_of_origin: lead.country || null,
      phone_number: lead.phone || null,
      preferred_language: "en",
      crm_lead_id: leadId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    if (profileError) {
      console.error("[ConversionService] Profile creation error:", profileError)
      // Don't fail - auth user was created
    }

    // Create initial application state
    try {
      await adminClient.from("application_state").insert({
        user_id: studentUserId,
        intake_term: intakePeriod || null,
        application_status: "draft",
        visa_status: "not_started",
        checklist_progress: {},
        documents_uploaded: [],
        notes: readinessComments || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    } catch {
      // Application state table may not exist - not critical
      console.log("[ConversionService] Application state not created (table may not exist)")
    }

    return {
      success: true,
      data: {
        studentUserId,
        alreadyExisted: false,
        message: "Student account created successfully"
      }
    }
  }

  /**
   * Mark lead as converted
   */
  private static async markLeadAsConverted(
    adminClient: any,
    leadId: string,
    studentUserId: string
  ): Promise<ServiceResult<void>> {
    const { error } = await adminClient.from("leads").update({
      contact_status: "converted",
      student_user_id: studentUserId,
      converted_at: new Date().toISOString(),
      conversion_source: "Ready to Proceed Automation"
    }).eq("id", leadId)

    if (error) {
      console.error("[ConversionService] Lead update error:", error)
      return {
        success: false,
        error: "Failed to update lead status",
        code: "DB_ERROR"
      }
    }

    return { success: true }
  }

  /**
   * Log conversion in contact history
   */
  private static async logConversion(
    adminClient: any,
    leadId: string,
    studentUserId: string
  ): Promise<void> {
    await adminClient.from("contact_history").insert({
      lead_id: leadId,
      contact_type: "system",
      outcome: "Converted to Student",
      notes: `Lead converted to student portal account. User ID: ${studentUserId}`,
      follow_up_action: null,
      ready_to_proceed: true,
      contacted_at: new Date().toISOString()
    })
  }

  /**
   * Check conversion status for a lead
   */
  static async getConversionStatus(
    leadId: string
  ): Promise<ServiceResult<{
    isConverted: boolean
    studentUserId: string | null
    convertedAt: string | null
    conversionSource: string | null
  }>> {
    try {
      const adminClient = getAdminClient()

      const { data: lead, error } = await adminClient
        .from("leads")
        .select("id, student_user_id, converted_at, conversion_source, contact_status")
        .eq("id", leadId)
        .single()

      if (error || !lead) {
        return { success: false, error: "Lead not found", code: "NOT_FOUND" }
      }

      return {
        success: true,
        data: {
          isConverted: lead.contact_status === "converted",
          studentUserId: lead.student_user_id,
          convertedAt: lead.converted_at,
          conversionSource: lead.conversion_source
        }
      }
    } catch (error: any) {
      console.error("[ConversionService.getConversionStatus] Exception:", error)
      return { success: false, error: error.message, code: "EXCEPTION" }
    }
  }
}
