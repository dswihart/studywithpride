/**
 * UpcomingTasksWidget Component
 * A compact widget showing overdue and upcoming tasks on the Leads tab
 */

'use client'

import { useState, useEffect } from 'react'

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
  leads: Lead | null
}

interface UpcomingTasksWidgetProps {
  onViewAllTasks: () => void
  onTaskClick?: (task: Task) => void
  refreshKey?: number
}

const TASK_TYPE_ICONS: Record<string, string> = {
  'follow_up': '📞',
  'call': '📱',
  'email': '✉️',
  'meeting': '🤝',
  'whatsapp': '💬',
  'other': '📋'
}

const PRIORITY_COLORS: Record<string, string> = {
  'low': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  'medium': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  'high': 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  'urgent': 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
}

export default function UpcomingTasksWidget({ onViewAllTasks, onTaskClick, refreshKey }: UpcomingTasksWidgetProps) {
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [refreshKey])

  const fetchTasks = async () => {
    try {
      // Fetch overdue tasks
      const overdueResponse = await fetch('/api/recruiter/tasks?status=pending&overdue=true', {
        credentials: 'include'
      })
      const overdueResult = await overdueResponse.json()

      // Fetch today's tasks
      const todayResponse = await fetch('/api/recruiter/tasks?status=pending&due_today=true', {
        credentials: 'include'
      })
      const todayResult = await todayResponse.json()

      if (overdueResult.success) {
        setOverdueTasks(overdueResult.data.tasks || [])
      }
      if (todayResult.success) {
        // Filter out tasks that are already in overdue list
        const overdueIds = new Set((overdueResult.data.tasks || []).map((t: Task) => t.id))
        setTodayTasks((todayResult.data.tasks || []).filter((t: Task) => !overdueIds.has(t.id)))
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCompletingTaskId(taskId)

    try {
      const response = await fetch('/api/recruiter/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: taskId, status: 'completed' })
      })

      const result = await response.json()

      if (result.success) {
        // Remove from both lists
        setOverdueTasks(prev => prev.filter(t => t.id !== taskId))
        setTodayTasks(prev => prev.filter(t => t.id !== taskId))
      }
    } catch (err) {
      console.error('Failed to complete task:', err)
    } finally {
      setCompletingTaskId(null)
    }
  }

  const formatDueDate = (date: string | null) => {
    if (!date) return 'No due date'
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`
    if (diffDays === 0) return 'Due today'
    return `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
  }

  const totalCount = overdueTasks.length + todayTasks.length

  // Don't render anything if no tasks
  if (!loading && totalCount === 0) {
    return null
  }

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 transition"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {loading ? 'Loading...' : (
                <>
                  {overdueTasks.length > 0 && (
                    <span className="text-red-600 dark:text-red-400 font-medium">{overdueTasks.length} overdue</span>
                  )}
                  {overdueTasks.length > 0 && todayTasks.length > 0 && ' • '}
                  {todayTasks.length > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">{todayTasks.length} due today</span>
                  )}
                  {totalCount === 0 && 'All caught up!'}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalCount > 0 && (
            <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
              {totalCount}
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Task List */}
      {!isCollapsed && (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <svg className="animate-spin h-5 w-5 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading tasks...
            </div>
          ) : totalCount === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <svg className="w-8 h-8 mx-auto mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All caught up! No urgent tasks.
            </div>
          ) : (
            <>
              {/* Overdue Tasks */}
              {overdueTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className="px-4 py-3 flex items-center gap-3 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition"
                >
                  <span className="text-lg">{TASK_TYPE_ICONS[task.task_type] || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">{task.title}</span>
                      <span className={`px-1.5 py-0.5 text-xs rounded ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="text-red-600 dark:text-red-400 font-medium">{formatDueDate(task.due_date)}</span>
                      {task.leads && (
                        <>
                          <span>•</span>
                          <span className="truncate">{task.leads.prospect_name || task.leads.prospect_email}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleCompleteTask(task.id, e)}
                    disabled={completingTaskId === task.id}
                    className="p-1.5 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition disabled:opacity-50"
                    title="Mark complete"
                  >
                    {completingTaskId === task.id ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}

              {/* Today's Tasks */}
              {todayTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition"
                >
                  <span className="text-lg">{TASK_TYPE_ICONS[task.task_type] || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">{task.title}</span>
                      <span className={`px-1.5 py-0.5 text-xs rounded ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="text-amber-600 dark:text-amber-400">{formatDueDate(task.due_date)}</span>
                      {task.leads && (
                        <>
                          <span>•</span>
                          <span className="truncate">{task.leads.prospect_name || task.leads.prospect_email}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleCompleteTask(task.id, e)}
                    disabled={completingTaskId === task.id}
                    className="p-1.5 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition disabled:opacity-50"
                    title="Mark complete"
                  >
                    {completingTaskId === task.id ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}

              {/* View All Button */}
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={onViewAllTasks}
                  className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition flex items-center justify-center gap-1"
                >
                  View all tasks
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
