"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/LanguageContext"

interface Lead {
  id: string
  country: string
  contact_status: string
  last_contact_date: string | null
  notes: string | null
  created_at: string
  created_time: string | null
  prospect_email: string | null
  prospect_name: string | null
  referral_source: string | null
  phone: string | null
  campaign: string | null
  campaign_name: string | null
  barcelona_timeline: number | null
  date_imported: string | null
  name_score: number | null
  email_score: number | null
  phone_valid: boolean | null
  is_duplicate: boolean
  recency_score: number | null
  lead_score: number | null
  lead_quality: string | null
  recruit_priority: number | null
}

interface ContactHistory {
  id: string
  lead_id: string
  contact_type: string
  outcome: string
  notes: string | null
  contacted_at: string
  created_at: string
}

interface ViewLeadModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead | null
  onEdit?: (lead: Lead) => void
}

export default function ViewLeadModal({ isOpen, onClose, lead, onEdit }: ViewLeadModalProps) {
  const { t } = useLanguage()
  const [contactHistory, setContactHistory] = useState<ContactHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (isOpen && lead) {
      fetchContactHistory()
    }
  }, [isOpen, lead])

  const fetchContactHistory = async () => {
    if (!lead) return
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/recruiter/contact-log?lead_id=${lead.id}`)
      const result = await response.json()
      if (result.success) {
        setContactHistory(result.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch contact history:", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  if (!isOpen || !lead) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "N/A"
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return "N/A"
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      not_contacted: "bg-gray-100 text-gray-800",
      contacted: "bg-blue-100 text-blue-800",
      interested: "bg-yellow-100 text-yellow-800",
      qualified: "bg-purple-100 text-purple-800",
      converted: "bg-green-100 text-green-800",
      unqualified: "bg-red-100 text-red-800",
      referral: "bg-cyan-100 text-cyan-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getQualityColor = (quality: string | null) => {
    const colors: Record<string, string> = {
      High: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-orange-100 text-orange-800",
      "Very Low": "bg-red-100 text-red-800",
    }
    return quality ? colors[quality] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800"
  }

  const getOutcomeIcon = (outcome: string) => {
    const icons: Record<string, string> = {
      answered_interested: "🎯",
      answered_not_interested: "👎",
      answered_call_back: "📞",
      no_answer: "📵",
      no_answer_whatsapp_sent: "📵💬",
      whatsapp_replied_interested: "💬🎯",
      whatsapp_replied_info: "💬📋",
      whatsapp_replied_not_interested: "💬👎",
      voicemail: "📬",
      wrong_number: "❌",
      scheduled_meeting: "📅",
      email_sent: "📧",
      whatsapp_sent: "💬",
    }
    return icons[outcome] || "📝"
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {lead.prospect_name || "Unknown Lead"}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.contact_status)}`}>
                  {lead.contact_status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </span>
                {lead.lead_quality && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getQualityColor(lead.lead_quality)}`}>
                    {lead.lead_quality} {lead.lead_score !== null && `(${lead.lead_score})`}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white">{lead.prospect_email || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    {lead.phone || "N/A"}
                    {lead.phone_valid && <span className="text-green-500">✓</span>}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Country</label>
                  <p className="text-gray-900 dark:text-white">{lead.country}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Barcelona Timeline</label>
                  <p className="text-gray-900 dark:text-white">
                    {lead.barcelona_timeline ? `${lead.barcelona_timeline} months` : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Source Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Source</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Campaign</label>
                  <p className="text-gray-900 dark:text-white">{lead.campaign || lead.campaign_name || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Referral Source</label>
                  <p className="text-gray-900 dark:text-white">{lead.referral_source || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Date Added</label>
                  <p className="text-gray-900 dark:text-white">{formatDate(lead.date_imported || lead.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Last Contact</label>
                  <p className="text-gray-900 dark:text-white">{formatDate(lead.last_contact_date)}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{lead.notes}</p>
                </div>
              </div>
            )}

            {/* Contact History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact History</h3>
              {loadingHistory ? (
                <p className="text-gray-500">Loading history...</p>
              ) : contactHistory.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No contact history yet.</p>
              ) : (
                <div className="space-y-3">
                  {contactHistory.map((entry) => (
                    <div key={entry.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getOutcomeIcon(entry.outcome)}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {entry.outcome.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDateTime(entry.contacted_at)}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{entry.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              Close
            </button>
            {onEdit && (
              <button onClick={() => onEdit(lead)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Lead
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
