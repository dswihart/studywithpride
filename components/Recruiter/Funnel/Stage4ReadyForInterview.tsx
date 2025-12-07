"use client"

import { useState, useEffect } from "react"
import { Stage4Data, DEFAULT_STAGE4_DATA, LeadWithFunnel, LeadFunnelData } from "@/lib/funnel/types"

interface Stage4ReadyForInterviewProps {
  lead: LeadWithFunnel
  funnelData: LeadFunnelData
  data: Stage4Data | null
  onSave: (data: Stage4Data) => Promise<void>
  onConvert: () => void
  onBack: () => void
  isEditing?: boolean
}

export default function Stage4ReadyForInterview({
  lead,
  funnelData,
  data,
  onSave,
  onConvert,
  onBack,
  isEditing = false,
}: Stage4ReadyForInterviewProps) {
  const [formData, setFormData] = useState<Stage4Data>(data || DEFAULT_STAGE4_DATA)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  // Update readyToConvert based on checklist
  useEffect(() => {
    const isReady = formData.preChecklistComplete && formData.informationVerified && formData.consentObtained
    if (formData.readyToConvert !== isReady) {
      setFormData((prev) => ({ ...prev, readyToConvert: isReady }))
    }
  }, [formData.preChecklistComplete, formData.informationVerified, formData.consentObtained])

  const handleChange = (field: keyof Stage4Data, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(formData)
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  const canConvert = formData.readyToConvert

  // Get summary info from previous stages
  const stage2 = funnelData.stages.stage2
  const stage3 = funnelData.stages.stage3

  const checklistItems = [
    {
      id: 'preChecklistComplete',
      label: 'Pre-interview checklist completed',
      description: 'All required preparation steps have been completed',
      checked: formData.preChecklistComplete,
    },
    {
      id: 'informationVerified',
      label: 'All information verified',
      description: 'Lead information and documents have been double-checked',
      checked: formData.informationVerified,
    },
    {
      id: 'consentObtained',
      label: 'Consent obtained',
      description: 'Lead has consented to create student account and share data',
      checked: formData.consentObtained,
    },
  ]

  const completedChecks = checklistItems.filter((item) => item.checked).length
  const progressPercentage = (completedChecks / checklistItems.length) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stage 4: Ready for Interview
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Final verification before converting to student
          </p>
        </div>
        {hasChanges && (
          <span className="text-xs text-green-600 dark:text-green-400">Unsaved changes</span>
        )}
      </div>

      {/* Lead Summary Card */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">Lead Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400 block">Name</span>
            <span className="font-medium text-gray-900 dark:text-white">{lead.prospect_name || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400 block">Email</span>
            <span className="font-medium text-gray-900 dark:text-white">{lead.prospect_email || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400 block">Phone</span>
            <span className="font-medium text-gray-900 dark:text-white">{lead.phone || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400 block">Country</span>
            <span className="font-medium text-gray-900 dark:text-white">{lead.country || '-'}</span>
          </div>
        </div>

        {stage2 && (
          <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Program</span>
                <span className="font-medium text-gray-900 dark:text-white">{stage2.programName || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Intake</span>
                <span className="font-medium text-gray-900 dark:text-white">{stage2.intakePeriod || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Campus</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">{stage2.preferredCampus || '-'}</span>
              </div>
            </div>
          </div>
        )}

        {stage3 && (
          <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Document Readiness</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${stage3.readinessScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {stage3.readinessScore}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pre-Conversion Checklist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 dark:text-white">Pre-Conversion Checklist</h4>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completedChecks}/{checklistItems.length} complete
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Checklist items */}
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className={`
                p-4 rounded-lg border-2 transition-all cursor-pointer
                ${item.checked
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              onClick={() => handleChange(item.id as keyof Stage4Data, !item.checked)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                    ${item.checked
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600'
                    }
                  `}
                >
                  {item.checked && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <h5 className={`font-medium ${item.checked ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>
                    {item.label}
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Convert Button */}
      <div className="p-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-800">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
            Ready to Convert?
          </h4>
          <p className="text-sm text-green-600 dark:text-green-400 mb-4">
            This will create a student portal account and enable document uploads and interview scheduling.
          </p>

          <button
            onClick={onConvert}
            disabled={!canConvert}
            className={`
              px-8 py-3 rounded-lg font-medium text-lg transition-all flex items-center gap-3 mx-auto
              ${canConvert
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Convert to Student
          </button>

          {!canConvert && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">
              Complete all checklist items to enable conversion
            </p>
          )}
        </div>
      </div>

      {/* What happens next */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">What happens next?</h4>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>A student portal account will be created with login credentials</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Welcome email with login details will be sent to the student</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Document upload functionality will be enabled</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Interview scheduling will become available</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Lead data will be transferred to the student profile</span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${hasChanges
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isSaving ? 'Saving...' : 'Save Progress'}
          </button>
        </div>
      </div>
    </div>
  )
}
