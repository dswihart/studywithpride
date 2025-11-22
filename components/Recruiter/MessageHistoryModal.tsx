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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5">
      <div
        className="bg-white dark:bg-gray-800 p-8 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto relative z-[10000] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          Message History: {lead?.prospect_name || 'Lead'}
        </h2>

        {loading ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-10 text-center text-gray-400 dark:text-gray-500">
            No messages yet
          </div>
        ) : (
          <div className="mb-5 flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex w-full ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 shadow-sm ${message.direction === 'outbound'
                      ? 'bg-blue-500 text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-t-2xl rounded-br-2xl rounded-bl-sm'
                    }`}
                >
                  <div className="text-sm leading-relaxed break-words">
                    {message.content}
                  </div>
                  <div
                    className={`text-[11px] mt-1.5 flex items-center gap-1 ${message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}
                  >
                    {new Date(message.sent_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                    {message.direction === 'outbound' && (
                      <span className="ml-1">
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
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg cursor-pointer text-sm font-medium mt-2 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
