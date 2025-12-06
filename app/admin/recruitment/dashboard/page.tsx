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
import CallQueue from '@/components/Recruiter/CallQueue'
import VipStudentsCard from '@/components/Recruiter/VipStudentsCard'
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
import VisaSettings from '@/components/Recruiter/VisaSettings'
import { useTheme } from '@/components/ThemeProvider'
import ExcelJS from 'exceljs'

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

type DashboardTab = 'dashboard' | 'leads' | 'tasks' | 'admin' 

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
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard')
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

    if (tab && ['dashboard', 'leads', 'tasks', 'admin'].includes(tab)) {
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
    if (activeTab === 'dashboard') {
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


  const handleViewLeadById = async (leadId: string) => {
    // First check if lead is already in our list
    const existingLead = leads.find(l => l.id === leadId)
    if (existingLead) {
      setViewingLead(existingLead)
      setIsViewLeadModalOpen(true)
      return
    }
    // Otherwise fetch from API
    try {
      const response = await fetch(`/api/recruiter/leads-read?search=${leadId}&limit=1`)
      const result = await response.json()
      if (result.success && result.data && result.data.length > 0) {
        setViewingLead(result.data[0])
        setIsViewLeadModalOpen(true)
      }
    } catch (error) {
      console.error("Failed to fetch lead:", error)
    }
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

  const handleExportSelected = async () => {
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

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Leads")
    
    // Add headers and data
    if (exportData.length > 0) {
      const headers = Object.keys(exportData[0])
      worksheet.addRow(headers)
      exportData.forEach(row => worksheet.addRow(Object.values(row)))
    }

        const date = new Date().toISOString().split('T')[0]
    const filename = `leads_export_${date}.xlsx`

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
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
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pb-24 lg:pb-8">
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
              onClick={async () => {
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

                {/* Tab Navigation - Hidden on tablet, shown on desktop */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 hidden lg:block">
          <nav className="-mb-px flex gap-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'dashboard'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </span>
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'leads'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Leads
              </span>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'tasks'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
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
              onClick={() => setActiveTab('admin')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                activeTab === 'admin'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
              </span>
            </button>
          </nav>
        </div>

                {/* Tab Content */}

        {/* DASHBOARD TAB - Agent daily workflow */}
        {activeTab === 'dashboard' && (
          <>
            {/* VIP Students Card */}
            <VipStudentsCard
              onViewLead={handleViewLead}
              onLogContact={handleLogContactClick}
              refreshKey={taskListKey}
            />

            {/* Call Queue */}
            <CallQueue
              onViewLead={handleViewLead}
              onLogContact={handleLogContactClick}
              refreshKey={taskListKey}
            />

            {/* Two column layout for Tasks and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Tasks Widget */}
              <div>
                <UpcomingTasksWidget
                  onViewAllTasks={() => setActiveTab('tasks')}
                  onTaskClick={(task) => {
                    setEditingTask(task as Task)
                    setTaskLeadId(task.lead_id || undefined)
                    setTaskLeadName(task.leads?.prospect_name || task.leads?.prospect_email || undefined)
                    setIsAddTaskModalOpen(true)
                  }}
                  refreshKey={taskListKey}
                />
              </div>

              {/* Recent Activity Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Recent Activity
                </h3>
                {activityLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded"></div>)}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {recentActivity.map((activity: any) => (
                      <div
                      key={activity.id}
                      onClick={() => {
                        if (activity.lead_id) {
                          handleViewLeadById(activity.lead_id)
                        }
                      }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition"
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                          activity.contact_type === 'call' ? 'bg-blue-500' :
                          activity.contact_type === 'whatsapp' ? 'bg-green-500' :
                          activity.contact_type === 'email' ? 'bg-purple-500' : 'bg-gray-500'
                        }`}>
                          {activity.contact_type === 'call' ? '📞' :
                           activity.contact_type === 'whatsapp' ? '💬' :
                           activity.contact_type === 'email' ? '📧' : '•'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white truncate">
                            {activity.lead_name || 'Unknown Lead'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{activity.outcome || activity.notes || activity.contact_type}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {(() => {
                            if (!activity.contacted_at) return "Recently"
                            const diff = Date.now() - new Date(activity.contacted_at).getTime()
                            const mins = Math.floor(diff / 60000)
                            if (mins < 60) return mins + "m ago"
                            const hrs = Math.floor(mins / 60)
                            if (hrs < 24) return hrs + "h ago"
                            const days = Math.floor(hrs / 24)
                            if (days < 7) return days + "d ago"
                            return new Date(activity.contacted_at).toLocaleDateString()
                          })()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* LEADS TAB - Full lead management */}
        {activeTab === 'leads' && (
          <>
            <LeadMetrics leads={leads} />
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <LeadTable
                onLeadsChange={setLeads}
                onEditLead={handleEditLead}
                onViewLead={handleViewLead}
                onSelectionChange={setSelectedLeadIds}
                onWhatsAppClick={handleWhatsAppClick}
                onMessageHistoryClick={handleMessageHistoryClick}
                onLogContactClick={handleLogContactClick}
                highlightedLeadId={highlightedLeadId}
              />
            </div>
          </>
        )}

        {/* TASKS TAB - Task management */}
        {activeTab === 'tasks' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-orange-50 dark:bg-orange-900/20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  All Tasks
                </h3>
                <button
                  onClick={() => handleAddTask()}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Task
                </button>
              </div>
            </div>
            <TaskList
              key={taskListKey}
              onEditTask={handleEditTask}
              onAddTask={handleAddTask}
              onViewLead={handleViewLeadById}
            />
          </div>
        )}

                {/* ADMIN TAB - Administrative functions */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            {/* Admin Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    User Management
                  </h3>
                </div>
                <UserManagementPanel />
              </div>

              {/* Templates Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-teal-50 dark:bg-teal-900/20">
                  <h3 className="font-semibold text-teal-900 dark:text-teal-100 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Message Templates
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <TemplatesLibrary
                    isAdmin={true}
                    selectedLead={viewingLead}
                    onSendComplete={() => {}}
                  />
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20">
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Statistics & Performance
                </h3>
              </div>
              <div className="p-4 space-y-6">
                <TrendsChart />
                <RecruiterPerformanceDashboard />
                <InsightsPanel />
              </div>
            </div>

            {/* Settings Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </h3>
              </div>
              <div className="p-4">
                <VisaSettings />
              </div>
            </div>
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
