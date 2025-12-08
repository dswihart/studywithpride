/**
 * User Management API
 * GET /api/recruiter/student-accounts
 *
 * Fetches ALL users from auth system with their profile data
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRole } from "@/lib/auth/role-guard"

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface UserAccountData {
  id: string
  email: string
  full_name: string | null
  country_of_origin: string | null
  phone_number: string | null
  crm_lead_id: string | null
  created_at: string
  role: string
  has_profile: boolean
  // Joined from leads
  lead_prospect_name?: string
  lead_country?: string
  lead_converted_at?: string
  lead_conversion_source?: string
  intake_term?: string
  // Program from contact history
  program_name?: string
}

export async function GET(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")
    if (!roleCheck.authorized) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    // Optional filters
    const country = searchParams.get("country")
    const roleFilter = searchParams.get("role")
    const source = searchParams.get("source")
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")

    // Fetch ALL users from auth.users via admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    })

    if (authError) {
      console.error("[user-management] Error fetching auth users:", authError)
      return NextResponse.json(
        { success: false, error: "Failed to fetch users" },
        { status: 500 }
      )
    }

    const authUsers = authData.users || []

    // Fetch all user profiles
    const { data: profiles } = await supabaseAdmin
      .from("user_profiles")
      .select("*")

    // Create profile lookup map
    const profileMap: Record<string, any> = {}
    for (const profile of profiles || []) {
      profileMap[profile.id] = profile
    }

    // Get all CRM lead IDs from profiles
    const crmLeadIds = (profiles || [])
      .filter((p) => p.crm_lead_id)
      .map((p) => p.crm_lead_id)

    // Fetch linked leads data
    let leadsMap: Record<string, any> = {}
    if (crmLeadIds.length > 0) {
      const { data: leads } = await supabaseAdmin
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

    // Fetch program names from contact_history for each lead
    let programMap: Record<string, string> = {}
    if (crmLeadIds.length > 0) {
      const { data: contactHistory } = await supabaseAdmin
        .from("contact_history")
        .select("lead_id, program_name")
        .in("lead_id", crmLeadIds)
        .not("program_name", "is", null)
        .order("contacted_at", { ascending: false })

      if (contactHistory) {
        // Get the most recent program_name for each lead
        for (const entry of contactHistory) {
          if (entry.program_name && !programMap[entry.lead_id]) {
            programMap[entry.lead_id] = entry.program_name
          }
        }
      }
    }

    // Fetch application states
    const userIds = authUsers.map((u) => u.id)
    let applicationMap: Record<string, any> = {}
    if (userIds.length > 0) {
      try {
        const { data: applications } = await supabaseAdmin
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
        // Table may not exist
      }
    }

    // Build combined user list from ALL auth users
    let userAccounts: UserAccountData[] = authUsers.map((authUser) => {
      const profile = profileMap[authUser.id]
      const linkedLead = profile?.crm_lead_id ? leadsMap[profile.crm_lead_id] : null
      const applicationState = applicationMap[authUser.id]
      const role = authUser.user_metadata?.role || "student"
      const programName = profile?.crm_lead_id ? programMap[profile.crm_lead_id] : undefined

      return {
        id: authUser.id,
        email: authUser.email || "",
        full_name: profile?.full_name || authUser.user_metadata?.full_name || null,
        country_of_origin: profile?.country_of_origin || null,
        phone_number: profile?.phone_number || null,
        crm_lead_id: profile?.crm_lead_id || null,
        created_at: authUser.created_at,
        role: role,
        has_profile: !!profile,
        // Lead data
        lead_prospect_name: linkedLead?.prospect_name,
        lead_country: linkedLead?.country,
        lead_converted_at: linkedLead?.converted_at,
        lead_conversion_source: linkedLead?.conversion_source,
        // Application data
        intake_term: applicationState?.intake_term,
        // Program data
        program_name: programName,
      }
    })

    // Apply filters
    if (roleFilter) {
      userAccounts = userAccounts.filter((u) => u.role === roleFilter)
    }

    if (country) {
      userAccounts = userAccounts.filter((u) => {
        const userCountry = u.country_of_origin || u.lead_country || ""
        return userCountry.toLowerCase().includes(country.toLowerCase())
      })
    }

    if (source === "crm_conversion") {
      userAccounts = userAccounts.filter((u) => u.crm_lead_id !== null)
    } else if (source === "manual") {
      userAccounts = userAccounts.filter((u) => u.crm_lead_id === null)
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      userAccounts = userAccounts.filter((u) => new Date(u.created_at) >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      userAccounts = userAccounts.filter((u) => new Date(u.created_at) <= toDate)
    }

    // Sort by created_at descending
    userAccounts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Summary stats
    const summary = {
      total: userAccounts.length,
      from_crm: userAccounts.filter((a) => a.crm_lead_id).length,
      manual: userAccounts.filter((a) => !a.crm_lead_id).length,
      by_role: {
        student: userAccounts.filter((a) => a.role === "student").length,
        recruiter: userAccounts.filter((a) => a.role === "recruiter").length,
        admin: userAccounts.filter((a) => a.role === "admin").length,
      },
    }

    return NextResponse.json({
      success: true,
      data: userAccounts,
      summary,
    })
  } catch (error) {
    console.error("[user-management] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
