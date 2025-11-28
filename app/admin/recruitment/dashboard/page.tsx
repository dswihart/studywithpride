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
import BulkSendWhatsAppModal from '@/components/Recruiter/BulkSendWhatsAppModal'
import PipelineKanban from '@/components/Recruiter/PipelineKanban'
import RecruiterPerformanceDashboard from '@/components/Recruiter/RecruiterPerformanceDashboard'
import LeadActivityTimeline from '@/components/Recruiter/LeadActivityTimeline'
import QuickContactLogger from '@/components/Recruiter/QuickContactLogger'
import TaskList from '@/components/Recruiter/TaskList'
import AddTaskModal from '@/components/Recruiter/AddTaskModal'
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
}

type DashboardTab = 'leads' | 'tasks' | 'pipeline' | 'performance'

function RecruiterDashboardContent() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
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
  const [taskListKey, setTaskListKey] = useState(0)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    checkAuthorization()
  }, [])

  // Check for leadId in URL to highlight specific lead
  useEffect(() => {
    const leadId = searchParams.get('leadId')
    const tab = searchParams.get('tab') as DashboardTab | null

    if (tab && ['leads', 'tasks', 'pipeline', 'performance'].includes(tab)) {
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
    setContactLoggerLead(lead)
    setShowContactLogger(true)
  }

  const handleContactLogSuccess = () => {
    // Refresh leads after logging contact
    window.location.reload()
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
    setIsAddTaskModalOpen(true)
  }

  const handleTaskSuccess = () => {
    setTaskListKey(prev => prev + 1) // Force TaskList to refresh
  }

  const handleExportSelected = () => {
    if (selectedLeadIds.length === 0) return

    const selectedLeads = leads.filter(lead => selectedLeadIds.includes(lead.id))

    const exportData = selectedLeads.map(lead => ({
      'Name': lead.prospect_name || '',
      'Email': lead.prospect_email || '',
      'Phone': lead.phone || '',
      'Country': lead.country || '',
      'Campaign': lead.campaign || '',
      'Campaign Name': lead.campaign_name || '',
      'Status': lead.contact_status || '',
      'Lead Quality': lead.lead_quality || '',
      'Lead Score': lead.lead_score || '',
      'Referral Source': lead.referral_source || '',
      'Last Contact': lead.last_contact_date || '',
      'Notes': lead.notes || '',
      'Created At': lead.created_at || '',
      'Date Imported': lead.date_imported || ''
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    ws['!cols'] = [
      { wch: 25 }, { wch: 30 }, { wch: 18 }, { wch: 15 }, { wch: 20 },
      { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 25 },
      { wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 15 },
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
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Recruitment Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and track recruitment leads
            </p>
          </div>
          <div className="flex gap-3">
            {activeTab === 'leads' && selectedLeadIds.length > 0 && (
              <>
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete ({selectedLeadIds.length})
                </button>
                <button
                  onClick={handleExportSelected}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export ({selectedLeadIds.length})
                </button>
                <button
                  onClick={() => setIsBulkWhatsAppOpen(true)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Bulk WhatsApp ({selectedLeadIds.length})
                </button>
              </>
            )}
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
            <Link
              href="/"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <button
              onClick={() => window.location.href = '/admin/recruitment/whatsapp-messages'}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Messages
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              title="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

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
              onClick={() => setActiveTab('pipeline')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'pipeline'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Pipeline
              </span>
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Performance
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'leads' && (
          <>
            {/* Metrics */}
            <LeadMetrics leads={leads} />

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
          />
        )}

        {activeTab === 'pipeline' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <PipelineKanban
              onLeadClick={(lead) => handleViewTimeline(lead as Lead)}
              onMoveLeads={(leadIds, targetStage) => {
                console.log('Moved leads:', leadIds, 'to', targetStage)
              }}
            />
          </div>
        )}

        {activeTab === 'performance' && (
          <RecruiterPerformanceDashboard />
        )}

        {/* Modals */}
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
          }}
          onSuccess={handleTaskSuccess}
          leadId={taskLeadId}
          leadName={taskLeadName}
          leads={leads}
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
          />
        )}

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
