import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

// Admin client for user creation
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch funnel data for a lead, or list programs/intakes
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get("lead_id")
    const type = searchParams.get("type") // 'programs', 'intakes', or null for lead funnel data

    // Get programs list
    if (type === "programs") {
      const { data: programs, error } = await supabase
        .from("programs")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: { programs } })
    }

    // Get intakes for a program
    if (type === "intakes") {
      const programId = searchParams.get("program_id")

      let query = supabase
        .from("intakes")
        .select("*")
        .eq("is_active", true)
        .order("start_date")

      if (programId) {
        query = query.eq("program_id", programId)
      }

      const { data: intakes, error } = await query

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: { intakes } })
    }

    // Get funnel data for a specific lead
    if (leadId) {
      const { data: lead, error } = await supabase
        .from("leads")
        .select(`
          id,
          prospect_name,
          prospect_email,
          phone,
          country,
          funnel_stage,
          funnel_data,
          converted_to_student,
          converted_at,
          student_id
        `)
        .eq("id", leadId)
        .single()

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      // Get funnel history
      const { data: history } = await supabase
        .from("lead_funnel_history")
        .select("*")
        .eq("lead_id", leadId)
        .order("changed_at", { ascending: false })
        .limit(20)

      return NextResponse.json({
        success: true,
        data: {
          lead,
          history: history || []
        }
      })
    }

    return NextResponse.json({ success: false, error: "Missing lead_id or type parameter" }, { status: 400 })

  } catch (error) {
    console.error("Funnel GET error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update funnel stage data
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { lead_id, stage, stage_data, complete_stage } = body

    if (!lead_id) {
      return NextResponse.json({ success: false, error: "Missing lead_id" }, { status: 400 })
    }

    // Get current lead data
    const { data: currentLead, error: fetchError } = await supabase
      .from("leads")
      .select("funnel_stage, funnel_data")
      .eq("id", lead_id)
      .single()

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
    }

    const currentFunnelData = currentLead.funnel_data || {
      leadId: lead_id,
      currentStage: 1,
      stages: { stage1: null, stage2: null, stage3: null, stage4: null },
      completedStages: []
    }

    // Update stage data
    if (stage && stage_data) {
      currentFunnelData.stages[`stage${stage}`] = stage_data
    }

    // Complete stage and advance
    if (complete_stage) {
      const completedStages = currentFunnelData.completedStages || []
      if (!completedStages.includes(complete_stage)) {
        completedStages.push(complete_stage)
      }
      currentFunnelData.completedStages = completedStages

      // Advance to next stage if completing current
      if (complete_stage === currentFunnelData.currentStage && complete_stage < 4) {
        currentFunnelData.currentStage = complete_stage + 1
      }
    }

    // Update lead
    const { data: updatedLead, error: updateError } = await supabase
      .from("leads")
      .update({
        funnel_stage: currentFunnelData.currentStage,
        funnel_data: currentFunnelData
      })
      .eq("id", lead_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    // Log history if stage completed
    if (complete_stage) {
      await supabase
        .from("lead_funnel_history")
        .insert({
          lead_id,
          from_stage: currentLead.funnel_stage,
          to_stage: currentFunnelData.currentStage,
          stage_data: stage_data,
          changed_by: user.id,
          notes: `Completed stage ${complete_stage}`
        })
    }

    return NextResponse.json({ success: true, data: { lead: updatedLead } })

  } catch (error) {
    console.error("Funnel PUT error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// POST - Convert lead to student
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      lead_id,
      student_email,
      generate_password = true,
      send_welcome_email,
      enable_document_upload,
      enable_interview_scheduling,
      notes
    } = body

    if (!lead_id || !student_email) {
      return NextResponse.json({ success: false, error: "Missing required fields (lead_id, student_email)" }, { status: 400 })
    }

    // Get lead data using admin client for full access
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single()

    if (leadError || !lead) {
      console.error("[funnel] Lead fetch error:", leadError)
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 })
    }

    if (lead.converted_to_student) {
      return NextResponse.json({ success: false, error: "Lead already converted" }, { status: 400 })
    }

    // Generate a secure password
    const password = `Welcome${Date.now().toString(36)}${Math.random().toString(36).slice(-4).toUpperCase()}!`

    // Create student account using admin client
    let studentUserId = null
    const { data: authUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: student_email.toLowerCase().trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: lead.prospect_name,
        role: 'student',
        converted_from_lead: lead_id
      }
    })

    if (signUpError) {
      console.error("[funnel] Failed to create student auth account:", signUpError)
      return NextResponse.json({
        success: false,
        error: `Failed to create student account: ${signUpError.message}`
      }, { status: 500 })
    }

    studentUserId = authUser.user?.id

    if (!studentUserId) {
      return NextResponse.json({ success: false, error: "Failed to create student account - no user ID returned" }, { status: 500 })
    }

    // Create user_profiles entry
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        id: studentUserId,
        email: student_email.toLowerCase().trim(),
        full_name: lead.prospect_name || null,
        country_of_origin: lead.country || null,
        phone_number: lead.phone || null,
        preferred_language: "en",
        crm_lead_id: lead_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error("[funnel] Profile creation error:", profileError)
      // Don't fail - the auth account was created
    }

    // Update lead as converted
    const funnelData = lead.funnel_data || {}
    funnelData.convertedToStudent = true
    funnelData.convertedAt = new Date().toISOString()
    funnelData.studentId = studentUserId
    funnelData.conversionNotes = notes
    funnelData.conversionSettings = {
      sendWelcomeEmail: send_welcome_email,
      enableDocumentUpload: enable_document_upload,
      enableInterviewScheduling: enable_interview_scheduling
    }

    const { data: updatedLead, error: updateError } = await supabaseAdmin
      .from("leads")
      .update({
        converted_to_student: true,
        converted_at: new Date().toISOString(),
        student_id: studentUserId,
        contact_status: "converted",
        funnel_data: funnelData
      })
      .eq("id", lead_id)
      .select()
      .single()

    if (updateError) {
      console.error("[funnel] Lead update error:", updateError)
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    // Log conversion in contact_history
    await supabaseAdmin
      .from("contact_history")
      .insert({
        lead_id: lead_id,
        contact_type: "system",
        outcome: "Converted to Student Portal",
        notes: `Student account created. User ID: ${studentUserId}. Email: ${student_email}`,
        follow_up_action: null,
        ready_to_proceed: true,
        contacted_at: new Date().toISOString()
      })

    // Try to log in lead_funnel_history (table may not exist)
    try {
      await supabaseAdmin
        .from("lead_funnel_history")
        .insert({
          lead_id,
          from_stage: lead.funnel_stage || 4,
          to_stage: 4,
          stage_data: { action: 'converted_to_student', student_email },
          changed_by: user.id,
          notes: notes || 'Lead converted to student'
        })
    } catch (e) {
      // Table may not exist - not critical
    }

    console.log(`[funnel] Successfully converted lead ${lead_id} to student ${studentUserId}`)

    return NextResponse.json({
      success: true,
      data: {
        lead: updatedLead,
        studentId: studentUserId,
        studentEmail: student_email,
        message: "Lead successfully converted to student"
      }
    })

  } catch (error: any) {
    console.error("[funnel] POST (convert) error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
