/**
 * Send Template API
 * POST - Log when a template is sent to a lead/student
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRole } from "@/lib/auth/role-guard"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")
    if (!roleCheck.authorized) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      template_id,
      quick_message_id,
      lead_id,
      student_user_id,
      send_method, // 'email', 'whatsapp', 'link_copied', 'attached'
      recipient_email,
      recipient_phone,
      notes,
    } = body

    if (!send_method) {
      return NextResponse.json(
        { success: false, error: "send_method is required" },
        { status: 400 }
      )
    }

    if (!template_id && !quick_message_id) {
      return NextResponse.json(
        { success: false, error: "template_id or quick_message_id is required" },
        { status: 400 }
      )
    }

    // Log the send action
    const { data, error } = await supabaseAdmin
      .from("template_send_logs")
      .insert({
        template_id,
        quick_message_id,
        lead_id,
        student_user_id,
        recruiter_id: roleCheck.user?.id,
        send_method,
        recipient_email,
        recipient_phone,
        notes,
      })
      .select()
      .single()

    if (error) {
      console.error("[templates/send] Log error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to log send action" },
        { status: 500 }
      )
    }

    // Also log to contact_log if lead_id provided
    if (lead_id) {
      const templateInfo = template_id
        ? await supabaseAdmin.from("templates").select("name").eq("id", template_id).single()
        : await supabaseAdmin.from("quick_messages").select("title").eq("id", quick_message_id).single()

      const itemName = (templateInfo.data as any)?.name || (templateInfo.data as any)?.title || "Unknown"

      await supabaseAdmin.from("contact_log").insert({
        lead_id,
        user_id: roleCheck.user?.id,
        contact_type: send_method === "whatsapp" ? "whatsapp" : "email",
        notes: `Sent template: ${itemName}${notes ? " - " + notes : ""}`,
        contact_date: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[templates/send] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
