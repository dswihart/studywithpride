"use client"

import { useState } from "react"
import { useLanguage } from "@/components/LanguageContext"

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
  contact_status: string
  notes: string | null
}

interface QuickContactLoggerProps {
  lead: Lead
  onClose: () => void
  onSuccess: () => void
}

type ContactOutcome =
  | "no_answer"
  | "voicemail"
  | "busy"
  | "wrong_number"
  | "answered_interested"
  | "answered_not_interested"
  | "answered_callback"
  | "answered_needs_info"
  | "message_sent"
  | "message_read"
  | "message_replied"

type FollowUpAction =
  | "call_back_today"
  | "call_back_tomorrow"
  | "call_back_3_days"
  | "call_back_1_week"
  | "send_info"
  | "send_application"
  | "schedule_meeting"
  | "no_followup"

interface ContactOutcomeOption {
  value: ContactOutcome
  label: string
  icon: string
  suggestedStatus: string
  suggestedFollowUp: FollowUpAction
}

const CONTACT_OUTCOMES: ContactOutcomeOption[] = [
  { value: "no_answer", label: "No Answer", icon: "📵", suggestedStatus: "contacted", suggestedFollowUp: "call_back_tomorrow" },
  { value: "voicemail", label: "Left Voicemail", icon: "📬", suggestedStatus: "contacted", suggestedFollowUp: "call_back_3_days" },
  { value: "busy", label: "Line Busy", icon: "📞", suggestedStatus: "contacted", suggestedFollowUp: "call_back_today" },
  { value: "wrong_number", label: "Wrong Number", icon: "❌", suggestedStatus: "unqualified", suggestedFollowUp: "no_followup" },
  { value: "answered_interested", label: "Interested!", icon: "🎯", suggestedStatus: "interested", suggestedFollowUp: "send_info" },
  { value: "answered_not_interested", label: "Not Interested", icon: "👎", suggestedStatus: "unqualified", suggestedFollowUp: "no_followup" },
  { value: "answered_callback", label: "Callback Requested", icon: "🔄", suggestedStatus: "contacted", suggestedFollowUp: "call_back_tomorrow" },
  { value: "answered_needs_info", label: "Needs More Info", icon: "📋", suggestedStatus: "contacted", suggestedFollowUp: "send_info" },
  { value: "message_sent", label: "WhatsApp Sent", icon: "💬", suggestedStatus: "contacted", suggestedFollowUp: "call_back_3_days" },
  { value: "message_read", label: "Message Read", icon: "👁️", suggestedStatus: "contacted", suggestedFollowUp: "call_back_tomorrow" },
  { value: "message_replied", label: "Got Reply!", icon: "✉️", suggestedStatus: "interested", suggestedFollowUp: "send_info" },
]

const FOLLOW_UP_ACTIONS: { value: FollowUpAction; label: string; days: number | null }[] = [
  { value: "call_back_today", label: "Call back today", days: 0 },
  { value: "call_back_tomorrow", label: "Call back tomorrow", days: 1 },
  { value: "call_back_3_days", label: "Call back in 3 days", days: 3 },
  { value: "call_back_1_week", label: "Call back in 1 week", days: 7 },
  { value: "send_info", label: "Send program info", days: null },
  { value: "send_application", label: "Send application link", days: null },
  { value: "schedule_meeting", label: "Schedule video call", days: null },
  { value: "no_followup", label: "No follow-up needed", days: null },
]

const STATUS_OPTIONS = [
  { value: "referral", label: "Referral", color: "bg-pink-500" },
  { value: "not_contacted", label: "Not Contacted", color: "bg-gray-500" },
  { value: "contacted", label: "Contacted", color: "bg-blue-500" },
  { value: "interested", label: "Interested", color: "bg-purple-500" },
  { value: "qualified", label: "Qualified", color: "bg-amber-500" },
  { value: "converted", label: "Converted", color: "bg-green-500" },
  { value: "unqualified", label: "Unqualified", color: "bg-red-500" },
]

export default function QuickContactLogger({ lead, onClose, onSuccess }: QuickContactLoggerProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedOutcome, setSelectedOutcome] = useState<ContactOutcome | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>(lead.contact_status)
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpAction | null>(null)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleOutcomeSelect = (outcome: ContactOutcomeOption) => {
    setSelectedOutcome(outcome.value)
    setSelectedStatus(outcome.suggestedStatus)
    setSelectedFollowUp(outcome.suggestedFollowUp)
    setStep(2)
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")

    try {
      // Build the note entry
      const outcomeOption = CONTACT_OUTCOMES.find(o => o.value === selectedOutcome)
      const followUpOption = FOLLOW_UP_ACTIONS.find(f => f.value === selectedFollowUp)

      const timestamp = new Date().toLocaleString()
      const noteEntry = [
        `[${timestamp}]`,
        `Contact: ${outcomeOption?.label || selectedOutcome}`,
        selectedFollowUp !== "no_followup" ? `Follow-up: ${followUpOption?.label}` : null,
        notes ? `Notes: ${notes}` : null,
      ].filter(Boolean).join(" | ")

      // Combine with existing notes
      const updatedNotes = lead.notes
        ? `${noteEntry}\n---\n${lead.notes}`
        : noteEntry

      // Update the lead
      const response = await fetch("/api/recruiter/leads-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          contact_status: selectedStatus,
          last_contact_date: new Date().toISOString(),
          notes: updatedNotes,
        }),
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.error || "Failed to save contact log")
      }
    } catch (err) {
      setError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Log Contact</h2>
              <p className="text-blue-100 text-sm">
                {lead.prospect_name || "Unknown"} - {lead.phone || lead.prospect_email || "No contact"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= s ? "bg-white text-blue-600" : "bg-blue-400 text-white"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-1 ${step > s ? "bg-white" : "bg-blue-400"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-blue-100 mt-1 px-1">
            <span>Outcome</span>
            <span>Status</span>
            <span>Follow-up</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Select Outcome */}
          {step === 1 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                What was the result of this contact?
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {CONTACT_OUTCOMES.map((outcome) => (
                  <button
                    key={outcome.value}
                    onClick={() => handleOutcomeSelect(outcome)}
                    className="p-3 text-left rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                  >
                    <span className="text-2xl mr-2">{outcome.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {outcome.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Confirm Status */}
          {step === 2 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Update lead status to:
              </h3>
              <div className="space-y-2 mb-4">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition flex items-center gap-3 ${
                      selectedStatus === status.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${status.color}`} />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {status.label}
                    </span>
                    {selectedStatus === status.value && (
                      <svg className="w-5 h-5 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Follow-up & Notes */}
          {step === 3 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                What's the next action?
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {FOLLOW_UP_ACTIONS.map((action) => (
                  <button
                    key={action.value}
                    onClick={() => setSelectedFollowUp(action.value)}
                    className={`p-2 text-left rounded-lg border-2 transition text-sm ${
                      selectedFollowUp === action.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-gray-700 dark:text-gray-300">{action.label}</span>
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any important details from the conversation..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Summary
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Outcome:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {CONTACT_OUTCOMES.find(o => o.value === selectedOutcome)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">New Status:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Follow-up:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {FOLLOW_UP_ACTIONS.find(f => f.value === selectedFollowUp)?.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Contact Log
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
