"use client"

import { useToast } from '@/components/ui/Toast'

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
  onCreateTask?: (taskData: TaskData) => void
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
  | "no_answer_whatsapp_sent"
  | "no_answer"
  | "no_whatsapp"
  | "whatsapp_replied_interested"
  | "whatsapp_replied_info"
  | "whatsapp_replied_not_interested"
  | "wrong_number"
  | "answered_interested"
  | "answered_not_interested"
  | "answered_callback"
  | "answered_needs_info"
  | "message_sent"
  | "unqualified_other"

type FollowUpAction = "call" | "whatsapp" | "email" | "none"

type SecondaryCategory = "answered" | "whatsapp_reply" | "problem" | null

interface ContactOutcomeOption {
  value: ContactOutcome
  label: string
  icon: string
  suggestedStatus: string
  suggestedFollowUp: FollowUpAction
}

const ANSWERED_OUTCOMES: ContactOutcomeOption[] = [
  { value: "answered_interested", label: "Interested!", icon: "🎯", suggestedStatus: "interested", suggestedFollowUp: "email" },
  { value: "answered_callback", label: "Callback Requested", icon: "🔄", suggestedStatus: "contacted", suggestedFollowUp: "call" },
  { value: "answered_needs_info", label: "Needs More Info", icon: "📋", suggestedStatus: "contacted", suggestedFollowUp: "email" },
  { value: "answered_not_interested", label: "Not Interested", icon: "👎", suggestedStatus: "notinterested", suggestedFollowUp: "none" },
]

const WHATSAPP_REPLY_OUTCOMES: ContactOutcomeOption[] = [
  { value: "whatsapp_replied_interested", label: "Interested!", icon: "🎯", suggestedStatus: "interested", suggestedFollowUp: "call" },
  { value: "whatsapp_replied_info", label: "Shared Info", icon: "📋", suggestedStatus: "contacted", suggestedFollowUp: "call" },
  { value: "whatsapp_replied_not_interested", label: "Not Interested", icon: "👎", suggestedStatus: "notinterested", suggestedFollowUp: "none" },
]

const PROBLEM_OUTCOMES: ContactOutcomeOption[] = [
  { value: "wrong_number", label: "Wrong Number", icon: "❌", suggestedStatus: "wrongnumber", suggestedFollowUp: "none" },
  { value: "no_whatsapp", label: "No WhatsApp on Number", icon: "🚫", suggestedStatus: "contacted", suggestedFollowUp: "call" },
  { value: "no_answer", label: "No Answer (did not send WhatsApp)", icon: "📵", suggestedStatus: "contacted", suggestedFollowUp: "whatsapp" },
  { value: "unqualified_other", label: "Unqualified - Other", icon: "⛔", suggestedStatus: "unqualified", suggestedFollowUp: "none" },
]

const PRIMARY_OUTCOME: ContactOutcomeOption = {
  value: "no_answer_whatsapp_sent",
  label: "No Answer + WhatsApp Sent",
  icon: "📵💬",
  suggestedStatus: "contacted",
  suggestedFollowUp: "call"
}

const FOLLOW_UP_ACTIONS: { value: FollowUpAction; label: string; icon: string; taskType: string }[] = [
  { value: "call", label: "Call", icon: "📞", taskType: "call" },
  { value: "whatsapp", label: "WhatsApp", icon: "💬", taskType: "whatsapp" },
  { value: "email", label: "Email", icon: "📧", taskType: "email" },
  { value: "none", label: "None", icon: "⏸️", taskType: "none" },
]

const FOLLOW_UP_TIMES = [
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
  { value: "qualified", label: "Qualified", color: "bg-green-500" },
  { value: "unqualified", label: "Unqualified", color: "bg-red-500" },
  { value: "notinterested", label: "Not Interested", color: "bg-orange-500" },
  { value: "wrongnumber", label: "Wrong Number", color: "bg-gray-600" },
]

