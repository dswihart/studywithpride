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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return "✓✓"
      case "read":
        return "✓✓"
      case "sent":
        return "✓"
      default:
        return ""
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4" id="modal-title">
                  WhatsApp Conversation with {lead?.prospect_name || "Lead"}
                </h3>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-gray-500">Loading messages...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <div className="text-gray-500">No messages yet</div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.direction === "outbound" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs rounded-lg px-4 py-2 ${
                            message.direction === "outbound"
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          <div className="text-xs mt-1 opacity-75">
                            {formatTime(message.sent_at)}
                            {message.direction === "outbound" && (
                              <span className="ml-1">{getStatusIcon(message.status)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
