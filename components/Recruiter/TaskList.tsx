/**
 * TaskList Component
 * Displays and manages follow-up tasks for leads with bulk operations and editing
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
}

interface Task {
  id: string
  lead_id: string | null
  title: string
  description: string | null
  task_type: string
  priority: string
  status: string
  due_date: string | null
  completed_at: string | null
  created_at: string
  leads: Lead | null
}

interface TaskListProps {
  leadId?: string
  onAddTask?: (leadId?: string) => void
  onEditTask?: (task: Task) => void
  compact?: boolean
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
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
]

const STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
]

export default function TaskList({ leadId, onAddTask, onEditTask, compact = false }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showOverdue, setShowOverdue] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Bulk selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (leadId) params.set('lead_id', leadId)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterPriority !== 'all') params.set('priority', filterPriority)
      if (showOverdue) params.set('overdue', 'true')
      if (debouncedSearch) params.set('search', debouncedSearch)

      const response = await fetch(`/api/recruiter/tasks?${params.toString()}`, {
        credentials: 'include'
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to fetch tasks')
        return
      }

      setTasks(result.data.tasks)
      // Clear selection when tasks change
      setSelectedTaskIds(new Set())
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [leadId, filterStatus, filterPriority, showOverdue, debouncedSearch])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/recruiter/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: taskId, status: newStatus })
      })

      const result = await response.json()

      if (result.success) {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null } : t
        ))
      }
    } catch (err) {
      console.error('Failed to update task status:', err)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/recruiter/tasks?id=${taskId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        setTasks(prev => prev.filter(t => t.id !== taskId))
        setSelectedTaskIds(prev => {
          const next = new Set(prev)
          next.delete(taskId)
          return next
        })
      }
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedTaskIds.size === tasks.length) {
      setSelectedTaskIds(new Set())
    } else {
      setSelectedTaskIds(new Set(tasks.map(t => t.id)))
    }
  }

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedTaskIds.size === 0) return

    setBulkActionLoading(true)
    try {
      // Update each selected task
      const promises = Array.from(selectedTaskIds).map(taskId =>
        fetch('/api/recruiter/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: taskId, status: newStatus })
        })
      )

      await Promise.all(promises)

      // Update local state
      setTasks(prev => prev.map(t =>
        selectedTaskIds.has(t.id)
          ? { ...t, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null }
          : t
      ))
      setSelectedTaskIds(new Set())
    } catch (err) {
      console.error('Failed to bulk update tasks:', err)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTaskIds.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedTaskIds.size} task(s)?`)) return

    setBulkActionLoading(true)
    try {
      const promises = Array.from(selectedTaskIds).map(taskId =>
        fetch(`/api/recruiter/tasks?id=${taskId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      )

      await Promise.all(promises)

      setTasks(prev => prev.filter(t => !selectedTaskIds.has(t.id)))
      setSelectedTaskIds(new Set())
    } catch (err) {
      console.error('Failed to bulk delete tasks:', err)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null

    const date = new Date(dateStr)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) {
      return { text: `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`, overdue: true }
    } else if (days === 0) {
      return { text: 'Due today', overdue: false, today: true }
    } else if (days === 1) {
      return { text: 'Due tomorrow', overdue: false }
    } else if (days <= 7) {
      return { text: `Due in ${days} days`, overdue: false }
    } else {
      return { text: date.toLocaleDateString(), overdue: false }
    }
  }

  const getTaskTypeIcon = (type: string) => {
    return TASK_TYPES.find(t => t.value === type)?.icon || '📋'
  }

  const getPriorityClass = (priority: string) => {
    return PRIORITIES.find(p => p.value === priority)?.color || PRIORITIES[1].color
  }

  const getStatusClass = (status: string) => {
    return STATUSES.find(s => s.value === status)?.color || STATUSES[0].color
  }

  // Calculate summary stats
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed' || t.status === 'cancelled') return false
    return new Date(t.due_date) < new Date()
  }).length

  const todayTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'completed' || t.status === 'cancelled') return false
    const dueDate = new Date(t.due_date)
    const today = new Date()
    return dueDate.toDateString() === today.toDateString()
  }).length

  if (compact) {
    return (
      <div className="space-y-2">
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">No tasks</div>
        ) : (
          tasks.slice(0, 5).map(task => (
            <div key={task.id} className="flex items-center gap-2 text-sm">
              <span>{getTaskTypeIcon(task.task_type)}</span>
              <span className="flex-1 truncate">{task.title}</span>
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={() => handleStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                className="w-4 h-4"
              />
            </div>
          ))
        )}
        {onAddTask && (
          <button
            onClick={() => onAddTask(leadId)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            + Add Task
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
          {onAddTask && (
            <button
              onClick={() => onAddTask(leadId)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedTaskIds.size > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedTaskIds.size} selected
            </span>
            <div className="flex-1" />
            <button
              onClick={() => handleBulkStatusChange('completed')}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </button>
            <button
              onClick={() => handleBulkStatusChange('cancelled')}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <button
              onClick={() => setSelectedTaskIds(new Set())}
              className="px-3 py-1.5 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg font-medium transition"
            >
              Clear
            </button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="flex gap-4 mb-4">
          {overdueTasks > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm">
              <span className="font-medium">{overdueTasks}</span> overdue
            </div>
          )}
          {todayTasks > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm">
              <span className="font-medium">{todayTasks}</span> due today
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
            <span className="font-medium">{tasks.length}</span> total
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showOverdue}
              onChange={(e) => setShowOverdue(e.target.checked)}
              className="w-4 h-4"
            />
            Overdue only
          </label>
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading tasks...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p>No tasks found</p>
            {onAddTask && (
              <button
                onClick={() => onAddTask(leadId)}
                className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium"
              >
                Create your first task
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Select All Header */}
            {tasks.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedTaskIds.size === tasks.length && tasks.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Select all
                </span>
              </div>
            )}
            {tasks.map(task => {
              const dueInfo = formatDueDate(task.due_date)
              const isSelected = selectedTaskIds.has(task.id)
              return (
                <div
                  key={task.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
                    task.status === 'completed' ? 'opacity-60' : ''
                  } ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectTask(task.id)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600"
                    />

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getTaskTypeIcon(task.task_type)}</span>
                        <h3 className={`font-medium text-gray-900 dark:text-white ${
                          task.status === 'completed' ? 'line-through' : ''
                        }`}>
                          {task.title}
                        </h3>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {task.description}
                        </p>
                      )}

                      {/* Lead info */}
                      {task.leads && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{task.leads.prospect_name || task.leads.prospect_email || 'Unknown'}</span>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityClass(task.priority)}`}>
                          {PRIORITIES.find(p => p.value === task.priority)?.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(task.status)}`}>
                          {STATUSES.find(s => s.value === task.status)?.label}
                        </span>
                        {dueInfo && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            dueInfo.overdue
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : dueInfo.today
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {dueInfo.text}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      {onEditTask && (
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          title="Edit task"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                        title="Delete task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
