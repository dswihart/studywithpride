"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
  contact_status: string
  notes: string | null
  recruit_priority: number | null
}

interface SmartContactLoggerProps {
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

interface ActionOption {
  id: string
  label: string
  icon: string
  keywords: string[]
  status: string
  followUp: "call" | "whatsapp" | "email" | "none"
  followUpDays: number
  category: "common" | "positive" | "negative" | "problem"
  quickLog?: boolean
}

const ACTIONS: ActionOption[] = [
  // Most common
  { id: "no_answer_wa", label: "No Answer - Send WhatsApp", icon: "📵💬", keywords: ["no answer", "no response", "didn't answer", "voicemail", "na"], status: "contacted", followUp: "call", followUpDays: 1, category: "common" },
  { id: "voicemail", label: "Called - Left Voicemail/No Answer", icon: "📞❌", keywords: ["voicemail", "left message", "no answer", "called", "vm", "didnt pick up"], status: "contacted", followUp: "none", followUpDays: 0, category: "common", quickLog: true },

  // Positive outcomes
  { id: "interested_call", label: "Interested! (from call)", icon: "🎯", keywords: ["interested", "wants", "yes", "sign up", "enroll"], status: "interested", followUp: "email", followUpDays: 1, category: "positive" },
  { id: "interested_wa", label: "Interested! (WhatsApp reply)", icon: "🎯💬", keywords: ["interested whatsapp", "wa interested", "replied interested"], status: "interested", followUp: "call", followUpDays: 0, category: "positive" },
  { id: "callback", label: "Callback Requested", icon: "🔄", keywords: ["callback", "call back", "call later", "busy", "call again"], status: "contacted", followUp: "call", followUpDays: 1, category: "positive" },
  { id: "send_info", label: "Send More Info", icon: "📤", keywords: ["send info", "more info", "information", "details", "brochure"], status: "interested", followUp: "email", followUpDays: 1, category: "positive" },
  { id: "shared_info", label: "Shared Info - Follow Up", icon: "📋", keywords: ["shared", "sent", "emailed", "gave info"], status: "contacted", followUp: "call", followUpDays: 2, category: "positive" },

  // Negative outcomes
  { id: "not_interested", label: "Not Interested", icon: "👎", keywords: ["not interested", "no thanks", "decline", "refused"], status: "archived", followUp: "none", followUpDays: 0, category: "negative" },
  { id: "unqualified", label: "Unqualified", icon: "⛔", keywords: ["unqualified", "doesnt qualify", "not eligible"], status: "archived", followUp: "none", followUpDays: 0, category: "negative" },

  // Problems
  { id: "wrong_number", label: "Wrong Number", icon: "❌", keywords: ["wrong number", "wrong", "invalid", "disconnected"], status: "wrongnumber", followUp: "none", followUpDays: 0, category: "problem" },
  { id: "no_whatsapp", label: "No WhatsApp on Number", icon: "🚫", keywords: ["no whatsapp", "no wa", "cant message"], status: "contacted", followUp: "call", followUpDays: 1, category: "problem" },
]

const FOLLOW_UP_OPTIONS = [
  { value: 0, label: "Today" },
  { value: 1, label: "Tomorrow" },
  { value: -1, label: "days" },
]


const HOUR_OPTIONS = [1, 2, 3, 4, 5]


export default function SmartContactLogger({ lead, onClose, onSuccess, onCreateTask }: SmartContactLoggerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAction, setSelectedAction] = useState<ActionOption | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [followUpDays, setFollowUpDays] = useState(1)
  const [notes, setNotes] = useState("")
  const [showNotes, setShowNotes] = useState(false)
  const [followUpHours, setFollowUpHours] = useState(1)
  const [customDays, setCustomDays] = useState(3)
  // Readiness checklist
  const [showChecklist, setShowChecklist] = useState(false)
  const [hasEducationDocs, setHasEducationDocs] = useState(false)
  const [hasValidPassport, setHasValidPassport] = useState(false)
  const [hasEnglishLevel, setHasEnglishLevel] = useState(false)
  const [hasFunds, setHasFunds] = useState(false)
  const [createTask, setCreateTask] = useState(false)
  const [flagFollowup, setFlagFollowup] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [recruitPriority, setRecruitPriority] = useState<number | null>(lead.recruit_priority || null)


  // Helper to get actual follow-up days
  const getActualFollowUpDays = () => followUpDays === -1 ? customDays : followUpDays

