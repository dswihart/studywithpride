import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
      generate_password,
      send_welcome_email,
      enable_document_upload,
      enable_interview_scheduling,
      notes
    } = body

    if (!lead_id || !student_email) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get lead data
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 })
    }

    if (lead.converted_to_student) {
      return NextResponse.json({ success: false, error: "Lead already converted" }, { status: 400 })
    }

    // Generate a random password if requested
    const password = generate_password
      ? Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase() + "!"
      : null

    // Create student account in auth (if applicable)
    let studentUserId = null
    if (generate_password && password) {
      const { data: authUser, error: signUpError } = await supabase.auth.admin.createUser({
        email: student_email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: lead.prospect_name,
          role: 'student',
          converted_from_lead: lead_id
        }
      })

      if (signUpError) {
        console.error("Failed to create student auth account:", signUpError)
        // Continue without auth account - can be created later
      } else {
        studentUserId = authUser.user?.id
      }
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

    const { data: updatedLead, error: updateError } = await supabase
      .from("leads")
      .update({
        converted_to_student: true,
        converted_at: new Date().toISOString(),
        student_id: studentUserId,
        funnel_data: funnelData
      })
      .eq("id", lead_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    // Log conversion in history
    await supabase
      .from("lead_funnel_history")
      .insert({
        lead_id,
        from_stage: lead.funnel_stage,
        to_stage: 4,
        stage_data: { action: 'converted_to_student', student_email },
        changed_by: user.id,
        notes: notes || 'Lead converted to student'
      })

    // TODO: Send welcome email if requested
    // if (send_welcome_email && password) {
    //   await sendWelcomeEmail(student_email, password, lead.prospect_name)
    // }

    return NextResponse.json({
      success: true,
      data: {
        lead: updatedLead,
        studentId: studentUserId,
        message: "Lead successfully converted to student"
      }
    })

  } catch (error) {
    console.error("Funnel POST (convert) error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
