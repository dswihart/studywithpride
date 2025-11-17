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
          borderRadius: '8px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          zIndex: 10000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px' }}>
          Messages for {lead?.prospect_name || 'Lead'}
        </h2>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No messages yet
          </div>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            {messages.map((message) => (
              <div 
                key={message.id}
                style={{
                  marginBottom: '10px',
                  padding: '12px',
                  backgroundColor: message.direction === 'outbound' ? '#dcf8c6' : '#f0f0f0',
                  borderRadius: '8px',
                  textAlign: message.direction === 'outbound' ? 'right' : 'left'
                }}
              >
                <div>{message.content}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {new Date(message.sent_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
