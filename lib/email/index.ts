import { Resend } from 'resend'

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface WelcomeEmailParams {
  to: string
  studentName: string
  temporaryPassword?: string
}

export async function sendWelcomeEmail({ to, studentName, temporaryPassword }: WelcomeEmailParams) {
  // If Resend API key is not configured, skip sending email
  if (!resend) {
    console.log('[email] RESEND_API_KEY not configured, skipping welcome email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const portalUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studywithpride.com'
    const loginUrl = `${portalUrl}/login`

    const { data, error } = await resend.emails.send({
      from: 'Study With Pride <noreply@studywithpride.com>',
      to: [to],
      subject: 'Welcome to Study With Pride Student Portal!',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Study With Pride</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 40px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                Study With Pride
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">
                Your Gateway to International Education
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
                Welcome, ${studentName}!
              </h2>

              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Great news! Your student portal account has been created. You now have access to our comprehensive student portal where you can:
              </p>

              <ul style="color: #4b5563; line-height: 1.8; margin: 0 0 25px 0; padding-left: 20px; font-size: 15px;">
                <li>Upload required documents</li>
                <li>Schedule interviews</li>
                <li>Track your application status</li>
                <li>Access visa assistance tools</li>
                <li>Communicate with your recruiter</li>
              </ul>

              ${temporaryPassword ? `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 0 0 25px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #92400e; margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">
                  Your Temporary Login Credentials:
                </p>
                <p style="color: #78350f; margin: 0; font-size: 14px;">
                  <strong>Email:</strong> ${to}<br>
                  <strong>Password:</strong> ${temporaryPassword}
                </p>
                <p style="color: #92400e; margin: 10px 0 0 0; font-size: 13px;">
                  Please change your password after your first login.
                </p>
              </div>
              ` : `
              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 0 0 25px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #1e40af; margin: 0; font-size: 14px;">
                  <strong>Your login email:</strong> ${to}<br>
                  Use the password reset link below if you need to set your password.
                </p>
              </div>
              `}

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Access Student Portal
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
                If you have any questions, please don't hesitate to reach out to your recruiter or our support team.
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
      text: `
Welcome to Study With Pride, ${studentName}!

Great news! Your student portal account has been created.

You now have access to our student portal where you can:
- Upload required documents
- Schedule interviews
- Track your application status
- Access visa assistance tools
- Communicate with your recruiter

${temporaryPassword ? `Your Login Credentials:
Email: ${to}
Temporary Password: ${temporaryPassword}

Please change your password after your first login.
` : `Your login email: ${to}
`}

Access the Student Portal: ${loginUrl}

If you have any questions, please don't hesitate to reach out to your recruiter or our support team.

Study With Pride
studywithpride.com
      `
    })

    if (error) {
      console.error('[email] Failed to send welcome email:', error)
      return { success: false, error: error.message }
    }

    console.log(`[email] Welcome email sent successfully to ${to}, id: ${data?.id}`)
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('[email] Error sending welcome email:', error)
    return { success: false, error: error.message }
  }
}
