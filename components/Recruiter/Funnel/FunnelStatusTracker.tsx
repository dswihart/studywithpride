"use client"

import { useState, useEffect } from "react"
import { LeadWithFunnel, FunnelStageNumber } from "@/lib/funnel/types"

interface ContactHistoryEntry {
  id: string
  outcome: string | null
  has_funds: boolean
  confirmed_financial_support: boolean
  has_valid_passport: boolean
  has_education_docs: boolean
  meets_education_level: boolean
  ready_to_proceed: boolean
  english_level_basic: boolean
  intake_period: string | null
}

interface FunnelStatusTrackerProps {
  lead: LeadWithFunnel
  programs?: any[]
  intakes?: any[]
  onSaveStage?: (leadId: string, stage: FunnelStageNumber, data: any) => Promise<void>
  onCompleteStage?: (leadId: string, stage: FunnelStageNumber) => Promise<void>
  onConvertToStudent?: (data: any) => Promise<void>
  onRefresh?: () => void
}

const FUNNEL_STAGES = [
  { number: 1, key: "interested", label: "Interested", color: "amber" },
  { number: 2, key: "education", label: "Education", color: "purple" },
  { number: 3, key: "english", label: "English", color: "blue" },
  { number: 4, key: "funds", label: "Funds", color: "green" },
]

export default function FunnelStatusTracker({ lead, onConvertToStudent }: FunnelStatusTrackerProps) {
  const [contactHistory, setContactHistory] = useState<ContactHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContactHistory = async () => {
      try {
        const response = await fetch(`/api/recruiter/contact-log?lead_id=${lead.id}`)
        const result = await response.json()
        if (result.success && result.data) {
          setContactHistory(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch contact history:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchContactHistory()
  }, [lead.id])

  const getStatus = () => {
    const isInterested = (lead.funnel_stage && lead.funnel_stage >= 1) || lead.contact_status === "interested" ||
      contactHistory.some(c => {
        const outcome = c.outcome?.toLowerCase() || ""
        return outcome.includes("interested") && !outcome.includes("not interested")
      })
    const hasEducation = (lead.funnel_stage && lead.funnel_stage >= 2) || contactHistory.some(c => c.has_education_docs || c.meets_education_level)
    const hasEnglish = (lead.funnel_stage && lead.funnel_stage >= 3) || contactHistory.some(c => c.ready_to_proceed || c.english_level_basic)
    const hasFunds = (lead.funnel_stage && lead.funnel_stage >= 4) || contactHistory.some(c => c.has_funds || c.confirmed_financial_support)
    const latestIntake = contactHistory.find(c => c.intake_period)?.intake_period || null

    return { isInterested, hasEducation, hasEnglish, hasFunds, latestIntake }
  }

  const status = getStatus()

  const isStageComplete = (key: string) => {
    switch (key) {
      case "interested": return status.isInterested
      case "education": return status.hasEducation
      case "english": return status.hasEnglish
      case "funds": return status.hasFunds
      default: return false
    }
  }

  const getCompletedCount = () => {
    let count = 0
    if (status.isInterested) count++
    if (status.hasEducation) count++
    if (status.hasEnglish) count++
    if (status.hasFunds) count++
    return count
  }

  const handleConvert = async () => {
    if (!onConvertToStudent) {
      setError("Conversion handler not configured")
      return
    }

    if (!lead.prospect_email) {
      setError("Lead must have an email address to convert")
      return
    }

    setConverting(true)
    setError(null)

    try {
      await onConvertToStudent({
        leadId: lead.id,
        studentEmail: lead.prospect_email,
        generatePassword: true,
        sendWelcomeEmail: true,
        enableDocumentUpload: true,
        enableInterviewScheduling: true,
        notes: null,
      })
    } catch (err: any) {
      console.error("Conversion failed:", err)
      setError(err.message || "Conversion failed. Please try again.")
    } finally {
      setConverting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (lead.converted_to_student) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Converted to Student</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{lead.prospect_name} is now in the Student Portal.</p>
          {lead.student_id && (
            <a
              href="/admin/students"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Student Profile
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    )
  }

  const completedCount = getCompletedCount()
  const allComplete = completedCount === 4

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recruitment Funnel</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{completedCount} of 4</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between">
          {FUNNEL_STAGES.map((stage, index) => {
            const complete = isStageComplete(stage.key)
            const prevComplete = index > 0 ? isStageComplete(FUNNEL_STAGES[index - 1].key) : false
            return (
              <div key={stage.key} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {index > 0 && (
                    <div className={"h-0.5 flex-1 " + (prevComplete ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600")} />
                  )}
                  <div className={"w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 " + (complete ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600")}>
                    {complete ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-white text-sm font-bold">{stage.number}</span>
                    )}
                  </div>
                  {index < FUNNEL_STAGES.length - 1 && (
                    <div className={"h-0.5 flex-1 " + (complete ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600")} />
                  )}
                </div>
                <span className={"text-xs mt-2 text-center font-medium " + (complete ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400")}>
                  {stage.label}
                </span>
              </div>
            )
          })}
        </div>

        {status.latestIntake && (
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Target Intake:</span> {status.latestIntake}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {allComplete && !lead.converted_to_student && onConvertToStudent && (
          <div className="mt-6">
            <button
              onClick={handleConvert}
              disabled={converting}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {converting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Converting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Convert to Student Portal
                </>
              )}
            </button>
          </div>
        )}

        {contactHistory.length === 0 && (
          <div className="mt-4 text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update status via the Contact Log readiness checklist.
            </p>
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Updated from Contact Log checklist
        </p>
      </div>
    </div>
  )
}
