/**
 * User Management API
 * GET /api/recruiter/student-accounts
 *
 * Fetches ALL users from auth system with their profile and lead data
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRole } from "@/lib/auth/role-guard"

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ContactHistoryEntry {
  id: string
  contact_type: string
  outcome: string | null
  notes: string | null
  follow_up_action: string | null
  contacted_at: string
  program_name?: string
}

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
  // Lead data
  lead_prospect_name?: string
  lead_country?: string
  lead_phone?: string
  lead_converted_at?: string
  lead_source?: string
  lead_notes?: string
  intake_term?: string
  program_name?: string
  // Contact history
  contact_history?: ContactHistoryEntry[]
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
    const includeHistory = searchParams.get("include_history") === "true"

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

    // Fetch ALL converted leads (leads that have student_id set)
    const { data: convertedLeads } = await supabaseAdmin
      .from("leads")
      .select("*")
      .not("student_id", "is", null)

    // Create lead lookup map by student_id
    const leadsByStudentId: Record<string, any> = {}
    const leadIds: string[] = []
    for (const lead of convertedLeads || []) {
      if (lead.student_id) {
        leadsByStudentId[lead.student_id] = lead
        leadIds.push(lead.id)
      }
    }

    // Fetch contact history for all converted leads
    let contactHistoryMap: Record<string, ContactHistoryEntry[]> = {}
    let programMap: Record<string, string> = {}

    if (leadIds.length > 0) {
      const { data: contactHistory } = await supabaseAdmin
        .from("contact_history")
        .select("*")
        .in("lead_id", leadIds)
        .order("contacted_at", { ascending: false })

      if (contactHistory) {
        for (const entry of contactHistory) {
          if (!contactHistoryMap[entry.lead_id]) {
            contactHistoryMap[entry.lead_id] = []
          }
          contactHistoryMap[entry.lead_id].push({
            id: entry.id,
            contact_type: entry.contact_type,
            outcome: entry.outcome,
            notes: entry.notes,
            follow_up_action: entry.follow_up_action,
            contacted_at: entry.contacted_at,
            program_name: entry.program_name
          })

          // Get most recent program_name
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
      const lead = leadsByStudentId[authUser.id]
      const applicationState = applicationMap[authUser.id]
      const role = authUser.user_metadata?.role || "student"
      const programName = lead ? programMap[lead.id] : undefined

      return {
        id: authUser.id,
        email: authUser.email || "",
        full_name: profile?.full_name || lead?.prospect_name || authUser.user_metadata?.full_name || null,
        country_of_origin: profile?.country_of_origin || lead?.country || null,
        phone_number: lead?.phone || null,
        crm_lead_id: lead?.id || null,
        created_at: authUser.created_at,
        role: role,
        has_profile: !!profile,
        // Lead data
        lead_prospect_name: lead?.prospect_name,
        lead_country: lead?.country,
        lead_phone: lead?.phone,
        lead_converted_at: lead?.converted_at,
        lead_source: lead?.source,
        lead_notes: lead?.notes,
        // Application data
        intake_term: applicationState?.intake_term,
        // Program data
        program_name: programName,
        // Contact history (only if requested)
        ...(includeHistory && lead ? { contact_history: contactHistoryMap[lead.id] || [] } : {})
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
