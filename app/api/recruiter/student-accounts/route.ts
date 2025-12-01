/**
 * Student Accounts API
 * GET /api/recruiter/student-accounts
 *
 * Fetches all student portal accounts with their linked CRM lead data
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/role-guard"

interface StudentAccountData {
  id: string
  email: string
  full_name: string | null
  country_of_origin: string | null
  phone_number: string | null
  crm_lead_id: string | null
  created_at: string
  // Joined from leads
  lead_prospect_name?: string
  lead_country?: string
  lead_converted_at?: string
  lead_conversion_source?: string
  intake_term?: string
}

export async function GET(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")
    if (!roleCheck.authorized) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Optional filters from query params
    const country = searchParams.get("country")
    const intake = searchParams.get("intake")
    const source = searchParams.get("source") // 'crm' or 'manual'
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")

    // Fetch all user profiles (student accounts)
    let query = supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    // Apply filters
    if (country) {
      query = query.ilike("country_of_origin", `%${country}%`)
    }

    if (source === "crm") {
      query = query.not("crm_lead_id", "is", null)
    } else if (source === "manual") {
      query = query.is("crm_lead_id", null)
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom)
    }

    if (dateTo) {
      query = query.lte("created_at", `${dateTo}T23:59:59.999Z`)
    }

    const { data: profiles, error: profilesError } = await query

    if (profilesError) {
      console.error("[student-accounts] Error fetching profiles:", profilesError)
      return NextResponse.json(
        { success: false, error: "Failed to fetch student accounts" },
        { status: 500 }
      )
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        summary: { total: 0, from_crm: 0, manual: 0 }
      })
    }

    // Get lead IDs that are linked
    const crmLeadIds = profiles
      .filter((p) => p.crm_lead_id)
      .map((p) => p.crm_lead_id)

    // Fetch linked leads data
    let leadsMap: Record<string, any> = {}
    if (crmLeadIds.length > 0) {
      const { data: leads } = await supabase
        .from("leads")
        .select("id, prospect_name, country, converted_at, conversion_source")
        .in("id", crmLeadIds)

      if (leads) {
        leadsMap = leads.reduce((acc, lead) => {
          acc[lead.id] = lead
          return acc
        }, {} as Record<string, any>)
      }
    }

    // Fetch application state for intake terms
    const userIds = profiles.map((p) => p.id)
    let applicationMap: Record<string, any> = {}
    try {
      const { data: applications } = await supabase
        .from("application_state")
        .select("user_id, intake_term")
        .in("user_id", userIds)

      if (applications) {
        applicationMap = applications.reduce((acc, app) => {
          acc[app.user_id] = app
          return acc
        }, {} as Record<string, any>)
      }
    } catch (e) {
      // Application state table may not exist
    }

    // Combine data
    const studentAccounts: StudentAccountData[] = profiles.map((profile) => {
      const linkedLead = profile.crm_lead_id ? leadsMap[profile.crm_lead_id] : null
      const applicationState = applicationMap[profile.id]

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        country_of_origin: profile.country_of_origin,
        phone_number: profile.phone_number,
        crm_lead_id: profile.crm_lead_id,
        created_at: profile.created_at,
        // Lead data
        lead_prospect_name: linkedLead?.prospect_name,
        lead_country: linkedLead?.country,
        lead_converted_at: linkedLead?.converted_at,
        lead_conversion_source: linkedLead?.conversion_source,
        // Application data
        intake_term: applicationState?.intake_term,
      }
    })

    // Apply intake filter after joining
    let filteredAccounts = studentAccounts
    if (intake) {
      filteredAccounts = filteredAccounts.filter(
        (a) => a.intake_term?.toLowerCase() === intake.toLowerCase()
      )
    }

    // Summary stats
    const summary = {
      total: filteredAccounts.length,
      from_crm: filteredAccounts.filter((a) => a.crm_lead_id).length,
      manual: filteredAccounts.filter((a) => !a.crm_lead_id).length,
    }

    return NextResponse.json({
      success: true,
      data: filteredAccounts,
      summary,
    })
  } catch (error) {
    console.error("[student-accounts] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
