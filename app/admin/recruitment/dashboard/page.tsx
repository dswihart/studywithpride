/**
 * Story 5.1-B: Recruiter Dashboard Page (Enhanced with Pipeline, Performance & Tasks)
 * Displays lead management interface for recruiters with analytics and task management
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import LeadTable from '@/components/Recruiter/LeadTable'
import LeadMetrics from '@/components/Recruiter/LeadMetrics'
import SendWhatsAppModal from "@/components/Recruiter/SendWhatsAppModal"
import MessageHistoryModal from "@/components/Recruiter/MessageHistoryModal"
import AddLeadModal from '@/components/Recruiter/AddLeadModal'
import ViewLeadModal from '@/components/Recruiter/ViewLeadModal'
import BulkSendWhatsAppModal from '@/components/Recruiter/BulkSendWhatsAppModal'
import LeadActivityTimeline from '@/components/Recruiter/LeadActivityTimeline'
import QuickContactLogger from '@/components/Recruiter/QuickContactLogger'
import QuickContact from '@/components/Recruiter/QuickContact'
import TaskList from '@/components/Recruiter/TaskList'
import AddTaskModal from '@/components/Recruiter/AddTaskModal'
import AddContactLogModal from '@/components/Recruiter/AddContactLogModal'
import UpcomingTasksWidget from '@/components/Recruiter/UpcomingTasksWidget'
import UserManagementPanel from '@/components/Recruiter/UserManagementPanel'
import TemplatesLibrary from '@/components/Recruiter/TemplatesLibrary'
import HeaderActions from "@/components/Recruiter/HeaderActions"
import SelectionContextBar from "@/components/Recruiter/SelectionContextBar"
import TrendsChart from '@/components/Recruiter/TrendsChart'
import RecruiterPerformanceDashboard from '@/components/Recruiter/RecruiterPerformanceDashboard'
import InsightsPanel from '@/components/Recruiter/InsightsPanel'
import { useTheme } from '@/components/ThemeProvider'
import * as XLSX from 'xlsx'

interface Lead {
  id: string
  country: string
  contact_status: string
  last_contact_date: string | null
  notes: string | null
  created_at: string
  prospect_email: string | null
  prospect_name: string | null
  referral_source: string | null
  phone: string | null
  campaign: string | null
  campaign_name: string | null
  name_score: number | null
  email_score: number | null
  phone_valid: boolean | null
  recency_score: number | null
  lead_score: number | null
  lead_quality: string | null
  date_imported: string | null
  created_time: string | null
  barcelona_timeline: number | null
  is_duplicate: boolean
  recruit_priority: number | null
  intake: string | null
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
  leads?: {
    id: string
    prospect_name: string | null
    prospect_email: string | null
    phone: string | null
  } | null
}

type DashboardTab = 'leads' | 'tasks' | 'activity' | 'students' | 'templates' | 'stats' 

function RecruiterDashboardContent() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [viewingLead, setViewingLead] = useState<Lead | null>(null)
  const [isViewLeadModalOpen, setIsViewLeadModalOpen] = useState(false)
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [whatsAppLead, setWhatsAppLead] = useState<Lead | null>(null)
  const [isMessageHistoryOpen, setIsMessageHistoryOpen] = useState(false)
  const [isBulkWhatsAppOpen, setIsBulkWhatsAppOpen] = useState(false)
  const [messageHistoryLead, setMessageHistoryLead] = useState<Lead | null>(null)
  const [highlightedLeadId, setHighlightedLeadId] = useState<string | null>(null)
  const [highlightedLeadName, setHighlightedLeadName] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<DashboardTab>('leads')
  const [showActivityTimeline, setShowActivityTimeline] = useState(false)
  const [timelineLead, setTimelineLead] = useState<Lead | null>(null)
  const [showContactLogger, setShowContactLogger] = useState(false)
  const [contactLoggerLead, setContactLoggerLead] = useState<Lead | null>(null)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [taskLeadId, setTaskLeadId] = useState<string | undefined>()
  const [taskLeadName, setTaskLeadName] = useState<string | undefined>()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskListKey, setTaskListKey] = useState(0)
  const [isAddContactLogModalOpen, setIsAddContactLogModalOpen] = useState(false)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'

  useEffect(() => {
    checkAuthorization()
  }, [])

  // Check for leadId in URL to highlight specific lead
  useEffect(() => {
    const leadId = searchParams.get('leadId')
    const tab = searchParams.get('tab') as DashboardTab | null

    if (tab && ['leads', 'tasks', 'activity', 'students', 'templates', 'stats'].includes(tab)) {
      setActiveTab(tab)
    }

    if (leadId) {
      if (highlightedLeadId !== leadId) {
        setHighlightedLeadId(leadId)
        setTimeout(() => {
          setHighlightedLeadId(null)
          setHighlightedLeadName(null)
        }, 5000)
      }

      if (leads.length > 0) {
        const lead = leads.find(l => l.id === leadId)
        if (lead) {
          setHighlightedLeadName(lead.prospect_name || 'Unknown Lead')
          setTimeout(() => {
            const leadRow = document.getElementById(`lead-row-${leadId}`)
            if (leadRow) {
              leadRow.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, 500)
        }
      }
    }
  }, [searchParams, leads, highlightedLeadId])

  // Fetch recent activity when activity tab is selected
  useEffect(() => {
    if (activeTab === 'activity') {
      fetchRecentActivity()
    }
  }, [activeTab])

  const fetchRecentActivity = async () => {
    setActivityLoading(true)
    try {
      const response = await fetch('/api/recruiter/recent-activity?limit=100')
      const result = await response.json()
      if (result.success) {
        setRecentActivity(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    } finally {
      setActivityLoading(false)
    }
  }

  const checkAuthorization = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/login')
        return
      }

      const userRole = user.user_metadata?.role
      if (userRole !== 'recruiter' && userRole !== 'admin') {
        router.push('/dashboard')
        return
      }

      setAuthorized(true)
    } catch (err) {
      console.error('Authorization check failed:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLeadsChange = (newLeads: Lead[]) => {
    setLeads(newLeads)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleAddLeadSuccess = () => {
    window.location.reload()
  }

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead)
    setIsAddLeadModalOpen(true)
  }

  const handleViewLead = (lead: Lead) => {
    setViewingLead(lead)
    setIsViewLeadModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setIsViewLeadModalOpen(false)
    setViewingLead(null)
  }

  const handleEditFromView = (lead: Lead) => {
    setIsViewLeadModalOpen(false)
    setViewingLead(null)
    handleEditLead(lead)
  }

  const handleLogContactFromView = (lead: Lead) => {
    setIsViewLeadModalOpen(false)
    setViewingLead(null)
    setContactLoggerLead(lead)
    setShowContactLogger(true)
  }

  const handleCloseModal = () => {
    setIsAddLeadModalOpen(false)
    setEditingLead(null)
  }

  const handleWhatsAppClick = (lead: Lead) => {
    setWhatsAppLead(lead)
    setIsWhatsAppModalOpen(true)
  }

  const handleWhatsAppSuccess = () => {}

  const handleCloseWhatsAppModal = () => {
    setIsWhatsAppModalOpen(false)
    setWhatsAppLead(null)
  }

  const handleMessageHistoryClick = (lead: Lead) => {
    setMessageHistoryLead(lead)
    setIsMessageHistoryOpen(true)
  }

  const handleCloseMessageHistory = () => {
    setIsMessageHistoryOpen(false)
    setMessageHistoryLead(null)
  }

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedLeadIds(selectedIds)
  }

  const handleDeleteSelected = () => {
    if (selectedLeadIds.length === 0) return
    setShowDeleteConfirm(true)
  }

  const handleViewTimeline = (lead: Lead) => {
    setTimelineLead(lead)
    setShowActivityTimeline(true)
  }

  const handleLogContactClick = (lead: Lead) => {
    setContactLoggerLead(lead as Lead)
    setShowContactLogger(true)
  }

  const handleContactLogSuccess = (updatedLead?: Lead) => {
    // Update the lead in state instead of full page reload
    if (updatedLead) {
      setLeads(prevLeads => prevLeads.map(l => l.id === updatedLead.id ? { ...l, ...updatedLead } : l))
    }
    setShowContactLogger(false)
    setContactLoggerLead(null)
  }

  // Create task from QuickContactLogger
  const handleCreateTaskFromContact = async (taskData: {
    lead_id: string
    lead_name: string
    title: string
    task_type: string
    priority: string
    due_days: number
  }) => {
    try {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + taskData.due_days)

      await fetch('/api/recruiter/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          lead_id: taskData.lead_id,
          title: taskData.title,
          task_type: taskData.task_type,
          priority: taskData.priority,
          due_date: dueDate.toISOString()
        })
      })

      setTaskListKey(prev => prev + 1)
    } catch (err) {
      console.error('Failed to create task:', err)
    }
  }

  const handleAddTask = (leadId?: string) => {
    if (leadId) {
      const lead = leads.find(l => l.id === leadId)
      setTaskLeadId(leadId)
      setTaskLeadName(lead?.prospect_name || lead?.prospect_email || undefined)
    } else {
      setTaskLeadId(undefined)
      setTaskLeadName(undefined)
    }
    setEditingTask(null)
    setIsAddTaskModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskLeadId(task.lead_id || undefined)
    setTaskLeadName(task.leads?.prospect_name || task.leads?.prospect_email || undefined)
    setIsAddTaskModalOpen(true)
  }

  const handleTaskSuccess = () => {
    setTaskListKey(prev => prev + 1) // Force TaskList to refresh
  }

  const handleQuickContactLogged = (updatedLead?: Lead) => {
    // Update the lead in state instead of full page reload  
    if (updatedLead) {
      setLeads(prevLeads => prevLeads.map(l => l.id === updatedLead.id ? { ...l, ...updatedLead } : l))
    }
  }

  const handleExportSelected = () => {
    if (selectedLeadIds.length === 0) return

    const selectedLeads = leads.filter(lead => selectedLeadIds.includes(lead.id))

    const exportData = selectedLeads.map(lead => ({
      'Name': lead.prospect_name || '',
      'Email': lead.prospect_email || '',
      'Phone': lead.phone || '',
      'Country': lead.country || '',
      'Status': lead.contact_status || '',
      'Lead Quality': lead.lead_quality || '',
      'Lead Score': lead.lead_score || '',
      'Notes': lead.notes || '',
      'Barcelona Timeline': lead.barcelona_timeline || '',
      'Intake': lead.intake || '',
      'Is Duplicate': lead.is_duplicate ? 'Yes' : 'No',
      'Lead Clicked Time': lead.created_time || '',
      'Date Imported': lead.date_imported || ''
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    ws['!cols'] = [
      { wch: 25 }, { wch: 30 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 10 }, { wch: 40 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 20 }, { wch: 20 }
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Leads')

    const date = new Date().toISOString().split('T')[0]
    const filename = `leads_export_${date}.xlsx`

    XLSX.writeFile(wb, filename)
  }

  const confirmDelete = async () => {
    if (selectedLeadIds.length === 0) return

    setDeleting(true)
    try {
      const response = await fetch('/api/recruiter/leads-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: selectedLeadIds })
      })

      const result = await response.json()

      if (result.success) {
        window.location.reload()
      } else {
        alert('Failed to delete leads: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Failed to delete leads. Please try again.')
      console.error('Delete error:', error)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-white to-blue-50'}`}>
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-white to-blue-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header - Consolidated UX */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Recruitment Dashboard
            </h1>
            <p className="text-gray-800 dark:text-gray-200">
              Manage and track recruitment leads
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Primary Action - Add Lead */}
            <button
              onClick={() => {
                setEditingLead(null)
                setIsAddLeadModalOpen(true)
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>

            {/* Add Contact Log Button */}
            <button
              onClick={() => setIsAddContactLogModalOpen(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Add Log
            </button>

            {/* Secondary Actions Dropdown */}
            <HeaderActions
              onAddLog={() => setIsAddContactLogModalOpen(true)}
              onViewMessages={() => window.location.href = '/admin/recruitment/whatsapp-messages'}
              onToggleTheme={toggleTheme}
              onLogout={handleLogout}
              theme={theme as "light" | "dark"}
            />
          </div>
        </div>

        {/* Selection Context Bar - Shows when leads are selected */}
        {activeTab === 'leads' && selectedLeadIds.length > 0 && (
          <SelectionContextBar
            selectedCount={selectedLeadIds.length}
            onExport={handleExportSelected}
            onBulkWhatsApp={() => setIsBulkWhatsAppOpen(true)}
            onDelete={handleDeleteSelected}
            onClearSelection={() => setSelectedLeadIds([])}
            isDeleting={deleting}
          />
        )}

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'leads'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Lead Management
              </span>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Tasks
              </span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Activity
              </span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'students'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                Users
              </span>
            </button>
            <button              onClick={() => setActiveTab('templates')}              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${                activeTab === 'templates'                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'              }`}            >              <span className="flex items-center gap-2">                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />                </svg>                Templates              </span>            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === "stats"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Statistics
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'leads' && (
          <>
            {/* Metrics */}
            <LeadMetrics leads={leads} />

            {/* Upcoming Tasks Widget */}
            <UpcomingTasksWidget
              onViewAllTasks={() => setActiveTab("tasks")}
              onTaskClick={(task) => {
                setEditingTask(task as Task)
                setTaskLeadId(task.lead_id || undefined)
                setTaskLeadName(task.leads?.prospect_name || task.leads?.prospect_email || undefined)
                setIsAddTaskModalOpen(true)
              }}
              refreshKey={taskListKey}
            />


            {/* Notification Banner */}
            {highlightedLeadName && (
              <div className="mt-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded-lg shadow-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Viewing messages from {highlightedLeadName}</p>
                    <p className="text-sm text-yellow-800">Lead highlighted below - will auto-clear in 5 seconds</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setHighlightedLeadId(null)
                    setHighlightedLeadName(null)
                  }}
                  className="text-yellow-700 hover:text-yellow-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Lead Table */}
            <div className="mt-8">
              <LeadTable
                onLeadsChange={handleLeadsChange}
                onEditLead={handleEditLead}
                onViewLead={handleViewLead}
                onSelectionChange={handleSelectionChange}
                onWhatsAppClick={handleWhatsAppClick}
                onMessageHistoryClick={handleMessageHistoryClick}
                onLogContactClick={handleLogContactClick}
                highlightedLeadId={highlightedLeadId}
              />
            </div>
          </>
        )}

        {activeTab === 'tasks' && (
          <TaskList
            key={taskListKey}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
          />
        )}

        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">All contact log entries from recruiters</p>
              </div>
              <button
                onClick={fetchRecentActivity}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {activityLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-4">Loading activity...</p>
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => {
                  const getOutcomeIcon = (outcome: string) => {
                    if (!outcome) return '📋'
                    const lower = outcome.toLowerCase()
                    if (lower.includes('interested') && !lower.includes('not')) return '🎯'
                    if (lower.includes('whatsapp') || lower.includes('message')) return '💬'
                    if (lower.includes('call') || lower.includes('answer')) return '📞'
                    if (lower.includes('not interested') || lower.includes('unqualified')) return '👎'
                    if (lower.includes('wrong')) return '❌'
                    return '📋'
                  }

                  const formatDate = (dateStr: string) => {
                    const date = new Date(dateStr)
                    const now = new Date()
                    const diffMs = now.getTime() - date.getTime()
                    const diffMins = Math.floor(diffMs / 60000)
                    const diffHours = Math.floor(diffMs / 3600000)
                    const diffDays = Math.floor(diffMs / 86400000)

                    if (diffMins < 1) return 'Just now'
                    if (diffMins < 60) return `${diffMins}m ago`
                    if (diffHours < 24) return `${diffHours}h ago`
                    if (diffDays < 7) return `${diffDays}d ago`
                    return date.toLocaleDateString()
                  }

                  return (
                    <div
                      key={activity.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                      onClick={() => {
                        if (activity.lead_id) {
                          if (activity.lead_status === 'archived_referral') {
                            alert('This lead has been archived')
                            return
                          }
                          const lead = leads.find(l => l.id === activity.lead_id)
                          if (lead) {
                            handleViewLead(lead)
                          } else {
                            setHighlightedLeadId(activity.lead_id)
                            setActiveTab('leads')
                          }
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getOutcomeIcon(activity.outcome)}</span>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {activity.lead_name}
                            </p>
                            {activity.lead_country && (
                              <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                                {activity.lead_country}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                            <span className="font-medium">{activity.outcome || 'Contact logged'}</span>
                            {activity.follow_up_action && (
                              <span className="text-purple-600 dark:text-purple-400"> → {activity.follow_up_action}</span>
                            )}
                          </p>
                          {activity.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 ml-7 mt-1 italic">
                              {activity.notes.substring(0, 100)}{activity.notes.length > 100 ? '...' : ''}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            activity.lead_status === 'contacted' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                            activity.lead_status === 'qualified' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                            activity.lead_status === 'converted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            activity.lead_status === 'contacted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            activity.lead_status === 'notinterested' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                            activity.lead_status === 'wrongnumber' ? 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                          }`}>
                            {activity.lead_status || 'unknown'}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(activity.contacted_at)}
                          </p>
                          {activity.ready_to_proceed && (
                            <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded">
                              Ready to proceed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No activity recorded yet.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start logging contacts to see activity here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <UserManagementPanel
            onOpenLead={(leadId) => {
              const lead = leads.find(l => l.id === leadId)
              if (lead) {
                setViewingLead(lead)
                setIsViewLeadModalOpen(true)
              }
            }}
          />
        )}
        {activeTab === 'templates' && (          <TemplatesLibrary            isAdmin={true}            selectedLead={viewingLead}            onSendComplete={() => {}}          />        )}

        {activeTab === "stats" && (
          <div className="space-y-6">
            {/* Trends Chart */}
            <TrendsChart />
            
            {/* Insights Panel */}
            <InsightsPanel />

            {/* Performance Dashboard */}
            <RecruiterPerformanceDashboard />
          </div>
        )}

        {/* Modals */}
        <ViewLeadModal
          isOpen={isViewLeadModalOpen}
          onClose={handleCloseViewModal}
          lead={viewingLead}
          onEdit={handleEditFromView}
          onLogContact={handleLogContactFromView}
        />

        <AddLeadModal
          isOpen={isAddLeadModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleAddLeadSuccess}
          editLead={editingLead}
        />

        <SendWhatsAppModal
          isOpen={isWhatsAppModalOpen}
          onClose={handleCloseWhatsAppModal}
          onSuccess={handleWhatsAppSuccess}
          lead={whatsAppLead}
        />

        <MessageHistoryModal
          isOpen={isMessageHistoryOpen}
          onClose={handleCloseMessageHistory}
          lead={messageHistoryLead}
        />

        <BulkSendWhatsAppModal
          isOpen={isBulkWhatsAppOpen}
          onClose={() => setIsBulkWhatsAppOpen(false)}
          onSuccess={() => window.location.reload()}
          selectedLeads={leads.filter(l => selectedLeadIds.includes(l.id))}
        />

        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => {
            setIsAddTaskModalOpen(false)
            setTaskLeadId(undefined)
            setTaskLeadName(undefined)
            setEditingTask(null)
          }}
          onSuccess={handleTaskSuccess}
          leadId={taskLeadId}
          leadName={taskLeadName}
          leads={leads}
          editTask={editingTask}
        />

        {/* Quick Contact Logger */}
        {showContactLogger && contactLoggerLead && (
          <QuickContactLogger
            lead={contactLoggerLead}
            onClose={() => {
              setShowContactLogger(false)
              setContactLoggerLead(null)
            }}
            onSuccess={handleContactLogSuccess}
            onCreateTask={handleCreateTaskFromContact}
          />
        )}

        {/* Add Contact Log Modal */}
        {isAddContactLogModalOpen && (
          <AddContactLogModal
            onClose={() => setIsAddContactLogModalOpen(false)}
            onSelectLead={(lead) => {
              setIsAddContactLogModalOpen(false)
              setContactLoggerLead(lead as Lead)
              setShowContactLogger(true)
            }}
          />
        )}
        {/* Quick Contact Floating Button */}
        <QuickContact
          leads={leads}
          onContactLogged={handleQuickContactLogged}
          onTaskCreated={handleTaskSuccess}
        />

        {/* Activity Timeline Sidebar */}
        {showActivityTimeline && timelineLead && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowActivityTimeline(false)}
            />
            <div className="relative z-10">
              <LeadActivityTimeline
                leadId={timelineLead.id}
                leadName={timelineLead.prospect_name || 'Unknown'}
                onClose={() => setShowActivityTimeline(false)}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Leads</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete {selectedLeadIds.length} lead{selectedLeadIds.length !== 1 ? 's' : ''}?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RecruiterDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    }>
      <RecruiterDashboardContent />
    </Suspense>
  )
}
