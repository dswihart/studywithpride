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
  recruit_priority: number | null
}

interface QuickContactLoggerProps {
  lead: Lead
  onClose: () => void
  onSuccess: () => void
  onCreateTask?: (taskData: TaskData) => void  // New callback for task creation
}

interface TaskData {
  lead_id: string
  lead_name: string
  title: string
  task_type: string
  priority: string
  due_days: number
}

type ContactOutcome =
  | "no_answer"
  | "no_answer_whatsapp_sent"
  | "whatsapp_replied_interested"
  | "whatsapp_replied_info"
  | "whatsapp_replied_not_interested"
  | "wrong_number"
  | "answered_interested"
  | "answered_not_interested"
  | "answered_callback"
  | "answered_needs_info"
  | "message_sent"
  | "message_read"

type FollowUpAction =
  | "send_info"
  | "send_application"
  | "call_back"

interface ContactOutcomeOption {
  value: ContactOutcome
  label: string
  icon: string
  suggestedStatus: string
  suggestedFollowUp: FollowUpAction
}

const CONTACT_OUTCOMES: ContactOutcomeOption[] = [
  // Most common flow: No answer -> WhatsApp
  { value: "no_answer_whatsapp_sent", label: "No Answer + WhatsApp Sent", icon: "📵💬", suggestedStatus: "contacted", suggestedFollowUp: "call_back" },
  // WhatsApp reply outcomes
  { value: "whatsapp_replied_interested", label: "WhatsApp Reply: Interested!", icon: "💬🎯", suggestedStatus: "interested", suggestedFollowUp: "send_info" },
  { value: "whatsapp_replied_info", label: "WhatsApp Reply: Shared Info", icon: "💬📋", suggestedStatus: "interested", suggestedFollowUp: "call_back" },
  { value: "whatsapp_replied_not_interested", label: "WhatsApp Reply: Not Interested", icon: "💬👎", suggestedStatus: "unqualified", suggestedFollowUp: "send_info" },
  // Original outcomes
  { value: "no_answer", label: "No Answer (only)", icon: "📵", suggestedStatus: "contacted", suggestedFollowUp: "send_info" },
  { value: "wrong_number", label: "Wrong Number", icon: "❌", suggestedStatus: "unqualified", suggestedFollowUp: "send_info" },
  { value: "answered_interested", label: "Call: Interested!", icon: "📞🎯", suggestedStatus: "interested", suggestedFollowUp: "send_info" },
  { value: "answered_not_interested", label: "Call: Not Interested", icon: "📞👎", suggestedStatus: "unqualified", suggestedFollowUp: "send_info" },
  { value: "answered_callback", label: "Call: Callback Requested", icon: "📞🔄", suggestedStatus: "contacted", suggestedFollowUp: "call_back" },
  { value: "answered_needs_info", label: "Call: Needs More Info", icon: "📞📋", suggestedStatus: "contacted", suggestedFollowUp: "send_info" },
  { value: "message_sent", label: "WhatsApp Sent (only)", icon: "💬", suggestedStatus: "contacted", suggestedFollowUp: "call_back" },
  { value: "message_read", label: "Message Read", icon: "👁️", suggestedStatus: "contacted", suggestedFollowUp: "call_back" },
]

const FOLLOW_UP_ACTIONS: { value: FollowUpAction; label: string; days: number | null; taskType: string }[] = [
  { value: "send_info", label: "Send program info", days: 0, taskType: "email" },
  { value: "send_application", label: "Send application link", days: 0, taskType: "email" },
  { value: "call_back", label: "Call back", days: 1, taskType: "call" },
]

const CALLBACK_TIMES = [
  { value: "today", label: "Today", days: 0 },
  { value: "tomorrow", label: "Tomorrow", days: 1 },
  { value: "3_days", label: "In 3 days", days: 3 },
  { value: "1_week", label: "In 1 week", days: 7 },
]

const STATUS_OPTIONS = [
  { value: "referral", label: "Referral", color: "bg-pink-500" },
  { value: "not_contacted", label: "Not Contacted", color: "bg-gray-500" },
  { value: "contacted", label: "Contacted", color: "bg-blue-500" },
  { value: "interested", label: "Interested", color: "bg-purple-500" },
  { value: "unqualified", label: "Unqualified", color: "bg-red-500" },
]

