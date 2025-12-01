import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch contact history for a lead
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get("lead_id")

    if (!leadId) {
      return NextResponse.json({ success: false, error: "lead_id is required" }, { status: 400 })
    }

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
    const body = await request.json()

    const {
      lead_id,
      contact_type,
      outcome,
      notes,
      follow_up_action,
      // Readiness checklist fields
      has_funds,
      meets_age_requirements,
      has_valid_passport,
      can_obtain_visa,
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

    const { data, error } = await supabase
      .from("contact_history")
      .insert({
        lead_id,
        contact_type: contact_type || "call",
        outcome: outcome || null,
        notes: notes || null,
        follow_up_action: follow_up_action || null,
        contacted_at: new Date().toISOString(),
        // Readiness checklist fields
        has_funds: has_funds || false,
        meets_age_requirements: meets_age_requirements || false,
        has_valid_passport: has_valid_passport || false,
        can_obtain_visa: can_obtain_visa || false,
        can_start_intake: can_start_intake || false,
        discussed_with_family: discussed_with_family || false,
        needs_housing_support: needs_housing_support || false,
        understands_work_rules: understands_work_rules || false,
        has_realistic_expectations: has_realistic_expectations || false,
        ready_to_proceed: ready_to_proceed || false,
        readiness_comments: readiness_comments || null,
        intake_period: intake_period || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[contact-log] POST Error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[contact-log] POST Error:", error)
    return NextResponse.json({ success: false, error: "Failed to create contact log" }, { status: 500 })
  }
}
