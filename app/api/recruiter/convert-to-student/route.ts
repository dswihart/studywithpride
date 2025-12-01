/**
 * Lead-to-Student Conversion API
 * POST /api/recruiter/convert-to-student
 *
 * When a lead is marked "ready to proceed", this API:
 * 1. Creates a student account in auth.users and user_profiles
 * 2. Links the lead to the student account
 * 3. Updates the lead status to "converted"
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRole } from "@/lib/auth/role-guard"

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ConversionRequest {
  lead_id: string
  // Optional overrides from contact log
  intake_period?: string
  readiness_comments?: string
}

interface ConversionResult {
  success: boolean
  student_user_id?: string
  error?: string
  message?: string
  already_exists?: boolean
}

export async function POST(request: NextRequest): Promise<NextResponse<ConversionResult>> {
  try {
    // Check recruiter role
    const roleCheck = await requireRole("recruiter")
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    const body: ConversionRequest = await request.json()
    const { lead_id, intake_period, readiness_comments } = body

    if (!lead_id) {
      return NextResponse.json(
        { success: false, error: "lead_id is required" },
        { status: 400 }
      )
    }

    // 1. Fetch the lead data
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      )
    }

    // Check if lead is already converted
    if (lead.student_user_id) {
      return NextResponse.json({
        success: true,
        student_user_id: lead.student_user_id,
        message: "Lead already converted to student",
        already_exists: true
      })
    }

    // 2. Check if email already exists in auth.users
    const email = lead.prospect_email?.toLowerCase()?.trim()
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Lead has no email address" },
        { status: 400 }
      )
    }

    // Check for existing user with this email
    const { data: existingUsers } = await supabaseAdmin
      .from("user_profiles")
      .select("id, email")
      .eq("email", email)
      .limit(1)

    let studentUserId: string

    if (existingUsers && existingUsers.length > 0) {
      // User already exists - link to existing account
      studentUserId = existingUsers[0].id

      // Update user_profiles with CRM lead reference
      await supabaseAdmin
        .from("user_profiles")
        .update({
          crm_lead_id: lead_id,
          full_name: lead.prospect_name || existingUsers[0].id,
          country_of_origin: lead.country || null,
          phone_number: lead.phone || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", studentUserId)

    } else {
      // 3. Create new student account
      // Generate a temporary password (user will reset on first login)
      const tempPassword = `Welcome${Date.now().toString(36)}!`

      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email for CRM-created users
        user_metadata: {
          full_name: lead.prospect_name,
          source: "crm_conversion",
          crm_lead_id: lead_id
        }
      })

      if (authError || !authUser.user) {
        console.error("[convert-to-student] Auth creation error:", authError)
        return NextResponse.json(
          { success: false, error: authError?.message || "Failed to create user account" },
          { status: 500 }
        )
      }

      studentUserId = authUser.user.id

      // 4. Create user_profiles entry
      const { error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .insert({
          id: studentUserId,
          email: email,
          full_name: lead.prospect_name || null,
          country_of_origin: lead.country || null,
          phone_number: lead.phone || null,
          preferred_language: "en",
          crm_lead_id: lead_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error("[convert-to-student] Profile creation error:", profileError)
        // Don't fail completely - auth user was created
      }

      // 5. Create initial application state if table exists
      try {
        await supabaseAdmin
          .from("application_state")
          .insert({
            user_id: studentUserId,
            intake_term: intake_period || null,
            application_status: "draft",
            visa_status: "not_started",
            checklist_progress: {},
            documents_uploaded: [],
            notes: readiness_comments || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      } catch (e) {
        // Application state table may not exist - not critical
        console.log("[convert-to-student] Application state not created (table may not exist)")
      }
    }

    // 6. Update the lead with conversion data
    const { error: leadUpdateError } = await supabaseAdmin
      .from("leads")
      .update({
        contact_status: "converted",
        student_user_id: studentUserId,
        converted_at: new Date().toISOString(),
        conversion_source: "Ready to Proceed Automation"
      })
      .eq("id", lead_id)

    if (leadUpdateError) {
      console.error("[convert-to-student] Lead update error:", leadUpdateError)
      return NextResponse.json(
        { success: false, error: "Failed to update lead status" },
        { status: 500 }
      )
    }

    // 7. Log the conversion in contact_history
    await supabaseAdmin
      .from("contact_history")
      .insert({
        lead_id: lead_id,
        contact_type: "system",
        outcome: "Converted to Student",
        notes: `Lead converted to student portal account. User ID: ${studentUserId}`,
        follow_up_action: null,
        ready_to_proceed: true,
        contacted_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      student_user_id: studentUserId,
      message: existingUsers?.length ? "Lead linked to existing student account" : "Student account created successfully"
    })

  } catch (error: any) {
    console.error("[convert-to-student] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint to check conversion status
export async function GET(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")
    if (!roleCheck.authorized) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get("lead_id")

    if (!leadId) {
      return NextResponse.json({ success: false, error: "lead_id required" }, { status: 400 })
    }

    const { data: lead } = await supabaseAdmin
      .from("leads")
      .select("id, student_user_id, converted_at, conversion_source, contact_status")
      .eq("id", leadId)
      .single()

    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        is_converted: lead.contact_status === "converted",
        student_user_id: lead.student_user_id,
        converted_at: lead.converted_at,
        conversion_source: lead.conversion_source
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
