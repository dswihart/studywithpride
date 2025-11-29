/**
 * QuickContact Component
 * Floating quick contact feature for the recruitment dashboard
 * Allows searching for a lead and quickly logging an interaction
 */

'use client'

import { useState, useEffect, useRef } from 'react'

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
  contact_status: string
  notes: string | null
  recruit_priority: number | null
}

interface QuickContactProps {
  leads: Lead[]
  onContactLogged: () => void
  onTaskCreated?: () => void
}

type ContactOutcome =
  | "no_answer"
  | "voicemail"
  | "answered_interested"
  | "answered_callback"
  | "message_sent"
  | "message_replied"

interface OutcomeOption {
  value: ContactOutcome
  label: string
  icon: string
  suggestedStatus: string
  taskType: string | null
  taskDays: number | null
}

const QUICK_OUTCOMES: OutcomeOption[] = [
  { value: "no_answer", label: "No Answer", icon: "📵", suggestedStatus: "contacted", taskType: "call", taskDays: 1 },
  { value: "voicemail", label: "Voicemail", icon: "📬", suggestedStatus: "contacted", taskType: "call", taskDays: 3 },
  { value: "answered_interested", label: "Interested", icon: "🎯", suggestedStatus: "interested", taskType: "email", taskDays: 0 },
  { value: "answered_callback", label: "Callback", icon: "🔄", suggestedStatus: "contacted", taskType: "call", taskDays: 1 },
  { value: "message_sent", label: "Messaged", icon: "💬", suggestedStatus: "contacted", taskType: "follow_up", taskDays: 2 },
  { value: "message_replied", label: "Replied", icon: "✉️", suggestedStatus: "interested", taskType: "call", taskDays: 0 },
]

export default function QuickContact({ leads, onContactLogged, onTaskCreated }: QuickContactProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectedOutcome, setSelectedOutcome] = useState<ContactOutcome | null>(null)
  const [notes, setNotes] = useState('')
  const [createTask, setCreateTask] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter leads based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredLeads([])
      return
    }

    const searchLower = search.toLowerCase()
    const filtered = leads.filter(lead => {
      const name = lead.prospect_name?.toLowerCase() || ''
      const email = lead.prospect_email?.toLowerCase() || ''
      const phone = lead.phone?.toLowerCase() || ''
      return name.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower)
    }).slice(0, 8)

    setFilteredLeads(filtered)
  }, [search, leads])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!selectedLead) {
          setIsOpen(false)
          setIsExpanded(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedLead])

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead)
    setSearch('')
    setFilteredLeads([])
    setIsExpanded(true)
    setError(null)
  }

  const handleClearLead = () => {
    setSelectedLead(null)
    setSelectedOutcome(null)
    setNotes('')
    setIsExpanded(false)
    setError(null)
  }

  const handleSave = async () => {
    if (!selectedLead || !selectedOutcome) return

    setSaving(true)
    setError(null)

    try {
      const outcomeOption = QUICK_OUTCOMES.find(o => o.value === selectedOutcome)

      // Build note entry
      const timestamp = new Date().toLocaleString()
      const noteEntry = [
        `[${timestamp}] Quick Log: ${outcomeOption?.label}`,
        notes ? `- ${notes}` : null
      ].filter(Boolean).join(' ')

      const updatedNotes = selectedLead.notes
        ? `${noteEntry}\n---\n${selectedLead.notes}`
        : noteEntry

      // Update lead - only pass id and the fields we want to update
      const response = await fetch('/api/recruiter/leads-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: selectedLead.id,
          contact_status: outcomeOption?.suggestedStatus || selectedLead.contact_status,
          last_contact_date: new Date().toISOString(),
          notes: updatedNotes
        })
      })

      const result = await response.json()

      if (result.success) {
        // Create task if enabled
        if (createTask && outcomeOption?.taskType && outcomeOption.taskDays !== null) {
          const leadName = selectedLead.prospect_name || selectedLead.prospect_email || 'Lead'
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + outcomeOption.taskDays)

          await fetch('/api/recruiter/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              lead_id: selectedLead.id,
              title: `Follow up: ${leadName} (${outcomeOption.label})`,
              task_type: outcomeOption.taskType,
              priority: outcomeOption.suggestedStatus === 'interested' ? 'high' : 'medium',
              due_date: dueDate.toISOString()
            })
          })

          if (onTaskCreated) onTaskCreated()
        }

        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setSelectedLead(null)
          setSelectedOutcome(null)
          setNotes('')
          setIsExpanded(false)
          setIsOpen(false)
          onContactLogged()
        }, 1000)
      } else {
        setError(result.error || 'Failed to log contact')
      }
    } catch (err) {
      console.error('Failed to log contact:', err)
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Keyboard shortcut to open (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        if (selectedLead) {
          handleClearLead()
        } else {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedLead])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        title="Quick Contact (Ctrl+K)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </button>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 transition-all overflow-hidden ${
        isExpanded ? 'w-96' : 'w-80'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="font-semibold">Quick Contact</span>
        </div>
        <button
          onClick={() => {
            setIsOpen(false)
            setIsExpanded(false)
            handleClearLead()
          }}
          className="p-1 hover:bg-white/20 rounded-full transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Success State */}
      {success && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">Contact Logged!</p>
        </div>
      )}

      {/* Content */}
      {!success && (
        <div className="p-4">
          {/* Error Display */}
          {error && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Search / Selected Lead */}
          {!selectedLead ? (
            <div className="relative">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search lead by name, email, phone..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {/* Search Results */}
              {filteredLeads.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredLeads.map(lead => (
                    <button
                      key={lead.id}
                      onClick={() => handleSelectLead(lead)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                          {(lead.prospect_name?.[0] || lead.prospect_email?.[0] || '?').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {lead.prospect_name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {lead.phone || lead.prospect_email || 'No contact'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {search && filteredLeads.length === 0 && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No leads found
                </div>
              )}

              {!search && (
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">Ctrl+K</kbd> to open
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Lead */}
              <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {(selectedLead.prospect_name?.[0] || selectedLead.prospect_email?.[0] || '?').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {selectedLead.prospect_name || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {selectedLead.phone || selectedLead.prospect_email}
                  </div>
                </div>
                <button
                  onClick={handleClearLead}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Quick Outcome Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Outcome
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_OUTCOMES.map(outcome => (
                    <button
                      key={outcome.value}
                      onClick={() => setSelectedOutcome(outcome.value)}
                      className={`p-2 rounded-lg border-2 text-center transition ${
                        selectedOutcome === outcome.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{outcome.icon}</span>
                      <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                        {outcome.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Note */}
              <div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Quick note (optional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {/* Create Task Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createTask}
                  onChange={(e) => setCreateTask(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Create follow-up task
                </span>
              </label>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!selectedOutcome || saving}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
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
                    Log Contact
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
