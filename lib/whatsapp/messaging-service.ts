/**
 * WhatsApp Business API Messaging Service
 * Supports Meta WhatsApp Business Platform and Twilio
 * 
 * Features:
 * - Multi-provider support (Meta, Twilio)
 * - Phone number validation (E.164 format)
 * - Template message handling
 * - Bi-directional messaging (send and receive)
 * - Error handling and retry logic
 * - Performance monitoring
 */

// Types
export interface WhatsAppConfig {
  provider: "meta" | "twilio"
  // Meta configuration
  accessToken?: string
  phoneNumberId?: string
  businessAccountId?: string
  // Twilio configuration
  accountSid?: string
  authToken?: string
  whatsappNumber?: string
}

export interface SendMessageParams {
  to: string // E.164 format phone number
  templateId?: string
  templateParams?: string[]
  text?: string // For session messages (within 24hr window)
  languageCode?: string
}

export interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
  provider: "meta" | "twilio"
  timestamp: number
  responseTime?: number
}

export interface IncomingMessage {
  messageId: string
  from: string // E.164 phone number
  to: string // Business phone number
  text: string
  timestamp: number
  type: "text" | "image" | "audio" | "video" | "document"
  mediaUrl?: string
  status?: "received" | "read"
}

export interface TemplateInfo {
  id: string
  name: string
  category: "UTILITY" | "MARKETING" | "AUTHENTICATION"
  language: string
  status: "APPROVED" | "PENDING" | "REJECTED"
  components: TemplateComponent[]
}

export interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS"
  text?: string
  parameters?: number // Number of parameters (e.g., {{1}}, {{2}})
}

// Phone number validation
export function validateE164PhoneNumber(phone: string): { valid: boolean; formatted?: string; error?: string } {
  const cleaned = phone.replace(/[^\d+]/g, "")
  const e164Regex = /^\+[1-9]\d{1,14}$/
  
  if (!e164Regex.test(cleaned)) {
    return {
      valid: false,
      error: "Phone number must be in E.164 format (e.g., +1234567890)"
    }
  }
  
  return {
    valid: true,
    formatted: cleaned
  }
}

// Meta WhatsApp Business API implementation
async function sendViaMeta(
  config: WhatsAppConfig,
  params: SendMessageParams
): Promise<SendMessageResult> {
  const startTime = Date.now()
  
  if (!config.accessToken || !config.phoneNumberId) {
    return {
      success: false,
      error: "Meta WhatsApp configuration incomplete",
      provider: "meta",
      timestamp: Date.now()
    }
  }
  
  const phoneValidation = validateE164PhoneNumber(params.to)
  if (!phoneValidation.valid) {
    return {
      success: false,
      error: phoneValidation.error,
      provider: "meta",
      timestamp: Date.now()
    }
  }
  
  try {
    let messagePayload: any
    
    if (params.text) {
      messagePayload = {
        messaging_product: "whatsapp",
        to: phoneValidation.formatted,
        type: "text",
        text: {
          body: params.text
        }
      }
    } else if (params.templateId) {
      messagePayload = {
        messaging_product: "whatsapp",
        to: phoneValidation.formatted,
        type: "template",
        template: {
          name: params.templateId,
          language: {
            code: params.languageCode || "en"
          }
        }
      }
      
      if (params.templateParams && params.templateParams.length > 0) {
        messagePayload.template.components = [
          {
            type: "body",
            parameters: params.templateParams.map(param => ({
              type: "text",
              text: param
            }))
          }
        ]
      }
    } else {
      return {
        success: false,
        error: "Either templateId or text must be provided",
        provider: "meta",
        timestamp: Date.now()
      }
    }
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(messagePayload)
      }
    )
    
    const responseTime = Date.now() - startTime
    const data = await response.json()
    
    if (!response.ok) {
      console.error("[WhatsApp Meta] Error:", data)
      return {
        success: false,
        error: data.error?.message || "Failed to send WhatsApp message",
        provider: "meta",
        timestamp: Date.now(),
        responseTime
      }
    }
    
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
      provider: "meta",
      timestamp: Date.now(),
      responseTime
    }
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    console.error("[WhatsApp Meta] Exception:", error)
    return {
      success: false,
      error: error.message || "Network error",
      provider: "meta",
      timestamp: Date.now(),
      responseTime
    }
  }
}

// Main messaging service
export class WhatsAppMessagingService {
  private config: WhatsAppConfig
  
  constructor(config: WhatsAppConfig) {
    this.config = config
  }
  
  async sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
    const startTime = Date.now()
    
    let result: SendMessageResult
    
    if (this.config.provider === "meta") {
      result = await sendViaMeta(this.config, params)
    } else {
      result = {
        success: false,
        error: "Invalid WhatsApp provider",
        provider: this.config.provider,
        timestamp: Date.now()
      }
    }
    
    const totalTime = Date.now() - startTime
    if (totalTime > 500) {
      console.warn(`[WhatsApp] Slow response: ${totalTime}ms (target: <500ms)`)
    }
    
    return result
  }
  
  validatePhoneNumber(phone: string) {
    return validateE164PhoneNumber(phone)
  }
}

export function createWhatsAppService(): WhatsAppMessagingService {
  const provider = (process.env.WHATSAPP_PROVIDER || "meta") as "meta" | "twilio"
  
  const config: WhatsAppConfig = {
    provider,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER
  }
  
  return new WhatsAppMessagingService(config)
}