  // Helper to get follow-up action text
  const getFollowUpText = () => {
    if (followUpDays === 0) return "Follow up today in " + followUpHours + " hour(s)"
    if (followUpDays === -1) return "Follow up in " + customDays + " day(s)"
    if (followUpDays > 0) return "Follow up in " + followUpDays + " day(s)"
    return "No follow-up"
  }
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Filter actions based on search
  const filteredActions = searchTerm.trim()
    ? ACTIONS.filter(action =>
        action.keywords.some(kw => kw.includes(searchTerm.toLowerCase())) ||
        action.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : ACTIONS

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0)
  }, [searchTerm])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (selectedAction) {
      if (e.key === "Escape") {
        setSelectedAction(null)
        setSearchTerm("")
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex(prev => Math.min(prev + 1, filteredActions.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex(prev => Math.max(prev - 1, 0))
        break
      case "Enter":
        e.preventDefault()
        if (filteredActions[highlightedIndex]) {
          selectAction(filteredActions[highlightedIndex])
        }
        break
      case "Escape":
        onClose()
        break
    }
  }, [filteredActions, highlightedIndex, selectedAction, onClose])

  const selectAction = async (action: ActionOption) => {
    setSelectedAction(action)
    setFollowUpDays(action.followUpDays)
    setFlagFollowup(false)
    
    // Quick log actions save immediately with API flag
    if (action.quickLog) {
      setSaving(true)
      try {
        const contactRes = await fetch("/api/recruiter/contact-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead_id: lead.id,
            contact_type: "call",
            outcome: action.label,
            notes: null,
            follow_up_action: "Flag for API callback",
            flag_followup: true,
          }),
        })
        if (!contactRes.ok) throw new Error("Failed to log contact")
        
        const statusRes = await fetch("/api/recruiter/leads-write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: lead.id,
            contact_status: action.status,
          }),
        })
        if (!statusRes.ok) throw new Error("Failed to update status")
        
        onSuccess?.()
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save")
        setSaving(false)
      }
      return
    }
  }

  const handleSave = async () => {
    if (!selectedAction) return
    setSaving(true)
    setError("")

    try {
      // Log the contact
      const contactRes = await fetch("/api/recruiter/contact-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          contact_type: "call",
          outcome: selectedAction.label,
          notes: notes || null,
          follow_up_action: getFollowUpText(),
          flag_followup: flagFollowup,
          has_education_docs: hasEducationDocs,
          has_valid_passport: hasValidPassport,
          ready_to_proceed: hasEnglishLevel,
          has_funds: hasFunds,
        }),
      })

      if (!contactRes.ok) {
        const err = await contactRes.json()
        throw new Error(err.error || "Failed to log contact")
      }

      // Update lead status and VIP priority
      const statusRes = await fetch("/api/recruiter/leads-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          contact_status: selectedAction.status,
          last_contact_date: new Date().toISOString(),
          recruit_priority: recruitPriority,
        }),
      })

      if (!statusRes.ok) {
        console.error("Failed to update lead status")
      }

      // Create task if enabled
      if (createTask && getActualFollowUpDays() > 0 && onCreateTask) {
        const leadName = lead.prospect_name || lead.prospect_email || "Unknown"
        onCreateTask({
          lead_id: lead.id,
          lead_name: leadName,
          title: `Follow up: ${selectedAction.label} - ${leadName}`,
          task_type: selectedAction.followUp,
          priority: selectedAction.category === "positive" ? "high" : "medium",
          due_days: getActualFollowUpDays(),
        })
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Log Contact</h2>
              <p className="text-blue-100 text-sm flex items-center gap-2">
                <span>📞</span>
                {lead.prospect_name || "Unknown"} {lead.phone && `• ${lead.phone}`}
                {recruitPriority && <span className="text-yellow-300">★ VIP</span>}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {!selectedAction ? (
          /* Search & Select View */
          <div className="p-4">
            {/* Search Input */}
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="What happened? Type or select..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-0 text-lg"
              />
            </div>

            {/* Action List */}
            <div ref={listRef} className="max-h-[300px] overflow-y-auto space-y-1">
              {!searchTerm && (
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2 px-2">Quick Actions</p>
              )}

              {filteredActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => selectAction(action)}
                  className={`w-full p-4 rounded-xl text-left transition flex items-center gap-3 ${
                    index === highlightedIndex
                      ? "bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent"
                  }`}
                >
                  <span className="text-3xl">{action.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                    {action.followUpDays > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        → {action.followUp} follow-up in {action.followUpDays} day(s)
                      </p>
                    )}
                  </div>
                  {index === 0 && !searchTerm && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      Most used
                    </span>
                  )}
                </button>
              ))}

              {filteredActions.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No matching actions. Try different keywords.
                </p>
              )}
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
              ↑↓ Navigate • Enter to select • Esc to close
            </p>
          </div>
        ) : (
          /* Confirm & Save View */
          <div className="p-4 space-y-4">
            {/* Selected Action */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedAction.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedAction.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status → <span className="font-medium text-blue-600 dark:text-blue-400">{selectedAction.status}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedAction(null); setSearchTerm(""); }}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Change action
              </button>
            </div>

            {/* VIP Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority Status
              </label>
              <button
                type="button"
                onClick={() => setRecruitPriority(recruitPriority ? null : 1)}
                className={`w-full p-4 rounded-xl border-2 transition flex items-center justify-center gap-2 ${
                  recruitPriority
                    ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-yellow-300"
                }`}
              >
                <span className={`text-xl ${recruitPriority ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                <span className={`text-sm font-medium ${recruitPriority ? "text-yellow-700 dark:text-yellow-300" : "text-gray-500 dark:text-gray-400"}`}>
                  {recruitPriority ? "VIP Lead" : "Mark as VIP"}
                </span>
              </button>
            </div>

            {/* Follow-up Options - Tablet Friendly */}
            {!selectedAction.quickLog && selectedAction.followUp !== "none" && (
              <div className="space-y-4">
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                  ⏰ Follow-up in
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Today button */}
                  <button
                    onClick={() => setFollowUpDays(0)}
                    className={`py-4 px-4 rounded-xl border-2 text-base font-semibold transition-all active:scale-95 ${
                      followUpDays === 0
                        ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-md"
                        : "border-gray-200 dark:border-gray-600 hover:border-blue-300 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                    }`}
                  >
                    Today
                  </button>
                  
                  {/* Tomorrow button */}
                  <button
                    onClick={() => setFollowUpDays(1)}
                    className={`py-4 px-4 rounded-xl border-2 text-base font-semibold transition-all active:scale-95 ${
                      followUpDays === 1
                        ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-md"
                        : "border-gray-200 dark:border-gray-600 hover:border-blue-300 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                    }`}
                  >
                    Tomorrow
                  </button>
                  
                  {/* Editable days button */}
                  <button
                    onClick={() => setFollowUpDays(-1)}
                    className={`py-4 px-4 rounded-xl border-2 text-base font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      followUpDays === -1
                        ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-md"
                        : "border-gray-200 dark:border-gray-600 hover:border-blue-300 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <input
                      type="number"
                      min="2"
                      max="30"
                      value={customDays}
                      onClick={(e) => { e.stopPropagation(); setFollowUpDays(-1); }}
                      onChange={e => setCustomDays(Math.max(2, parseInt(e.target.value) || 2))}
                      className="w-10 bg-transparent text-center outline-none font-bold text-lg"
                    />
                    <span>days</span>
                  </button>
                </div>
                
                {/* Hours picker for Today - Large buttons */}
                {followUpDays === 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Select hours:</span>
                    <div className="grid grid-cols-5 gap-2">
                      {HOUR_OPTIONS.map(h => (
                        <button
                          key={h}
                          onClick={() => setFollowUpHours(h)}
                          className={`py-3 rounded-xl border-2 text-base font-semibold transition-all active:scale-95 ${
                            followUpHours === h
                              ? "border-blue-500 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-md"
                              : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800"
                          }`}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Notes - Collapsible */}
            <div>
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                📝 Notes (optional)
                <svg className={`w-4 h-4 transition-transform ${showNotes ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showNotes && (
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any important details..."
                  className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              )}
            </div>

            {/* Readiness Checklist - Collapsible */}
            <div>
              <button
                type="button"
                onClick={() => setShowChecklist(!showChecklist)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                📋 Readiness Checklist
                <svg className={`w-4 h-4 transition-transform ${showChecklist ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showChecklist && (
                <div className="mt-2 space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={hasEducationDocs} onChange={e => setHasEducationDocs(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Education Docs</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={hasValidPassport} onChange={e => setHasValidPassport(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Valid Passport</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={hasEnglishLevel} onChange={e => setHasEnglishLevel(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">English Level</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={hasFunds} onChange={e => setHasFunds(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Has Funds</span>
                  </label>
                </div>
              )}
            </div>
            {/* Options */}
            <div className="space-y-2">
              {(followUpDays >= 0 || followUpDays === -1) && onCreateTask && (
                <label className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createTask}
                    onChange={e => setCreateTask(e.target.checked)}
                    className="w-5 h-5 rounded text-green-600"
                  />
                  <span className="text-sm text-green-800 dark:text-green-300">
                    Create follow-up task
                  </span>
                </label>
              )}

              {((followUpDays >= 0 || followUpDays === -1) || selectedAction?.quickLog) && (
                <label className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flagFollowup}
                    onChange={e => setFlagFollowup(e.target.checked)}
                    className="w-5 h-5 rounded text-amber-600"
                  />
                  <span className="text-sm text-amber-800 dark:text-amber-300">
                    Flag for API follow-up
                  </span>
                </label>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  💾 Save Contact Log
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
