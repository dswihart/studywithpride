"use client"

import { useState, useEffect } from "react"
import { Stage3Data, DEFAULT_STAGE3_DATA, LeadWithFunnel } from "@/lib/funnel/types"

interface Stage3DocumentsVerifiedProps {
  lead: LeadWithFunnel
  data: Stage3Data | null
  onSave: (data: Stage3Data) => Promise<void>
  onComplete: () => void
  onBack: () => void
  isEditing?: boolean
}

type DocumentStatus = 'not_started' | 'in_progress' | 'verified' | 'issue' | 'not_required'

export default function Stage3DocumentsVerified({
  lead,
  data,
  onSave,
  onComplete,
  onBack,
  isEditing = false,
}: Stage3DocumentsVerifiedProps) {
  const [formData, setFormData] = useState<Stage3Data>(data || DEFAULT_STAGE3_DATA)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  // Calculate readiness score
  useEffect(() => {
    const calculateScore = () => {
      let score = 0
      let totalWeight = 0

      // Passport (25%)
      totalWeight += 25
      if (formData.passportStatus === 'verified') score += 25

      // Education (25%)
      totalWeight += 25
      if (formData.transcriptsStatus === 'verified') score += 25

      // English (25%)
      if (formData.englishStatus !== 'not_required') {
        totalWeight += 25
        if (formData.englishStatus === 'verified') score += 25
      }

      // Financial (25%)
      totalWeight += 25
      if (formData.bankStatementsStatus === 'verified') {
        if (formData.sponsorLetterRequired) {
          if (formData.sponsorLetterStatus === 'verified') score += 25
          else score += 12.5
        } else {
          score += 25
        }
      }

      const readinessScore = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0
      setFormData((prev) => ({ ...prev, readinessScore }))
    }

    calculateScore()
  }, [
    formData.passportStatus,
    formData.transcriptsStatus,
    formData.englishStatus,
    formData.bankStatementsStatus,
    formData.sponsorLetterRequired,
    formData.sponsorLetterStatus,
  ])

  const handleChange = (field: keyof Stage3Data, value: any) => {
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

  const canComplete = formData.readinessScore >= 75

  const statusOptions: { value: DocumentStatus; label: string; color: string }[] = [
    { value: 'not_started', label: 'Not Started', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    { value: 'verified', label: 'Verified', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'issue', label: 'Issue', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  ]

  const getStatusColor = (status: DocumentStatus) => {
    return statusOptions.find((s) => s.value === status)?.color || statusOptions[0].color
  }

  const englishTests = [
    { value: 'ielts', label: 'IELTS' },
    { value: 'toefl', label: 'TOEFL' },
    { value: 'cambridge', label: 'Cambridge' },
    { value: 'duolingo', label: 'Duolingo' },
    { value: 'native', label: 'Native Speaker' },
    { value: 'other', label: 'Other' },
  ]

  const degreeOptions = [
    { value: 'high_school', label: 'High School' },
    { value: 'associate', label: 'Associate Degree' },
    { value: 'bachelor', label: "Bachelor's Degree" },
    { value: 'master', label: "Master's Degree" },
    { value: 'doctorate', label: 'Doctorate' },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400'
    if (score >= 50) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBarColor = (score: number) => {
    if (score >= 75) return 'bg-green-500'
    if (score >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header with Readiness Score */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stage 3: Documents Verified
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Verify that {lead.prospect_name || "the lead"} has required documents
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(formData.readinessScore)}`}>
            {formData.readinessScore}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Readiness Score</div>
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full ${getScoreBarColor(formData.readinessScore)} transition-all duration-300`}
              style={{ width: `${formData.readinessScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Document Sections */}
      <div className="space-y-4">
        {/* Passport Section */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <h4 className="font-medium text-gray-900 dark:text-white">Passport</h4>
            </div>
            <select
              value={formData.passportStatus}
              onChange={(e) => handleChange('passportStatus', e.target.value as DocumentStatus)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.passportStatus)}`}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Has Valid Passport?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleChange('hasValidPassport', true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.hasValidPassport === true
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('hasValidPassport', false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.hasValidPassport === false
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.passportExpiry || ''}
                onChange={(e) => handleChange('passportExpiry', e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
              <h4 className="font-medium text-gray-900 dark:text-white">Education</h4>
            </div>
            <select
              value={formData.transcriptsStatus}
              onChange={(e) => handleChange('transcriptsStatus', e.target.value as DocumentStatus)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.transcriptsStatus)}`}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Highest Degree
              </label>
              <select
                value={formData.highestDegree || ''}
                onChange={(e) => handleChange('highestDegree', e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              >
                <option value="">Select degree...</option>
                {degreeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Verified?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleChange('educationVerified', true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.educationVerified === true
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('educationVerified', false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.educationVerified === false
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* English Test Section */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <h4 className="font-medium text-gray-900 dark:text-white">English Proficiency</h4>
            </div>
            <select
              value={formData.englishStatus}
              onChange={(e) => handleChange('englishStatus', e.target.value as DocumentStatus)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.englishStatus)}`}
            >
              {[...statusOptions, { value: 'not_required' as DocumentStatus, label: 'Not Required', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' }].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {formData.englishStatus !== 'not_required' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Test Type
                </label>
                <select
                  value={formData.englishTest || ''}
                  onChange={(e) => handleChange('englishTest', e.target.value || null)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="">Select test...</option>
                  {englishTests.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Score
                </label>
                <input
                  type="text"
                  value={formData.englishScore || ''}
                  onChange={(e) => handleChange('englishScore', e.target.value || null)}
                  placeholder="e.g., 7.0, 100"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Financial Documents Section */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-medium text-gray-900 dark:text-white">Financial Documents</h4>
            </div>
            <select
              value={formData.bankStatementsStatus}
              onChange={(e) => handleChange('bankStatementsStatus', e.target.value as DocumentStatus)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.bankStatementsStatus)}`}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="financialDocsReady"
                checked={formData.financialDocsReady || false}
                onChange={(e) => handleChange('financialDocsReady', e.target.checked)}
                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="financialDocsReady" className="text-sm text-gray-700 dark:text-gray-300">
                Financial documents ready (bank statements, proof of funds)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="sponsorLetterRequired"
                checked={formData.sponsorLetterRequired}
                onChange={(e) => handleChange('sponsorLetterRequired', e.target.checked)}
                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="sponsorLetterRequired" className="text-sm text-gray-700 dark:text-gray-300">
                Sponsor letter required
              </label>
            </div>

            {formData.sponsorLetterRequired && (
              <div className="ml-7">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Sponsor Letter Status
                </label>
                <select
                  value={formData.sponsorLetterStatus}
                  onChange={(e) => handleChange('sponsorLetterStatus', e.target.value as DocumentStatus)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.sponsorLetterStatus)}`}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Verification Notes
        </label>
        <textarea
          value={formData.verificationNotes || ''}
          onChange={(e) => handleChange('verificationNotes', e.target.value || null)}
          rows={3}
          placeholder="Add any notes about document verification..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
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

        <button
          onClick={onComplete}
          disabled={!canComplete}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
            ${canComplete
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Complete Stage
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {!canComplete && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Readiness score must be at least 75% to proceed (currently {formData.readinessScore}%)
        </p>
      )}
    </div>
  )
}
