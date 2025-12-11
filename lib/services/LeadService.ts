/**
 * Lead Service
 *
 * Handles all lead-related business logic:
 * - CRUD operations
 * - Filtering and search
 * - Status updates
 * - Funnel stage management
 *
 * Story: 5.1-B - Secure Lead Read API
 */

import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import {
  ServiceResult,
  PaginatedResult,
  PaginationParams,
  LeadFilters,
  Lead,
  LeadUpdate
} from "./types"

// UUID validation helper
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export class LeadService {
  /**
   * Get paginated leads with filters
   */
  static async getLeads(
    filters: LeadFilters = {},
    pagination: PaginationParams = {}
  ): Promise<ServiceResult<PaginatedResult<Lead>>> {
    try {
      const supabase = await createClient()
      const { limit = 100, offset = 0 } = pagination
      const { country, contactStatus, search, includeArchived } = filters

      let query = supabase.from("leads").select("*", { count: "exact" })

      // Search filter - check first if searching by UUID
      const searchTerm = search?.trim()
      const isIdSearch = searchTerm && isUUID(searchTerm)

      // Exclude archived unless requested OR searching by ID (always show lead by ID)
      if (!includeArchived && !isIdSearch) {
        query = query.not("contact_status", "in", "(archived,archived_referral,unqualified,notinterested,wrongnumber)")
      }

      // Search filter
      if (searchTerm) {
        if (isIdSearch) {
          query = query.eq("id", searchTerm)
        } else {
          query = query.or(
            `prospect_name.ilike.%${searchTerm}%,prospect_email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
          )
        }
      }

      // Country filter
      if (country && country !== "all") {
        query = query.eq("country", country)
      }

      // Status filter
      if (contactStatus && contactStatus !== "all") {
        query = query.eq("contact_status", contactStatus)
      }

      // Funnel stage filter
      if (filters.funnelStage) {
        query = query.eq("funnel_stage", filters.funnelStage)
      }

      // Lead quality filter
      if (filters.leadQuality && filters.leadQuality !== "all") {
        query = query.eq("lead_quality", filters.leadQuality)
      }

      // Date range filters
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo)
      }

      // Needs followup filter
      if (filters.needsFollowup === true) {
        query = query.eq("needs_followup", true)
      }

      // Pagination and ordering
      query = query
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false })

      const { data: leads, error, count } = await query

      if (error) {
        console.error("[LeadService.getLeads] Error:", error)
        return { success: false, error: "Failed to fetch leads", code: "DB_ERROR" }
      }

      return {
        success: true,
        data: {
          items: leads || [],
          total: count || 0,
          filtered: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        }
      }
    } catch (error: any) {
      console.error("[LeadService.getLeads] Exception:", error)
      return { success: false, error: error.message, code: "EXCEPTION" }
    }
  }

  /**
   * Get a single lead by ID
   */
  static async getLeadById(id: string): Promise<ServiceResult<Lead>> {
    try {
      if (!isUUID(id)) {
        return { success: false, error: "Invalid lead ID format", code: "INVALID_ID" }
      }

      const supabase = await createClient()
      const { data: lead, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !lead) {
        return { success: false, error: "Lead not found", code: "NOT_FOUND" }
      }

      return { success: true, data: lead }
    } catch (error: any) {
      console.error("[LeadService.getLeadById] Exception:", error)
      return { success: false, error: error.message, code: "EXCEPTION" }
    }
  }

  /**
   * Get lead by ID using admin client (bypasses RLS)
   */
  static async getLeadByIdAdmin(id: string): Promise<ServiceResult<Lead>> {
    try {
      if (!isUUID(id)) {
        return { success: false, error: "Invalid lead ID format", code: "INVALID_ID" }
      }

      const adminClient = getAdminClient()
      const { data: lead, error } = await adminClient
        .from("leads")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !lead) {
        return { success: false, error: "Lead not found", code: "NOT_FOUND" }
      }

      return { success: true, data: lead }
    } catch (error: any) {
      console.error("[LeadService.getLeadByIdAdmin] Exception:", error)
      return { success: false, error: error.message, code: "EXCEPTION" }
    }
  }

  /**
   * Update a lead
   */
  static async updateLead(id: string, updates: LeadUpdate): Promise<ServiceResult<Lead>> {
    try {
      if (!isUUID(id)) {
        return { success: false, error: "Invalid lead ID format", code: "INVALID_ID" }
      }

      const supabase = await createClient()
      const { data: lead, error } = await supabase
        .from("leads")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("[LeadService.updateLead] Error:", error)
        return { success: false, error: "Failed to update lead", code: "DB_ERROR" }
      }

      return { success: true, data: lead }
    } catch (error: any) {
      console.error("[LeadService.updateLead] Exception:", error)
      return { success: false, error: error.message, code: "EXCEPTION" }
    }
  }

  /**
   * Update lead using admin client
   */
  static async updateLeadAdmin(id: string, updates: Record<string, any>): Promise<ServiceResult<Lead>> {
    try {
      if (!isUUID(id)) {
        return { success: false, error: "Invalid lead ID format", code: "INVALID_ID" }
      }

      const adminClient = getAdminClient()
      const { data: lead, error } = await adminClient
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("[LeadService.updateLeadAdmin] Error:", error)
        return { success: false, error: "Failed to update lead", code: "DB_ERROR" }
      }

      return { success: true, data: lead }
    } catch (error: any) {
      console.error("[LeadService.updateLeadAdmin] Exception:", error)
      return { success: false, error: error.message, code: "EXCEPTION" }
    }
  }

  /**
   * Bulk update leads
   */
  static async bulkUpdateLeads(
    ids: string[],
    updates: LeadUpdate
  ): Promise<ServiceResult<{ updated: number }>> {
    try {
      const invalidIds = ids.filter(id => !isUUID(id))
      if (invalidIds.length > 0) {
        return { success: false, error: "Invalid lead IDs", code: "INVALID_ID" }
      }

      const supabase = await createClient()
      const { error, count } = await supabase
        .from("leads")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .in("id", ids)

      if (error) {
        console.error("[LeadService.bulkUpdateLeads] Error:", error)
        return { success: false, error: "Failed to update leads", code: "DB_ERROR" }
      }

      return { success: true, data: { updated: count || ids.length } }
    } catch (error: any) {
      console.error("[LeadService.bulkUpdateLeads] Exception:", error)
      return { success: false, error: error.message, code: "EXCEPTION" }
    }
  }

  /**
   * Delete leads (soft delete by archiving)
   */
  static async archiveLeads(ids: string[]): Promise<ServiceResult<{ archived: number }>> {
    const result = await this.bulkUpdateLeads(ids, { contact_status: "archived" })

    if (result.success && result.data) {
      return { success: true, data: { archived: result.data.updated } }
    }

    return { success: false, error: result.error, code: result.code }
  }

  /**
   * Get unique countries from leads
   */
  static async getCountries(): Promise<ServiceResult<string[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("leads")
        .select("country")
        .not("country", "is", null)

      if (error) {
        return { success: false, error: "Failed to fetch countries", code: "DB_ERROR" }
      }

      const countries = [...new Set(data?.map(d => d.country).filter(Boolean))]
      return { success: true, data: countries.sort() }
    } catch (error: any) {
      return { success: false, error: error.message, code: "EXCEPTION" }
    }
  }

  /**
   * Search leads (simplified for modals/dropdowns)
   */
  static async searchLeads(
    searchTerm: string,
    limit: number = 10
  ): Promise<ServiceResult<Lead[]>> {
    const result = await this.getLeads(
      { search: searchTerm },
      { limit, offset: 0 }
    )

    if (result.success && result.data) {
      return { success: true, data: result.data.items }
    }

    return { success: false, error: result.error, code: result.code }
  }
}
