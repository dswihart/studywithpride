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

    // Map DB column names back to frontend expected names
    // Also extract program_name from notes if it was stored there
    const mappedData = data?.map((entry: any) => {
      // Try to extract program name from notes if stored as [Program: xxx]
      let programName = null
      if (entry.notes) {
        const match = entry.notes.match(/\[Program: ([^\]]+)\]/)
        if (match) {
          programName = match[1]
        }
      }

      return {
        ...entry,
        // Map DB columns to frontend expected field names
        meets_education_level: entry.has_education_docs || false,
        english_level_basic: entry.ready_to_proceed || false,
        confirmed_financial_support: entry.has_funds || false,
        program_name: programName,
      }
    }) || []

    return NextResponse.json({ success: true, data: mappedData })
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
      confirmed_financial_support,
      meets_education_level,
      english_level_basic,
      has_valid_passport,
      has_education_docs,
      ready_to_proceed,
      readiness_comments,
      intake_period,
      program_name,
      flag_followup,
    } = body

    if (!lead_id) {
      return NextResponse.json({ success: false, error: "lead_id is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user ID for tracking
    const { data: { user } } = await supabase.auth.getUser()
    const recruiterId = user?.id || null

    // Build notes field - append program name if provided
    let finalNotes = notes || ""
    if (program_name) {
      finalNotes = finalNotes ? `${finalNotes} [Program: ${program_name}]` : `[Program: ${program_name}]`
    }

    // Build insert object - map frontend field names to DB columns
    // NOTE: program_name column doesn't exist, so we store it in notes
    const insertData: Record<string, any> = {
      lead_id,
      contact_type: contact_type || "call",
      outcome: outcome || null,
      notes: finalNotes || null,
      follow_up_action: follow_up_action || null,
      contacted_at: new Date().toISOString(),
      recruiter_id: recruiterId,
      // Readiness checklist fields - map from frontend names to DB columns
      has_funds: has_funds || confirmed_financial_support || false,
      has_education_docs: has_education_docs || meets_education_level || false,
      has_valid_passport: has_valid_passport || false,
      ready_to_proceed: ready_to_proceed || english_level_basic || false,
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

    // Update lead status to "contacted" and last_contact_date
    const updateData: Record<string, unknown> = {
      contact_status: "contacted",
      last_contact_date: new Date().toISOString(),
    }
    
    // Add needs_followup flag if set
    if (flag_followup) {
      updateData.needs_followup = true
    }
    
    const { error: updateError } = await supabase
      .from("leads")
      .update(updateData)
      .eq("id", lead_id)

    if (updateError) {
      console.error("[contact-log] Failed to update lead status:", updateError)
      // Don't fail the request - the contact was logged successfully
    } else {
      console.log("[contact-log] Lead status updated to contacted for lead:", lead_id)
    }

    // Return data with program_name extracted back out for frontend
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        program_name: program_name || null
      }
    })
  } catch (error: any) {
    console.error("[contact-log] POST Error:", error)
    return NextResponse.json({ success: false, error: "Failed to create contact log: " + error.message }, { status: 500 })
  }
}
