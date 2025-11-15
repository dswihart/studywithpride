interface WhatsAppPayload {
  to: string
  template_id: string
  language?: string
  variables?: Record<string, string>
}

interface SendTemplateOptions {
  phoneNumber: string
  templateId: string
  variables?: Record<string, string>
}

const API_BASE_URL = process.env.WHATSAPP_API_URL
const API_TOKEN = process.env.WHATSAPP_API_TOKEN

export async function sendWhatsAppTemplateMessage(options: SendTemplateOptions) {
  if (!API_BASE_URL || !API_TOKEN) {
    throw new Error('WhatsApp API configuration is missing')
  }

  const payload: WhatsAppPayload = {
    to: options.phoneNumber,
    template_id: options.templateId,
    language: 'en_US',
    variables: options.variables,
  }

  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Failed to send WhatsApp message')
    throw new Error(text || 'Failed to send WhatsApp message')
  }

  try {
    return await response.json()
  } catch {
    return {}
  }
}