export default function QuickContactLogger({ lead, onClose, onSuccess, onCreateTask }: QuickContactLoggerProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedOutcome, setSelectedOutcome] = useState<ContactOutcome | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>(lead.contact_status)
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpAction | null>(null)
  const [followUpTime, setFollowUpTime] = useState<string>("tomorrow")
  const [notes, setNotes] = useState("")
  const [createTask, setCreateTask] = useState(true)
  const [recruitPriority, setRecruitPriority] = useState<number | null>(lead.recruit_priority || null)
  const [showChecklist, setShowChecklist] = useState(false)
  const [referralDestination, setReferralDestination] = useState<string>("")
  const [expandedCategory, setExpandedCategory] = useState<SecondaryCategory>(null)
  const [meetsEducationLevel, setMeetsEducationLevel] = useState(false)
  const [englishLevelBasic, setEnglishLevelBasic] = useState(false)
  const [hasValidPassport, setHasValidPassport] = useState(false)
  const [confirmedFinancialSupport, setConfirmedFinancialSupport] = useState(false)
  const [intakePeriod, setIntakePeriod] = useState("")
  const [readyToProceed, setReadyToProceed] = useState(false)
  const [readinessComments, setReadinessComments] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleOutcomeSelect = async (outcome: ContactOutcomeOption) => {
    setSelectedOutcome(outcome.value)
    setSelectedStatus(outcome.suggestedStatus)
    setSelectedFollowUp(outcome.suggestedFollowUp)

    const terminalOutcomes = ["answered_not_interested", "whatsapp_replied_not_interested", "wrong_number", "unqualified_other"]

    if (terminalOutcomes.includes(outcome.value)) {
      setCreateTask(false)
      setSaving(true)
      setError("")

      try {
        await fetch("/api/recruiter/contact-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead_id: lead.id,
            contact_type: "call",
            outcome: outcome.label,
            notes: null,
            follow_up_action: null,
          }),
        })

        await fetch("/api/recruiter/leads-write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: lead.id,
            contact_status: outcome.suggestedStatus,
            last_contact_date: new Date().toISOString(),
          }),
        })

        onSuccess()
        onClose()
      } catch (err) {
        setError("Failed to save. Please try again.")
        setSaving(false)
      }
      return
    }

    setCreateTask(true)
    setStep(2)
  }

  const handlePrimaryAction = () => {
    handleOutcomeSelect(PRIMARY_OUTCOME)
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")

    try {
      const allOutcomes = [PRIMARY_OUTCOME, ...ANSWERED_OUTCOMES, ...WHATSAPP_REPLY_OUTCOMES, ...PROBLEM_OUTCOMES]
      const outcomeOption = allOutcomes.find(o => o.value === selectedOutcome)
      const followUpOption = FOLLOW_UP_ACTIONS.find(f => f.value === selectedFollowUp)
      const timeOption = FOLLOW_UP_TIMES.find(t => t.value === followUpTime)

      const followUpLabel = selectedFollowUp === "none"
        ? "No follow-up"
        : (followUpOption?.label || "") + " - " + (timeOption?.label || "")

      const contactLogResponse = await fetch("/api/recruiter/contact-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          contact_type: "call",
          outcome: outcomeOption?.label || selectedOutcome,
          notes: notes || null,
          follow_up_action: followUpLabel || null,
          meets_education_level: meetsEducationLevel,
          english_level_basic: englishLevelBasic,
          has_valid_passport: hasValidPassport,
          confirmed_financial_support: confirmedFinancialSupport,
          ready_to_proceed: readyToProceed,
          readiness_comments: readinessComments || null,
          intake_period: intakePeriod || null,
        }),
      })

      if (!contactLogResponse.ok) {
        const logError = await contactLogResponse.json()
        throw new Error(logError.error || "Failed to save contact log")
      }

      let finalStatus = selectedStatus
      if (readyToProceed && selectedStatus !== "referral") {
        finalStatus = "qualified"
      } else if (selectedStatus === "referral") {
        finalStatus = "archived_referral"
      }

      const response = await fetch("/api/recruiter/leads-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          contact_status: finalStatus,
          last_contact_date: new Date().toISOString(),
          recruit_priority: readyToProceed ? 5 : recruitPriority,
          ...(selectedStatus === "referral" && referralDestination ? { referral_source: referralDestination } : {}),
        }),
      })

      const result = await response.json()

      if (result.success) {
        const leadName = lead.prospect_name || lead.prospect_email || "Unknown"

        if (createTask && selectedFollowUp && selectedFollowUp !== "none" && onCreateTask) {
          const followUpData = FOLLOW_UP_ACTIONS.find(f => f.value === selectedFollowUp)
          const timeData = FOLLOW_UP_TIMES.find(t => t.value === followUpTime)
          const taskDays = timeData?.days ?? 1
          const taskType = followUpData?.taskType ?? "call"
          const timeLabel = timeData?.label || "tomorrow"
          const taskTitle = (followUpData?.label || "Follow up") + " " + timeLabel.toLowerCase() + " - " + leadName

          onCreateTask({
            lead_id: lead.id,
            lead_name: leadName,
            title: taskTitle,
            task_type: taskType,
            priority: selectedStatus === "interested" ? "high" : "medium",
            due_days: taskDays
          })
        }

        if (readyToProceed && onCreateTask) {
          onCreateTask({
            lead_id: lead.id,
            lead_name: leadName,
            title: "Send application - " + leadName,
            task_type: "application",
            priority: "high",
            due_days: 0
          })
        }

        if (readyToProceed) {
          try {
            await fetch("/api/recruiter/convert-to-student", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lead_id: lead.id,
                intake_period: intakePeriod || null,
                readiness_comments: readinessComments || null
              }),
            })
          } catch (convErr) {
            console.warn("Student conversion failed:", convErr)
          }
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

  const getOutcomeLabel = () => {
    const allOutcomes = [PRIMARY_OUTCOME, ...ANSWERED_OUTCOMES, ...WHATSAPP_REPLY_OUTCOMES, ...PROBLEM_OUTCOMES]
    const found = allOutcomes.find(o => o.value === selectedOutcome)
    return found?.label || ""
  }

  const getFollowUpSummary = () => {
    if (selectedFollowUp === "none") return "No follow-up"
    const action = FOLLOW_UP_ACTIONS.find(f => f.value === selectedFollowUp)
    const time = FOLLOW_UP_TIMES.find(t => t.value === followUpTime)
    return (action?.label || "") + " - " + (time?.label || "")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Log Contact</h2>
              <p className="text-blue-100 text-sm">
                {lead.prospect_name || "Unknown"} - {lead.phone || lead.prospect_email || "No contact"}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                <div className="text-center mb-3">
                  <span className="text-3xl">📵💬</span>
                  <h3 className="font-bold text-gray-900 dark:text-white mt-2">No Answer + WhatsApp Sent</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Most common outcome</p>
                </div>
                <button
                  onClick={handlePrimaryAction}
                  disabled={saving}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Log & Continue
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Something different?</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === "answered" ? null : "answered")}
                  className={`p-4 rounded-xl border-2 transition text-center ${expandedCategory === "answered" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
                >
                  <span className="text-2xl block mb-1">📞</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">They Answered</span>
                </button>

                <button
                  onClick={() => setExpandedCategory(expandedCategory === "whatsapp_reply" ? null : "whatsapp_reply")}
                  className={`p-4 rounded-xl border-2 transition text-center ${expandedCategory === "whatsapp_reply" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
                >
                  <span className="text-2xl block mb-1">💬</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp Reply</span>
                </button>

                <button
                  onClick={() => setExpandedCategory(expandedCategory === "problem" ? null : "problem")}
                  className={`p-4 rounded-xl border-2 transition text-center ${expandedCategory === "problem" ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
                >
                  <span className="text-2xl block mb-1">⚠️</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Problem</span>
                </button>
              </div>

              {expandedCategory && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-2">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    {expandedCategory === "answered" && "📞 What happened on the call?"}
                    {expandedCategory === "whatsapp_reply" && "💬 What did they say?"}
                    {expandedCategory === "problem" && "⚠️ What was the issue?"}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {expandedCategory === "answered" && ANSWERED_OUTCOMES.map((outcome) => (
                      <button key={outcome.value} onClick={() => handleOutcomeSelect(outcome)} disabled={saving} className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center gap-2">
                        <span className="text-xl">{outcome.icon}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{outcome.label}</span>
                      </button>
                    ))}
                    {expandedCategory === "whatsapp_reply" && WHATSAPP_REPLY_OUTCOMES.map((outcome) => (
                      <button key={outcome.value} onClick={() => handleOutcomeSelect(outcome)} disabled={saving} className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center gap-2">
                        <span className="text-xl">{outcome.icon}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{outcome.label}</span>
                      </button>
                    ))}
                    {expandedCategory === "problem" && PROBLEM_OUTCOMES.map((outcome) => (
                      <button key={outcome.value} onClick={() => handleOutcomeSelect(outcome)} disabled={saving} className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition flex items-center gap-2">
                        <span className="text-xl">{outcome.icon}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{outcome.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What is the next action?</h3>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {FOLLOW_UP_ACTIONS.map((action) => (
                  <button
                    key={action.value}
                    onClick={() => { setSelectedFollowUp(action.value); setCreateTask(action.value !== "none") }}
                    className={`p-3 text-center rounded-lg border-2 transition ${selectedFollowUp === action.value ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
                  >
                    <span className="text-2xl block mb-1">{action.icon}</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                  </button>
                ))}
              </div>

              {selectedFollowUp && selectedFollowUp !== "none" && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">When?</label>
                  <div className="grid grid-cols-4 gap-2">
                    {FOLLOW_UP_TIMES.map((time) => (
                      <button key={time.value} onClick={() => setFollowUpTime(time.value)} className={`p-2 text-center rounded-lg border-2 transition text-sm ${followUpTime === time.value ? "border-blue-500 bg-blue-100 dark:bg-blue-900/30" : "border-gray-200 dark:border-gray-600 hover:border-gray-300"}`}>
                        <span className="text-gray-700 dark:text-gray-300">{time.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedFollowUp && selectedFollowUp !== "none" && onCreateTask && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={createTask} onChange={(e) => setCreateTask(e.target.checked)} className="w-5 h-5 rounded border-green-400 text-green-600 focus:ring-green-500" />
                    <div>
                      <span className="font-medium text-green-800 dark:text-green-300">Create follow-up task</span>
                      <p className="text-xs text-green-600 dark:text-green-400">Automatically create a task for this follow-up action</p>
                    </div>
                  </label>
                </div>
              )}

              <div className="mb-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRecruitPriority(recruitPriority ? null : 1)}
                  className={`flex-1 p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${recruitPriority ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20" : "border-gray-200 dark:border-gray-700 hover:border-yellow-300"}`}
                >
                  <span className={`text-xl ${recruitPriority ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                  <span className={`text-sm font-medium ${recruitPriority ? "text-yellow-700 dark:text-yellow-300" : "text-gray-500 dark:text-gray-400"}`}>
                    {recruitPriority ? "VIP" : "VIP"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setReadyToProceed(!readyToProceed)}
                  className={`flex-[2] p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${readyToProceed ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700 hover:border-green-300"}`}
                >
                  <span className={`text-xl ${readyToProceed ? "text-green-500" : "text-gray-300"}`}>✓</span>
                  <span className={`text-sm font-medium ${readyToProceed ? "text-green-700 dark:text-green-300" : "text-gray-500 dark:text-gray-400"}`}>
                    {readyToProceed ? "Ready to Proceed" : "Ready to Proceed"}
                  </span>
                </button>
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowChecklist(!showChecklist)}
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span>📋</span> Lead Readiness Checklist
                  </span>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${showChecklist ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showChecklist && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={meetsEducationLevel} onChange={(e) => setMeetsEducationLevel(e.target.checked)} className="w-5 h-5 rounded text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Meets minimum education level</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={englishLevelBasic} onChange={(e) => setEnglishLevelBasic(e.target.checked)} className="w-5 h-5 rounded text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">English level of Basic</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={hasValidPassport} onChange={(e) => setHasValidPassport(e.target.checked)} className="w-5 h-5 rounded text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Valid Passport</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={confirmedFinancialSupport} onChange={(e) => setConfirmedFinancialSupport(e.target.checked)} className="w-5 h-5 rounded text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Confirmed financial support</span>
                    </label>
                    
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any important details from the conversation..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={3} />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Outcome:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{getOutcomeLabel()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">New Status:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Follow-up:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{getFollowUpSummary()}</span>
                  </div>
                  {createTask && selectedFollowUp && selectedFollowUp !== "none" && onCreateTask && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Task:</span>
                      <span className="font-medium">Will be created</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setStep(1); setExpandedCategory(null) }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Back</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50">
                  {saving ? "Saving..." : "Save Contact Log"}
                </button>
              </div>
            </div>
          )}

          
        </div>
      </div>
    </div>
  )
}
