"use client"

import { useState, useEffect } from "react"
import { Stage1Data, LeadWithFunnel } from "@/lib/funnel/types"

interface ContactHistoryEntry {
  id: string
  contact_type: string
  outcome: string | null
  notes: string | null
  contacted_at: string
  recruiter_id: string | null
  has_funds: boolean
  meets_age_requirements: boolean
  has_valid_passport: boolean
  has_education_docs: boolean
  can_start_intake: boolean
  discussed_with_family: boolean
  ready_to_proceed: boolean
  intake_period: string | null
  readiness_comments: string | null
}

interface Stage1ContactedProps {
  lead: LeadWithFunnel
  data: Stage1Data | null
  onSave: (data: Stage1Data) => Promise<void>
  onComplete: () => void
  isEditing?: boolean
}

export default function Stage1Contacted({
  lead,
}: Stage1ContactedProps) {
  const [contactHistory, setContactHistory] = useState<ContactHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContactHistory = async () => {
      try {
        const response = await fetch(`/api/recruiter/contact-log?lead_id=${lead.id}`)
        const result = await response.json()
        if (result.success && result.data) {
          setContactHistory(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch contact history:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchContactHistory()
  }, [lead.id])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getOutcomeColor = (outcome: string | null) => {
    if (!outcome) return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
    const lower = outcome.toLowerCase()
    if (lower.includes("interested") && !lower.includes("not")) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
    if (lower.includes("not interested") || lower.includes("notinterested")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    if (lower.includes("callback") || lower.includes("info")) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    if (lower.includes("no answer")) return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Stage 1: New Lead
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Contact history for {lead.prospect_name || "this lead"}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{contactHistory.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Contacts</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {contactHistory.length > 0 ? formatDate(contactHistory[0].contacted_at).split(",")[0] : "-"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Last Contact</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {contactHistory.filter(c => c.ready_to_proceed).length > 0 ? "Yes" : "No"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Ready to Proceed</div>
        </div>
      </div>

      {/* Contact History */}
      {contactHistory.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No contact history yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Use the Contact Log feature to record interactions with this lead
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact History</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {contactHistory.map((entry) => (
              <div key={entry.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {entry.contact_type}
                      </span>
                      {entry.outcome && (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getOutcomeColor(entry.outcome)}`}>
                          {entry.outcome}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(entry.contacted_at)}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{entry.notes}</p>
                    )}
                    {/* Readiness indicators */}
                    {(entry.has_valid_passport || entry.has_education_docs || entry.has_funds || entry.ready_to_proceed) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.has_valid_passport && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded">
                            Passport
                          </span>
                        )}
                        {entry.has_education_docs && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded">
                            Education
                          </span>
                        )}
                        {entry.has_funds && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded">
                            Funds
                          </span>
                        )}
                        {entry.ready_to_proceed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                            Ready
                          </span>
                        )}
                      </div>
                    )}
                    {entry.intake_period && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Intake: {entry.intake_period}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium">Recording Contact</p>
            <p className="mt-1 text-amber-700 dark:text-amber-300">
              To log a new contact, use the Contact Log button in the lead card or the Overview tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
