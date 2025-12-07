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
      // Readiness checklist fields - accept all variations from frontend
      has_funds,
      confirmed_financial_support,  // Frontend sends this for funds
      meets_education_level,  // Frontend sends this for education
      english_level_basic,  // Frontend sends this for english
      has_valid_passport,
      has_education_docs,
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

    // Build insert object - map frontend field names to DB columns
    const insertData: Record<string, any> = {
      lead_id,
      contact_type: contact_type || "call",
      outcome: outcome || null,
      notes: notes || null,
      follow_up_action: follow_up_action || null,
      contacted_at: new Date().toISOString(),
      recruiter_id: recruiterId,
      // Readiness checklist fields - map from frontend names to DB columns
      has_funds: has_funds || confirmed_financial_support || false,  // Funds
      has_education_docs: has_education_docs || meets_education_level || false,  // Education
      has_valid_passport: has_valid_passport || false,  // Passport
      ready_to_proceed: ready_to_proceed || english_level_basic || false,  // English (using ready_to_proceed as proxy)
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
