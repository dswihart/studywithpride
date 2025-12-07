"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/LanguageContext"
import TrackingLinksPanel from "./TrackingLinksPanel"
import FunnelStatusTracker from "./Funnel/FunnelStatusTracker"
import FunnelStageBadge from "./Funnel/FunnelStageBadge"
import {
  FunnelStageNumber,
  LeadWithFunnel,
  LeadFunnelData,
  Program,
  Intake,
  ConversionData,
} from "@/lib/funnel/types"

interface Lead {
  id: string
  country: string
  contact_status: string
  last_contact_date: string | null
  notes: string | null
  created_at: string
  created_time: string | null
  prospect_email: string | null
  prospect_name: string | null
  referral_source: string | null
  phone: string | null
  campaign: string | null
  campaign_name: string | null
  barcelona_timeline: number | null
  date_imported: string | null
  name_score: number | null
  email_score: number | null
  phone_valid: boolean | null
  is_duplicate: boolean
  recency_score: number | null
  lead_score: number | null
  lead_quality: string | null
  recruit_priority: number | null
  intake: string | null
  funnel_stage?: number
  funnel_data?: LeadFunnelData
  converted_to_student?: boolean
  converted_at?: string | null
  student_id?: string | null
}

interface ContactHistory {
  id: string
  lead_id: string
  contact_type: string
  outcome: string
  notes: string | null
  contacted_at: string
  created_at: string
  follow_up_action: string | null
  meets_education_level: boolean
  english_level_basic: boolean
  has_valid_passport: boolean
  confirmed_financial_support: boolean
  ready_to_proceed: boolean
  readiness_comments: string | null
  intake_period: string | null
}

interface ViewLeadModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead | null
  onEdit?: (lead: Lead) => void
  onLogContact?: (lead: Lead) => void
}

type TabType = "overview" | "funnel" | "history"

