import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth/role-guard"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin or recruiter
    const adminCheck = await requireRole("admin")
    const isAdmin = adminCheck.authorized
    
    if (!isAdmin) {
      const recruiterCheck = await requireRole("recruiter")
      if (!recruiterCheck.authorized) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
      }
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    // Fetch recent contact history with lead info
    const { data: contactHistory, error } = await supabase
      .from("contact_history")
      .select(`
        id,
        lead_id,
        contact_type,
        outcome,
        notes,
        follow_up_action,
        contacted_at,
        recruiter_id,
        ready_to_proceed,
        leads!inner (
          id,
          prospect_name,
          prospect_email,
          phone,
          contact_status,
          country
        )
      `)
      .order("contacted_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[recent-activity] Error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Transform data for frontend
    const activities = (contactHistory || []).map((entry: any) => {
      const lead = entry.leads
      return {
        id: entry.id,
        lead_id: entry.lead_id,
        lead_name: lead?.prospect_name || lead?.prospect_email || "Unknown Lead",
        lead_email: lead?.prospect_email,
        lead_phone: lead?.phone,
        lead_status: lead?.contact_status,
        lead_country: lead?.country,
        contact_type: entry.contact_type,
        outcome: entry.outcome,
        notes: entry.notes,
        follow_up_action: entry.follow_up_action,
        contacted_at: entry.contacted_at,
        recruiter_id: entry.recruiter_id,
        ready_to_proceed: entry.ready_to_proceed,
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: activities,
      is_admin: isAdmin
    })
  } catch (error) {
    console.error("[recent-activity] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch activity" }, { status: 500 })
  }
}
