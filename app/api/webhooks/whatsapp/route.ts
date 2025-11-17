/**
 * WhatsApp Webhook Endpoint
 * GET/POST /api/webhooks/whatsapp
 * 
 * Handles:
 * - GET: Webhook verification (Meta requirement)
 * - POST: Incoming WhatsApp messages
 * 
 * Features:
 * - Signature verification for security
 * - Message storage in database
 * - Automatic lead matching by phone number
 * - Support for text, image, audio, video, document messages
 * - Delivery and read receipts
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// GET /api/webhooks/whatsapp - Webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")
  
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "study_with_pride_webhook_2025"
  
  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp Webhook] Verification successful")
    return new NextResponse(challenge, { status: 200 })
  } else {
    console.error("[WhatsApp Webhook] Verification failed")
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }
}

// POST /api/webhooks/whatsapp - Incoming messages
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.text()
    const signature = request.headers.get("x-hub-signature-256")
    
    if (!verifyWebhookSignature(body, signature)) {
      console.error("[WhatsApp Webhook] Invalid signature")
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      )
    }
    
    const data = JSON.parse(body)
    
    if (data.object !== "whatsapp_business_account") {
      return NextResponse.json({ success: true }, { status: 200 })
    }
    
    for (const entry of data.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === "messages") {
          await handleIncomingMessage(change.value)
        } else if (change.field === "message_status") {
          await handleMessageStatus(change.value)
        }
      }
    }
    
    const elapsedTime = Date.now() - startTime
    console.log(`[WhatsApp Webhook] Processed in ${elapsedTime}ms`)
    
    return NextResponse.json({ success: true }, { status: 200 })
    
  } catch (error: any) {
    console.error("[WhatsApp Webhook] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false
  
  const appSecret = process.env.WHATSAPP_APP_SECRET
  if (!appSecret) {
    console.warn("[WhatsApp Webhook] WHATSAPP_APP_SECRET not configured")
    return true
  }
  
  const expectedSignature = "sha256=" + crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest("hex")
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

async function handleIncomingMessage(value: any) {
  try {
    const messages = value.messages || []
    const contacts = value.contacts || []
    
    for (const message of messages) {
      const from = message.from
      const messageId = message.id
      const timestamp = parseInt(message.timestamp) * 1000
      
      const contact = contacts.find((c: any) => c.wa_id === from)
      const contactName = contact?.profile?.name
      
      let messageText = ""
      let messageType = "text"
      let mediaUrl = null
      
      if (message.type === "text") {
        messageText = message.text.body
        messageType = "text"
      } else if (message.type === "image") {
        messageText = message.image.caption || "[Image]"
        mediaUrl = message.image.id
        messageType = "image"
      } else if (message.type === "audio") {
        messageText = "[Audio message]"
        mediaUrl = message.audio.id
        messageType = "audio"
      } else if (message.type === "video") {
        messageText = message.video.caption || "[Video]"
        mediaUrl = message.video.id
        messageType = "video"
      } else if (message.type === "document") {
        messageText = `[Document: ${message.document.filename}]`
        mediaUrl = message.document.id
        messageType = "document"
      } else {
        messageText = `[Unsupported message type: ${message.type}]`
      }
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      const formattedPhone = `+${from}`
      
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select("id, prospect_name")
        .eq("phone", formattedPhone)
        .single()
      
      if (leadError || !lead) {
        console.warn(`[WhatsApp Webhook] No lead found for phone ${formattedPhone}`)
        
        const { error: insertError } = await supabase
          .from("leads")
          .insert({
            phone: formattedPhone,
            prospect_name: contactName || "Unknown",
            contact_status: "not_contacted",
            phone_valid: true,
            notes: `Auto-created from WhatsApp message on ${new Date().toISOString()}`
          })
        
        if (insertError) {
          console.error("[WhatsApp Webhook] Failed to create lead:", insertError)
          return
        }
        
        const { data: newLead } = await supabase
          .from("leads")
          .select("id")
          .eq("phone", formattedPhone)
          .single()
        
        if (!newLead) return
        
        await saveIncomingMessage(supabase, newLead.id, messageId, messageText, messageType, mediaUrl, timestamp)
      } else {
        await saveIncomingMessage(supabase, lead.id, messageId, messageText, messageType, mediaUrl, timestamp)
      }
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling incoming message:", error)
  }
}

async function saveIncomingMessage(
  supabase: any,
  leadId: string,
  messageId: string,
  content: string,
  messageType: string,
  mediaUrl: string | null,
  timestamp: number
) {
  const { error } = await supabase
    .from("whatsapp_messages")
    .insert({
      lead_id: leadId,
      message_id: messageId,
      direction: "inbound",
      message_type: messageType,
      content,
      status: "received",
      sent_at: new Date(timestamp).toISOString(),
      metadata: mediaUrl ? { media_url: mediaUrl } : null
    })
  
  if (error) {
    console.error("[WhatsApp Webhook] Failed to save message:", error)
  }
}

async function handleMessageStatus(value: any) {
  try {
    const statuses = value.statuses || []
    
    for (const status of statuses) {
      const messageId = status.id
      const newStatus = status.status
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      const updateData: any = { status: newStatus }
      
      if (newStatus === "delivered") {
        updateData.delivered_at = new Date().toISOString()
      } else if (newStatus === "read") {
        updateData.read_at = new Date().toISOString()
      } else if (newStatus === "failed") {
        updateData.error_message = status.errors?.[0]?.message || "Message failed"
      }
      
      const { error } = await supabase
        .from("whatsapp_messages")
        .update(updateData)
        .eq("message_id", messageId)
      
      if (error) {
        console.error("[WhatsApp Webhook] Failed to update message status:", error)
      }
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Error handling message status:", error)
  }
}
