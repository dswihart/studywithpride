"use client"

import { useState, useEffect } from "react"

interface WhatsAppMessage {
  id: string
  lead_id: string
  direction: "inbound" | "outbound"
  content: string
  status: string
  sent_at: string
}

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
}

interface MessageHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead | null
}

export default function MessageHistoryModal({ isOpen, onClose, lead }: MessageHistoryModalProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && lead) {
      fetchMessages()
    }
  }, [isOpen, lead?.id])

  const fetchMessages = async () => {
    if (!lead) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/recruiter/whatsapp-messages?leadId=${lead.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setMessages(data.messages || [])
      } else {
        console.error("Failed to fetch messages:", data.error)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          zIndex: 10000,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 600, color: '#1f2937' }}>
          Message History: {lead?.prospect_name || 'Lead'}
        </h2>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            No messages yet
          </div>
        ) : (
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((message) => (
              <div 
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.direction === 'outbound' ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    backgroundColor: message.direction === 'outbound' ? '#3b82f6' : '#f3f4f6',
                    color: message.direction === 'outbound' ? '#ffffff' : '#1f2937',
                    borderRadius: message.direction === 'outbound' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ fontSize: '14px', lineHeight: '1.5', wordWrap: 'break-word' }}>
                    {message.content}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '11px', 
                      marginTop: '6px',
                      color: message.direction === 'outbound' ? 'rgba(255,255,255,0.8)' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {new Date(message.sent_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                    {message.direction === 'outbound' && (
                      <span style={{ marginLeft: '4px' }}>
                        {message.status === 'delivered' ? '✓✓' : message.status === 'sent' ? '✓' : '⏱'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            marginTop: '8px'
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
