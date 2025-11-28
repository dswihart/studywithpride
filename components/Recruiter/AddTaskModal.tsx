/**
 * AddTaskModal Component
 * Modal for creating new follow-up tasks
 */

'use client'

import { useState, useEffect } from 'react'

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
}

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  leadId?: string
  leadName?: string
  leads?: Lead[]
}

const TASK_TYPES = [
  { value: 'follow_up', label: 'Follow Up', icon: '📞' },
  { value: 'call', label: 'Call', icon: '📱' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'meeting', label: 'Meeting', icon: '🤝' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'other', label: 'Other', icon: '📋' }
]

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-200' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-200' },
  { value: 'high', label: 'High', color: 'bg-orange-200' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-200' }
]

const QUICK_DUE_DATES = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'In 1 week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
  { label: 'In 1 month', days: 30 }
]

export default function AddTaskModal({ isOpen, onClose, onSuccess, leadId, leadName, leads }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [taskType, setTaskType] = useState('follow_up')
  const [priority, setPriority] = useState('medium')
  const [selectedLeadId, setSelectedLeadId] = useState(leadId || '')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setDescription('')
      setTaskType('follow_up')
      setPriority('medium')
      setSelectedLeadId(leadId || '')
      setDueDate('')
      setError('')
    }
  }, [isOpen, leadId])

  if (!isOpen) return null

  const setQuickDueDate = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setDueDate(date.toISOString().split('T')[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Please enter a task title')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/recruiter/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          lead_id: selectedLeadId || null,
          title: title.trim(),
          description: description.trim() || null,
          task_type: taskType,
          priority,
          due_date: dueDate ? new Date(dueDate).toISOString() : null
        })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to create task')
        return
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to create task:', err)
      setError('An error occurred while creating the task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Task
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Lead Selection */}
          {leadId && leadName ? (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-blue-800 dark:text-blue-200 font-medium">{leadName}</span>
            </div>
          ) : leads && leads.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link to Lead (optional)
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">No lead selected</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.prospect_name || lead.prospect_email || 'Unknown Lead'}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Follow up on visa inquiry"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TASK_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setTaskType(type.value)}
                  className={`p-2 rounded-lg border text-sm font-medium transition ${
                    taskType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="mr-1">{type.icon}</span> {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 p-2 rounded-lg border text-sm font-medium transition ${
                    priority === p.value
                      ? `border-gray-400 ${p.color}`
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {QUICK_DUE_DATES.map(quick => (
                <button
                  key={quick.days}
                  type="button"
                  onClick={() => setQuickDueDate(quick.days)}
                  className="px-3 py-1 text-xs font-medium rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                >
                  {quick.label}
                </button>
              ))}
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
