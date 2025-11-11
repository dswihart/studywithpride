"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthContext"
import type { VisaRequirement } from "@/lib/types/visa"

interface ApplicationState {
  id?: string
  university_name: string
  program_name: string
  intake_term: string
  checklist_progress: Record<string, boolean>
  visa_status: string
  application_status: string
  notes: string
}

interface ChecklistItem {
  id: string
  name: string
  description: string
  required: boolean
  format?: string
}

export default function VisaTrackerPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [applicationState, setApplicationState] = useState<ApplicationState>({
    university_name: "Sample University",
    program_name: "Sample Program",
    intake_term: "Fall 2024",
    checklist_progress: {},
    visa_status: "not_started",
    application_status: "draft",
    notes: "",
  })
  const [visaReqs, setVisaReqs] = useState<VisaRequirement | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch country-specific visa requirements
      const reqsResponse = await fetch("/api/portal/visa-requirements")
      if (reqsResponse.status === 401) {
        router.push("/login")
        return
      }
      const reqsResult = await reqsResponse.json()
      if (reqsResult.success && reqsResult.data) {
        setVisaReqs(reqsResult.data)
      }

      // Fetch visa tracking status
      const response = await fetch("/api/portal/get-visa-status")
      if (response.status === 401) {
        router.push("/login")
        return
      }
      const result = await response.json()
      if (result.success && result.data && result.data.length > 0) {
        setApplicationState(result.data[0])
      }
    } catch (err: any) {
      setError("Failed to load visa status")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckboxToggle = async (itemId: string) => {
    const newProgress = {
      ...applicationState.checklist_progress,
      [itemId]: !applicationState.checklist_progress[itemId],
    }
    setApplicationState({
      ...applicationState,
      checklist_progress: newProgress,
    })
    try {
      setSaving(true)
      const response = await fetch("/api/portal/update-visa-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...applicationState,
          checklist_progress: newProgress,
        }),
      })
      if (response.status === 401) {
        router.push("/login")
        return
      }
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || "Failed to save progress")
      }
      setApplicationState(result.data)
    } catch (err: any) {
      setError("Failed to save progress")
    } finally {
      setSaving(false)
    }
  }

  const getChecklistItems = (): ChecklistItem[] => {
    if (visaReqs && visaReqs.documents) {
      return visaReqs.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        required: doc.required,
        format: doc.format
      }))
    }

    return [
      {
        id: "passport",
        name: "Valid Passport",
        description: "Passport must be valid for at least 6 months beyond intended stay",
        required: true,
      },
      {
        id: "acceptance_letter",
        name: "University Acceptance Letter",
        description: "Official letter of acceptance from your chosen university",
        required: true,
      },
      {
        id: "proof_of_funds",
        name: "Proof of Financial Funds",
        description: "Bank statements or sponsorship letters showing sufficient funds",
        required: true,
      },
      {
        id: "visa_application",
        name: "Completed Visa Application Form",
        description: "Filled visa application form for your destination country",
        required: true,
      },
    ]
  }

  const checklistItems = getChecklistItems()
  const completedItems = Object.values(applicationState.checklist_progress).filter(Boolean).length
  const progressPercentage = Math.round((completedItems / checklistItems.length) * 100)

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your visa tracker...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Visa Application Tracker</h1>
      <p className="text-gray-600 mb-2">
        Track your progress for {applicationState.university_name}
      </p>

      {visaReqs && (
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
          <p className="text-sm font-medium text-purple-900">
            🌍 Showing requirements for: <strong>{visaReqs.countryName}</strong>
          </p>
          <p className="text-sm text-purple-700 mt-1">
            Spanish Consulate in {visaReqs.consulateCity} • Processing time: {visaReqs.processingTimeDays} days • Fee: {visaReqs.visaFee}
          </p>
        </div>
      )}

      {!visaReqs && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-sm font-medium text-yellow-900">
            ⚠️ Country not set in your profile
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Please update your profile with your country of origin to see country-specific visa requirements.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm font-medium">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {completedItems} of {checklistItems.length} items completed
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {saving && (
        <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded mb-6">
          Saving your progress...
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Document Checklist</h2>
          <div className="space-y-4">
            {checklistItems.map((item, index) => {
              const isChecked = applicationState.checklist_progress[item.id] || false
              return (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={isChecked}
                      onChange={() => handleCheckboxToggle(item.id)}
                      disabled={saving}
                      className="mt-1 h-5 w-5 rounded cursor-pointer"
                    />
                    <label htmlFor={item.id} className="ml-3 flex-1 cursor-pointer">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-medium">{index + 1}. {item.name}</span>
                        {item.required && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                        {item.format && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {item.format}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {visaReqs && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Important Notes</h3>
          <p className="text-sm text-blue-800 mb-4">{visaReqs.additionalNotes}</p>
          <a
            href="/visa"
            className="inline-block text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            → View full visa guide for {visaReqs.countryName}
          </a>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Refresh
        </button>
        <button
          onClick={() => router.push("/student-portal")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Back to Portal
        </button>
      </div>
    </div>
  )
}
