/**
 * Send Template API
 * POST - Send a template or quick message via email/whatsapp and log it
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRole } from "@/lib/auth/role-guard"
import { Resend } from "resend"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

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
      recipient_name,
      notes,
      custom_subject,
      custom_message,
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

    // Get template or quick message details
    let itemName = ""
    let itemContent = ""
    let fileUrl = ""

    if (template_id) {
      const { data: template } = await supabaseAdmin
        .from("templates")
        .select("name, description, file_url, content")
        .eq("id", template_id)
        .single()

      if (template) {
        itemName = template.name
        itemContent = template.description || template.content || ""
        fileUrl = template.file_url || ""
      }
    } else if (quick_message_id) {
      const { data: message } = await supabaseAdmin
        .from("quick_messages")
        .select("title, content")
        .eq("id", quick_message_id)
        .single()

      if (message) {
        itemName = message.title
        itemContent = message.content || ""
      }
    }

    let emailSent = false
    let emailError = null

    // Actually send email if method is 'email' and we have Resend configured
    if (send_method === "email" && recipient_email && resend) {
      try {
        const portalUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studywithpride.com"
        const emailSubject = custom_subject || itemName || "Information from Study With Pride"
        const recipientDisplayName = recipient_name || "Student"

        // Build email content
        let emailBody = custom_message || itemContent || ""

        // If there's a file URL, include it
        if (fileUrl) {
          emailBody += `\n\nYou can view/download the document here: ${fileUrl}`
        }

        const { data, error } = await resend.emails.send({
          from: "Study With Pride <noreply@studywithpride.com>",
          to: [recipient_email],
          subject: emailSubject,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                Study With Pride
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">
                ${emailSubject}
              </h2>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Dear ${recipientDisplayName},
              </p>

              <div style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 15px; white-space: pre-wrap;">
                ${emailBody.replace(/\n/g, "<br>")}
              </div>

              ${fileUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${fileUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                      View Document
                    </a>
                  </td>
                </tr>
              </table>
              ` : ""}

              <p style="color: #6b7280; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
                If you have any questions, please don't hesitate to reach out.
              </p>

              <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 0 0; font-size: 15px;">
                Best regards,<br>
                <strong>Study With Pride Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0; font-size: 13px; text-align: center;">
                &copy; ${new Date().getFullYear()} Study With Pride. All rights reserved.<br>
                <a href="${portalUrl}" style="color: #6b7280; text-decoration: none;">studywithpride.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `,
          text: `${emailSubject}\n\nDear ${recipientDisplayName},\n\n${emailBody}\n\nBest regards,\nStudy With Pride Team`,
        })

        if (error) {
          console.error("[templates/send] Resend error:", error)
          emailError = error.message
        } else {
          emailSent = true
          console.log(`[templates/send] Email sent to ${recipient_email}, id: ${data?.id}`)
        }
      } catch (err: any) {
        console.error("[templates/send] Email send error:", err)
        emailError = err.message
      }
    }

    // Log the send action - NOTE: email_sent column doesn't exist, so we skip it
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
        notes: notes ? `${notes}${emailSent ? ' [Email sent]' : ''}` : (emailSent ? '[Email sent]' : null),
      })
      .select()
      .single()

    if (error) {
      console.error("[templates/send] Log error:", error)
      // Don't fail if logging fails but email was sent
      if (!emailSent) {
        return NextResponse.json(
          { success: false, error: "Failed to log send action" },
          { status: 500 }
        )
      }
    }

    // Also log to contact_history if lead_id provided
    if (lead_id) {
      await supabaseAdmin.from("contact_history").insert({
        lead_id,
        recruiter_id: roleCheck.user?.id,
        contact_type: send_method === "whatsapp" ? "whatsapp" : "email",
        outcome: emailSent ? "Email sent successfully" : `Template shared via ${send_method}`,
        notes: `Sent: ${itemName}${notes ? " - " + notes : ""}${emailError ? ` (Error: ${emailError})` : ""}`,
        contacted_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      data,
      emailSent,
      emailError,
      message: emailSent
        ? `Email sent successfully to ${recipient_email}`
        : send_method === "email" && !resend
        ? "Email service not configured - use mailto instead"
        : "Action logged successfully",
    })
  } catch (error) {
    console.error("[templates/send] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
