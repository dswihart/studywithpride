/**
 * Story 5.1-B: Recruiter Dashboard Page (With Add/Edit/Bulk Delete)
 * Displays lead management interface for recruiters
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import LeadTable from '@/components/Recruiter/LeadTable'
import LeadMetrics from '@/components/Recruiter/LeadMetrics'
import SendWhatsAppModal from "@/components/Recruiter/SendWhatsAppModal"
import MessageHistoryModal from "@/components/Recruiter/MessageHistoryModal"
import AddLeadModal from '@/components/Recruiter/AddLeadModal'

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
  name_score: number | null
  email_score: number | null
  phone_valid: boolean | null
  recency_score: number | null
  lead_score: number | null
  lead_quality: string | null
  date_imported: string | null
  created_time: string | null
}

export default function RecruiterDashboardPage() {
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
  const [messageHistoryLead, setMessageHistoryLead] = useState<Lead | null>(null)
  const [highlightedLeadId, setHighlightedLeadId] = useState<string | null>(null)
  const [highlightedLeadName, setHighlightedLeadName] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    checkAuthorization()
  }, [])

  // Check for leadId in URL to highlight specific lead
  useEffect(() => {
    const leadId = searchParams.get('leadId')
    console.log('Lead highlighting check:', { leadId, leadsCount: leads.length })
    
    if (leadId && leads.length > 0) {
      // Find the lead to get their name
      const lead = leads.find(l => l.id === leadId)
      console.log('Found lead:', lead)
      
      if (lead) {
        console.log('Setting highlight for:', lead.prospect_name)
        setHighlightedLeadId(leadId)
        setHighlightedLeadName(lead.prospect_name || 'Unknown Lead')
        
        // Clear highlight after 5 seconds
        setTimeout(() => {
          setHighlightedLeadId(null)
          setHighlightedLeadName(null)
        }, 5000)
        
        // Scroll to the lead in the table after a longer delay to ensure table is rendered
        setTimeout(() => {
          const leadRow = document.getElementById(`lead-row-${leadId}`)
          console.log('Lead row element:', leadRow)
          if (leadRow) {
            leadRow.scrollIntoView({ behavior: 'smooth', block: 'center' })
          } else {
            console.log('Lead row not found in DOM')
          }
        }, 500)
      } else {
        console.log('Lead not found in leads array')
      }
    } else if (leadId) {
      console.log('Waiting for leads to load...', leads.length)
    }
  }, [searchParams, leads])

  const checkAuthorization = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/login')
        return
      }

      // Check if user has recruiter or admin role
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
    // Trigger lead table refresh
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

  const handleWhatsAppSuccess = () => {
    // Refresh the lead table
    // Just close the modal - dont reload the page
    // The modal handles itself and closing automatically
  }

  const handleCloseWhatsAppModal = () => {
    setIsWhatsAppModalOpen(false)
    setWhatsAppLead(null)
  }

  const handleMessageHistoryClick = (lead: Lead) => {
    setMessageHistoryLead(lead)
    setIsMessageHistoryOpen(true)
  }

  const handleCloseMessageHistory = () => {
const handleSelectionChange = (selectedIds: string[]) => {    setSelectedLeadIds(selectedIds)  }
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
        // Refresh the page to show updated leads
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
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Recruitment Dashboard
            </h1>
            <p className="text-gray-600">
              Manage and track recruitment leads
            </p>
          </div>
          <div className="flex gap-3">
            {selectedLeadIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected ({selectedLeadIds.length})
              </button>
            )}
            <button
              onClick={() => {
                setEditingLead(null)
                setIsAddLeadModalOpen(true)
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Main Site
            </Link>
            <button
              onClick={() => window.location.href = '/admin/recruitment/whatsapp-messages'}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Messages
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

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
            highlightedLeadId={highlightedLeadId}
          />
        </div>

        {/* Add/Edit Lead Modal */}
        <AddLeadModal
          isOpen={isAddLeadModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleAddLeadSuccess}
          editLead={editingLead}
        />

        {/* WhatsApp Message Modal */}
        <SendWhatsAppModal
          isOpen={isWhatsAppModalOpen}
          onClose={handleCloseWhatsAppModal}
          onSuccess={handleWhatsAppSuccess}
          lead={whatsAppLead}
        />

        {/* Message History Modal */}
        <MessageHistoryModal
          isOpen={isMessageHistoryOpen}
          onClose={handleCloseMessageHistory}
          lead={messageHistoryLead}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Leads</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete {selectedLeadIds.length} lead{selectedLeadIds.length !== 1 ? 's' : ''}? This will permanently remove {selectedLeadIds.length === 1 ? 'this lead' : 'these leads'} from your database.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
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