export default function QuickContactLogger({ lead, onClose, onSuccess, onCreateTask }: QuickContactLoggerProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedOutcome, setSelectedOutcome] = useState<ContactOutcome | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>(lead.contact_status)
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpAction | null>(null)
  const [callbackTime, setCallbackTime] = useState<string>("tomorrow")
  const [notes, setNotes] = useState("")
  const [createTask, setCreateTask] = useState(true)  // New state for task creation toggle
  const [recruitPriority, setRecruitPriority] = useState<number | null>(lead.recruit_priority || null)
  const [referralDestination, setReferralDestination] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Additional fields for WhatsApp reply details

  const handleOutcomeSelect = (outcome: ContactOutcomeOption) => {
    setSelectedOutcome(outcome.value)
    setSelectedStatus(outcome.suggestedStatus)
    setSelectedFollowUp(outcome.suggestedFollowUp)
    // Enable task creation for all follow-up actions
    setCreateTask(true)
    setStep(2)
  }

  const handleSave = async () => {
    // Validate referral destination if referral status selected
    if (selectedStatus === "referral" && !referralDestination.trim()) {
      setError("Please enter a referral destination")
      return
    }

    setSaving(true)
    setError("")

    try {
      const outcomeOption = CONTACT_OUTCOMES.find(o => o.value === selectedOutcome)
      const followUpOption = FOLLOW_UP_ACTIONS.find(f => f.value === selectedFollowUp)

      // Build follow-up label
      let followUpLabel = followUpOption?.label
      if (selectedFollowUp === 'call_back') {
        const timeOption = CALLBACK_TIMES.find(t => t.value === callbackTime)
        followUpLabel = `Call back ${timeOption?.label.toLowerCase()}`
      }

      // 1. Save to contact_history table
      const contactLogResponse = await fetch("/api/recruiter/contact-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          contact_type: "call",
          outcome: outcomeOption?.label || selectedOutcome,
          notes: notes || null,
          follow_up_action: followUpLabel || null,
        }),
      })

      if (!contactLogResponse.ok) {
        const logError = await contactLogResponse.json()
        throw new Error(logError.error || "Failed to save contact log")
      }

      // 2. Update the lead status (without modifying notes)
      const response = await fetch("/api/recruiter/leads-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          contact_status: selectedStatus,
          last_contact_date: new Date().toISOString(),
          recruit_priority: recruitPriority,
          ...(selectedStatus === "referral" && referralDestination ? { referral_source: referralDestination } : {}),
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Create follow-up task if enabled and there's a follow-up action
        if (createTask && selectedFollowUp && onCreateTask) {
          let taskDays = 0
          let taskTitle = ''
          let taskType = 'call'

          if (selectedFollowUp === 'call_back') {
            const timeOption = CALLBACK_TIMES.find(t => t.value === callbackTime)
            taskDays = timeOption?.days ?? 1
            taskTitle = `Call back ${timeOption?.label.toLowerCase()} - `
          } else {
            const followUpData = FOLLOW_UP_ACTIONS.find(f => f.value === selectedFollowUp)
            taskDays = followUpData?.days ?? 0
            taskTitle = `${followUpData?.label} - `
            taskType = followUpData?.taskType ?? 'call'
          }

          const leadName = lead.prospect_name || lead.prospect_email || 'Unknown'
          onCreateTask({
            lead_id: lead.id,
            lead_name: leadName,
            title: taskTitle + leadName,
            task_type: taskType,
            priority: selectedStatus === 'interested' ? 'high' : 'medium',
            due_days: taskDays
          })
        }

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

              {/* Referral Destination Input - shown when referral status selected */}
              {selectedStatus === "referral" && (
                <div className="mt-4 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                  <label className="block text-sm font-medium text-pink-700 dark:text-pink-300 mb-2">
                    Referral Destination <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={referralDestination}
                    onChange={(e) => setReferralDestination(e.target.value)}
                    placeholder="e.g., Partner School Name, Agency, etc."
                    className="w-full px-3 py-2 border border-pink-300 dark:border-pink-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    required
                  />
                  <p className="mt-1 text-xs text-pink-600 dark:text-pink-400">
                    Where is this lead being referred to?
                  </p>
                </div>
              )}
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
                {FOLLOW_UP_ACTIONS.filter(a => a.value !== "call_back").map((action) => (
                  <button
                    key={action.value}
                    onClick={() => {
                      setSelectedFollowUp(action.value)
                      setCreateTask(true)
                    }}
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

              {/* Call back option with time selection */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    setSelectedFollowUp("call_back")
                    setCreateTask(true)
                  }}
                  className={`w-full p-3 text-left rounded-lg border-2 transition ${
                    selectedFollowUp === "call_back"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">📞 Call back</span>
                </button>

                {selectedFollowUp === "call_back" && (
                  <div className="mt-2 ml-4 space-y-2">
                    {CALLBACK_TIMES.map((time) => (
                      <label key={time.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="callbackTime"
                          value={time.value}
                          checked={callbackTime === time.value}
                          onChange={(e) => setCallbackTime(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{time.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Recruit Priority Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rate this recruit (1-5 stars)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRecruitPriority(recruitPriority === star ? null : star)}
                      className={`p-2 text-3xl transition-transform hover:scale-110 ${
                        recruitPriority && recruitPriority >= star
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                  {recruitPriority && (
                    <span className="ml-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      {recruitPriority === 5 && "🔥 Hot lead!"}
                      {recruitPriority === 4 && "Very interested"}
                      {recruitPriority === 3 && "Good potential"}
                      {recruitPriority === 2 && "Needs follow-up"}
                      {recruitPriority === 1 && "Low priority"}
                    </span>
                  )}
                </div>
              </div>

              {/* Create Task Toggle */}
              {selectedFollowUp && onCreateTask && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createTask}
                      onChange={(e) => setCreateTask(e.target.checked)}
                      className="w-5 h-5 rounded border-green-400 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <span className="font-medium text-green-800 dark:text-green-300">
                        Create follow-up task
                      </span>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Automatically create a task for this follow-up action
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* WhatsApp Reply Details Section */}
              

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
                      {selectedFollowUp === "call_back"
                        ? `Call back ${CALLBACK_TIMES.find(t => t.value === callbackTime)?.label.toLowerCase()}`
                        : FOLLOW_UP_ACTIONS.find(f => f.value === selectedFollowUp)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {recruitPriority ? "⭐".repeat(recruitPriority) : "Not set"}
                    </span>
                  </div>
                  {createTask && selectedFollowUp && onCreateTask && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Task:</span>
                      <span className="font-medium">Will be created</span>
                    </div>
                  )}
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
