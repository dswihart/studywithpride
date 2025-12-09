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
}

const ACTIONS: ActionOption[] = [
  // Most common
  { id: "no_answer_wa", label: "No Answer - Send WhatsApp", icon: "📵💬", keywords: ["no answer", "no response", "didn't answer", "voicemail", "na"], status: "contacted", followUp: "call", followUpDays: 1, category: "common" },

  // Positive outcomes
  { id: "interested_call", label: "Interested! (from call)", icon: "🎯", keywords: ["interested", "wants", "yes", "sign up", "enroll"], status: "interested", followUp: "email", followUpDays: 1, category: "positive" },
  { id: "interested_wa", label: "Interested! (WhatsApp reply)", icon: "🎯💬", keywords: ["interested whatsapp", "wa interested", "replied interested"], status: "interested", followUp: "call", followUpDays: 0, category: "positive" },
  { id: "callback", label: "Callback Requested", icon: "🔄", keywords: ["callback", "call back", "call later", "busy", "call again"], status: "contacted", followUp: "call", followUpDays: 1, category: "positive" },
  { id: "send_info", label: "Send More Info", icon: "📤", keywords: ["send info", "more info", "information", "details", "brochure"], status: "interested", followUp: "email", followUpDays: 1, category: "positive" },
  { id: "shared_info", label: "Shared Info - Follow Up", icon: "📋", keywords: ["shared", "sent", "emailed", "gave info"], status: "contacted", followUp: "call", followUpDays: 2, category: "positive" },

  // Negative outcomes
  { id: "not_interested", label: "Not Interested", icon: "👎", keywords: ["not interested", "no thanks", "decline", "refused"], status: "notinterested", followUp: "none", followUpDays: 0, category: "negative" },
  { id: "unqualified", label: "Unqualified", icon: "⛔", keywords: ["unqualified", "doesnt qualify", "not eligible"], status: "unqualified", followUp: "none", followUpDays: 0, category: "negative" },

  // Problems
  { id: "wrong_number", label: "Wrong Number", icon: "❌", keywords: ["wrong number", "wrong", "invalid", "disconnected"], status: "wrongnumber", followUp: "none", followUpDays: 0, category: "problem" },
  { id: "no_whatsapp", label: "No WhatsApp on Number", icon: "🚫", keywords: ["no whatsapp", "no wa", "cant message"], status: "contacted", followUp: "call", followUpDays: 1, category: "problem" },
]

const FOLLOW_UP_OPTIONS = [
  { value: 0, label: "Today" },
  { value: 1, label: "Tomorrow" },
  { value: 3, label: "3 Days" },
]

export default function SmartContactLogger({ lead, onClose, onSuccess, onCreateTask }: SmartContactLoggerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAction, setSelectedAction] = useState<ActionOption | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [followUpDays, setFollowUpDays] = useState(1)
  const [notes, setNotes] = useState("")
  const [createTask, setCreateTask] = useState(true)
  const [flagFollowup, setFlagFollowup] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

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

  const selectAction = (action: ActionOption) => {
    setSelectedAction(action)
    setFollowUpDays(action.followUpDays)
    setFlagFollowup(action.followUpDays > 0)
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
          follow_up_action: followUpDays > 0 ? `Follow up in ${followUpDays} day(s)` : "No follow-up",
          flag_followup: flagFollowup,
        }),
      })

      if (!contactRes.ok) {
        const err = await contactRes.json()
        throw new Error(err.error || "Failed to log contact")
      }

      // Update lead status
      const statusRes = await fetch("/api/recruiter/leads-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          contact_status: selectedAction.status,
          last_contact_date: new Date().toISOString(),
        }),
      })

      if (!statusRes.ok) {
        console.error("Failed to update lead status")
      }

      // Create task if enabled
      if (createTask && followUpDays > 0 && onCreateTask) {
        const leadName = lead.prospect_name || lead.prospect_email || "Unknown"
        onCreateTask({
          lead_id: lead.id,
          lead_name: leadName,
          title: `Follow up: ${selectedAction.label} - ${leadName}`,
          task_type: selectedAction.followUp,
          priority: selectedAction.category === "positive" ? "high" : "medium",
          due_days: followUpDays,
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
                  className={`w-full p-3 rounded-lg text-left transition flex items-center gap-3 ${
                    index === highlightedIndex
                      ? "bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent"
                  }`}
                >
                  <span className="text-2xl">{action.icon}</span>
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

            {/* Follow-up Options */}
            {selectedAction.followUp !== "none" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ⏰ Follow-up in
                </label>
                <div className="flex gap-2">
                  {FOLLOW_UP_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setFollowUpDays(opt.value)}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                        followUpDays === opt.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📝 Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any important details..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              {followUpDays > 0 && onCreateTask && (
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

              {followUpDays > 0 && (
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
