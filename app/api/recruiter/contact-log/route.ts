import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/role-guard"

// GET - Fetch contact history for a lead
export async function GET(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || "Forbidden" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get("lead_id")

    if (!leadId) {
      return NextResponse.json({ success: false, error: "lead_id is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("contact_history")
      .select("*")
      .eq("lead_id", leadId)
      .order("contacted_at", { ascending: false })

    if (error) {
      console.error("[contact-log] GET Error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[contact-log] GET Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch contact history" }, { status: 500 })
  }
}

// POST - Create a new contact log entry
export async function POST(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()

    const {
      lead_id,
      contact_type,
      outcome,
      notes,
      follow_up_action,
      // Readiness checklist fields - accept all variations
      has_funds,
      meets_age_requirements,
      has_valid_passport,
      has_education_docs,  // Frontend sends this
      can_obtain_visa,     // DB has this
      can_start_intake,
      discussed_with_family,
      needs_housing_support,
      understands_work_rules,
      has_realistic_expectations,
      ready_to_proceed,
      readiness_comments,
      intake_period,
    } = body

    if (!lead_id) {
      return NextResponse.json({ success: false, error: "lead_id is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user ID for tracking
    const { data: { user } } = await supabase.auth.getUser()
    const recruiterId = user?.id || null

    // Build insert object - only include fields that exist in DB
    const insertData: Record<string, any> = {
      lead_id,
      contact_type: contact_type || "call",
      outcome: outcome || null,
      notes: notes || null,
      follow_up_action: follow_up_action || null,
      contacted_at: new Date().toISOString(),
      recruiter_id: recruiterId,
      // Readiness checklist fields
      has_funds: has_funds || false,
      meets_age_requirements: meets_age_requirements || false,
      has_valid_passport: has_valid_passport || false,
      can_obtain_visa: can_obtain_visa || has_education_docs || false, // Map has_education_docs to can_obtain_visa temporarily
      can_start_intake: can_start_intake || false,
      discussed_with_family: discussed_with_family || false,
      needs_housing_support: needs_housing_support || false,
      understands_work_rules: understands_work_rules || false,
      has_realistic_expectations: has_realistic_expectations || false,
      ready_to_proceed: ready_to_proceed || false,
      readiness_comments: readiness_comments || null,
      intake_period: intake_period || null,
    }

    const { data, error } = await supabase
      .from("contact_history")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("[contact-log] POST Error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("[contact-log] Contact logged for lead:", lead_id, "by recruiter:", recruiterId)

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[contact-log] POST Error:", error)
    return NextResponse.json({ success: false, error: "Failed to create contact log: " + error.message }, { status: 500 })
  }
}
