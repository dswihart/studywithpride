"use client"

import { useState, useMemo } from "react"
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { Template, QuickMessage, Lead, ItemType } from "./types"

interface LeadSelectModalProps {
  item: Template | QuickMessage
  itemType: ItemType
  leads: Lead[]
  loading: boolean
  onClose: () => void
  onSendComplete?: () => void
}

export function LeadSelectModal({
  item,
  itemType,
  leads,
  loading,
  onClose,
  onSendComplete,
}: LeadSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [sending, setSending] = useState(false)
  const [customSubject, setCustomSubject] = useState(
    itemType === "template" ? (item as Template).name : (item as QuickMessage).title
  )
  const [customMessage, setCustomMessage] = useState(
    itemType === "template" ? (item as Template).description || "" : (item as QuickMessage).content
  )

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads
    const searchLower = searchTerm.toLowerCase()
    return leads.filter(
      (l) =>
        l.prospect_email?.toLowerCase().includes(searchLower) ||
        l.prospect_name?.toLowerCase().includes(searchLower) ||
        l.phone?.toLowerCase().includes(searchLower)
    )
  }, [leads, searchTerm])

  const handleSend = async () => {
    if (!selectedLead) return
    setSending(true)

    try {
      const payload: Record<string, unknown> = {
        send_method: "email",
        recipient_email: selectedLead.prospect_email,
        recipient_name: selectedLead.prospect_name || selectedLead.prospect_email,
        lead_id: selectedLead.id,
        custom_subject: customSubject,
        custom_message: customMessage,
      }

      if (itemType === "template") {
        payload.template_id = item.id
      } else {
        payload.quick_message_id = item.id
      }

      const res = await fetch("/api/recruiter/templates/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        if (data.emailSent) {
          alert(`Email sent successfully to ${selectedLead.prospect_name || selectedLead.prospect_email}!`)
        } else {
          alert(data.message || "Action logged.")
        }
        onClose()
        onSendComplete?.()
      } else {
        alert(data.error || "Failed to send email")
      }
    } catch (error) {
      console.error("Error sending to lead:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Send to Lead
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b dark:border-gray-700">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No leads found</p>
          ) : (
            <div className="space-y-2">
              {filteredLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedLead?.id === lead.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white">
                    {lead.prospect_name || lead.prospect_email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {lead.prospect_email}
                    {lead.phone && ` • ${lead.phone}`}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedLead && (
          <div className="p-4 border-t dark:border-gray-700 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedLead || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Email"}
          </button>
        </div>
      </div>
    </div>
  )
}