export default function ViewLeadModal({ isOpen, onClose, lead, onEdit, onLogContact }: ViewLeadModalProps) {
  const { t } = useLanguage()
  const [contactHistory, setContactHistory] = useState<ContactHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [programs, setPrograms] = useState<Program[]>([])
  const [intakes, setIntakes] = useState<Intake[]>([])
  const [loadingFunnel, setLoadingFunnel] = useState(false)

  useEffect(() => {
    if (isOpen && lead) {
      fetchContactHistory()
      fetchFunnelData()
    }
  }, [isOpen, lead])

  const fetchContactHistory = async () => {
    if (!lead) return
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/recruiter/contact-log?lead_id=${lead.id}`)
      const result = await response.json()
      if (result.success) {
        setContactHistory(result.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch contact history:", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const fetchFunnelData = async () => {
    setLoadingFunnel(true)
    try {
      const [programsRes, intakesRes] = await Promise.all([
        fetch("/api/recruiter/funnel?type=programs"),
        fetch("/api/recruiter/funnel?type=intakes")
      ])
      const programsData = await programsRes.json()
      const intakesData = await intakesRes.json()
      if (programsData.success) setPrograms(programsData.data.programs || [])
      if (intakesData.success) setIntakes(intakesData.data.intakes || [])
    } catch (error) {
      console.error("Failed to fetch funnel data:", error)
    } finally {
      setLoadingFunnel(false)
    }
  }

  const handleSaveStage = async (leadId: string, stage: FunnelStageNumber, data: any) => {
    const response = await fetch("/api/recruiter/funnel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: leadId, stage, stage_data: data })
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.error)
  }

  const handleCompleteStage = async (leadId: string, stage: FunnelStageNumber) => {
    const response = await fetch("/api/recruiter/funnel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: leadId, complete_stage: stage })
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.error)
  }

  const handleConvertToStudent = async (data: ConversionData) => {
    const response = await fetch("/api/recruiter/funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: lead?.id,
        student_email: data.studentEmail,
        generate_password: data.generatePassword,
        send_welcome_email: data.sendWelcomeEmail,
        enable_document_upload: data.enableDocumentUpload,
        enable_interview_scheduling: data.enableInterviewScheduling,
        notes: data.notes
      })
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.error)
  }

  if (!isOpen || !lead) return null

  const leadWithFunnel: LeadWithFunnel = {
    ...lead,
    prospect_name: lead.prospect_name || "Unknown",
    prospect_email: lead.prospect_email || "",
    phone: lead.phone || null,
    funnel_stage: (lead.funnel_stage || 1) as FunnelStageNumber,
    funnel_data: lead.funnel_data || null,
    converted_to_student: lead.converted_to_student || false,
    converted_at: lead.converted_at || null,
    student_id: lead.student_id || null,
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
    } catch {
      return "N/A"
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return "N/A"
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      not_contacted: "bg-gray-100 text-gray-800",
      contacted: "bg-blue-100 text-blue-800",
      interested: "bg-yellow-100 text-yellow-800",
      qualified: "bg-green-100 text-green-800",
      converted: "bg-purple-100 text-purple-800",
      unqualified: "bg-red-100 text-red-800",
      referral: "bg-cyan-100 text-cyan-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getQualityColor = (quality: string | null) => {
    const colors: Record<string, string> = {
      High: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-orange-100 text-orange-800",
      "Very Low": "bg-red-100 text-red-800",
    }
    return quality ? colors[quality] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800"
  }

  const hasReadinessData = (entry: ContactHistory) => {
    return entry.meets_education_level || entry.english_level_basic || entry.has_valid_passport ||
           entry.confirmed_financial_support || entry.ready_to_proceed || entry.intake_period
  }

  const getReadinessCount = (entry: ContactHistory) => {
    return [
      entry.meets_education_level, entry.english_level_basic,
      entry.has_valid_passport, entry.confirmed_financial_support
    ].filter(Boolean).length
  }

  const tabs = [
    { id: "overview" as TabType, label: "Overview" },
    { id: "funnel" as TabType, label: "Recruitment Funnel" },
    { id: "history" as TabType, label: "Contact History" },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lead.prospect_name || "Unknown Lead"}
                </h2>
                <FunnelStageBadge currentStage={leadWithFunnel.funnel_stage} completedStages={leadWithFunnel.funnel_data?.completedStages || []} size="md" showLabel />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.contact_status)}`}>
                  {lead.contact_status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </span>
                {lead.lead_quality && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getQualityColor(lead.lead_quality)}`}>
                    {lead.lead_quality} {lead.lead_score !== null && `(${lead.lead_score})`}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[65vh] overflow-y-auto">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <p className="text-gray-900 dark:text-white">{lead.prospect_email || "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                      <p className="text-gray-900 dark:text-white flex items-center gap-2">
                        {lead.phone || "N/A"}
                        {lead.phone_valid && <span className="text-green-500">Valid</span>}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Country</label>
                      <p className="text-gray-900 dark:text-white">{lead.country}</p>
                    </div>

                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dates</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Date Added</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(lead.date_imported || lead.created_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Last Contact</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(lead.last_contact_date)}</p>
                    </div>
                  </div>
                </div>

                {lead.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{lead.notes}</p>
                    </div>
                  </div>
                )}

                <TrackingLinksPanel leadId={lead.id} leadName={lead.prospect_name || "Lead"} />
              </div>
            )}

            {/* Funnel Tab */}
            {activeTab === "funnel" && (
              <div>
                {loadingFunnel ? (
                  <div className="flex items-center justify-center py-12">
                    <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : (
                  <FunnelStatusTracker
                    lead={leadWithFunnel}
                    programs={programs}
                    intakes={intakes}
                    onSaveStage={handleSaveStage}
                    onCompleteStage={handleCompleteStage}
                    onConvertToStudent={handleConvertToStudent}
                    onRefresh={fetchFunnelData}
                  />
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div>
                {loadingHistory ? (
                  <p className="text-gray-500">Loading history...</p>
                ) : contactHistory.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No contact history yet.</p>
                ) : (
                  <div className="space-y-3">
                    {contactHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 ${entry.ready_to_proceed ? "border-green-500" : "border-blue-500"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {entry.outcome?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Contact"}
                            </span>
                            {entry.ready_to_proceed && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded-full font-medium">
                                Ready to Proceed
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateTime(entry.contacted_at)}
                          </span>
                        </div>

                        {entry.follow_up_action && (
                          <div className="mb-2 text-sm text-blue-600 dark:text-blue-400">
                            Next: {entry.follow_up_action}
                          </div>
                        )}

                        {entry.notes && (
                          <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap mb-2">{entry.notes}</p>
                        )}

                        {hasReadinessData(entry) && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <button
                              onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                              <svg
                                className={`w-4 h-4 transition-transform ${expandedEntry === entry.id ? "rotate-90" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span>Readiness: {getReadinessCount(entry)}/4 items checked</span>
                              {entry.intake_period && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs rounded">
                                  {entry.intake_period.charAt(0).toUpperCase() + entry.intake_period.slice(1)} Intake
                                </span>
                              )}
                            </button>

                            {expandedEntry === entry.id && (
                              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                <div className={`flex items-center gap-2 ${entry.meets_education_level ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                                  <span>{entry.meets_education_level ? "[x]" : "[ ]"}</span>
                                  <span>Meets education level</span>
                                </div>
                                <div className={`flex items-center gap-2 ${entry.english_level_basic ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                                  <span>{entry.english_level_basic ? "[x]" : "[ ]"}</span>
                                  <span>English level basic</span>
                                </div>
                                <div className={`flex items-center gap-2 ${entry.has_valid_passport ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                                  <span>{entry.has_valid_passport ? "[x]" : "[ ]"}</span>
                                  <span>Has valid passport</span>
                                </div>
                                <div className={`flex items-center gap-2 ${entry.confirmed_financial_support ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                                  <span>{entry.confirmed_financial_support ? "[x]" : "[ ]"}</span>
                                  <span>Confirmed financial support</span>
                                </div>
                                {entry.readiness_comments && (
                                  <div className="col-span-2 mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300">
                                    <span className="font-medium">Comments:</span> {entry.readiness_comments}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              Close
            </button>
            {onLogContact && (
              <button onClick={() => onLogContact(lead)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Log Contact
              </button>
            )}
            {onEdit && (
              <button onClick={() => onEdit(lead)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Lead
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
