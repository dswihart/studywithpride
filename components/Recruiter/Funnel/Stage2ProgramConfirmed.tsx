"use client"

import { useState, useEffect } from "react"
import { Stage2Data, DEFAULT_STAGE2_DATA, LeadWithFunnel, Program, Intake } from "@/lib/funnel/types"

interface Stage2ProgramConfirmedProps {
  lead: LeadWithFunnel
  data: Stage2Data | null
  programs: Program[]
  intakes: Intake[]
  onSave: (data: Stage2Data) => Promise<void>
  onComplete: () => void
  onBack: () => void
  isEditing?: boolean
}

export default function Stage2ProgramConfirmed({
  lead,
  data,
  programs,
  intakes,
  onSave,
  onComplete,
  onBack,
  isEditing = false,
}: Stage2ProgramConfirmedProps) {
  const [formData, setFormData] = useState<Stage2Data>(data || DEFAULT_STAGE2_DATA)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  const handleChange = (field: keyof Stage2Data, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleProgramSelect = (program: Program) => {
    setFormData((prev) => ({
      ...prev,
      programId: program.id,
      programName: program.name,
      intakeId: null,
      intakePeriod: null,
    }))
    setHasChanges(true)
  }

  const handleIntakeSelect = (intake: Intake) => {
    setFormData((prev) => ({
      ...prev,
      intakeId: intake.id,
      intakePeriod: intake.period,
    }))
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

  const canComplete = formData.programId && formData.intakeId && formData.budgetConfirmed

  const filteredIntakes = intakes.filter((i) => i.programId === formData.programId)

  const budgetRanges = [
    { value: "under_10k", label: "Under $10,000" },
    { value: "10k_20k", label: "$10,000 - $20,000" },
    { value: "20k_30k", label: "$20,000 - $30,000" },
    { value: "30k_50k", label: "$30,000 - $50,000" },
    { value: "over_50k", label: "Over $50,000" },
  ]

  const campuses = [
    { value: "barcelona", label: "Barcelona" },
    { value: "madrid", label: "Madrid" },
    { value: "online", label: "Online" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stage 2: Program Confirmed
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Confirm program selection and intake period
          </p>
        </div>
        {hasChanges && (
          <span className="text-xs text-blue-600 dark:text-blue-400">Unsaved changes</span>
        )}
      </div>

      {/* Program Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Program *
        </label>
        <div className="grid gap-3">
          {programs.map((program) => (
            <button
              key={program.id}
              type="button"
              onClick={() => handleProgramSelect(program)}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${formData.programId === program.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-medium ${formData.programId === program.id ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}>
                    {program.name}
                  </h4>
                  {program.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {program.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {program.duration}
                  </span>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    ${program.tuitionFee.toLocaleString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Intake Selection */}
      {formData.programId && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Intake Period *
          </label>
          {filteredIntakes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredIntakes.map((intake) => {
                const spotsPercentage = (intake.spotsAvailable / intake.totalSpots) * 100
                const isLowSpots = spotsPercentage < 20

                return (
                  <button
                    key={intake.id}
                    type="button"
                    onClick={() => handleIntakeSelect(intake)}
                    disabled={intake.spotsAvailable === 0}
                    className={`
                      p-4 rounded-lg border-2 text-left transition-all
                      ${formData.intakeId === intake.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : intake.spotsAvailable === 0
                          ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }
                    `}
                  >
                    <h4 className={`font-medium ${formData.intakeId === intake.id ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}>
                      {intake.period}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Starts: {new Date(intake.startDate).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={isLowSpots ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-500 dark:text-gray-400"}>
                          {intake.spotsAvailable} spots left
                        </span>
                        <span className="text-gray-400">
                          {intake.spotsAvailable}/{intake.totalSpots}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isLowSpots ? "bg-red-500" : "bg-blue-500"}`}
                          style={{ width: `${spotsPercentage}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Deadline: {new Date(intake.applicationDeadline).toLocaleDateString()}
                    </p>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No intakes available for this program
            </p>
          )}
        </div>
      )}

      {/* Budget Confirmation */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Budget Confirmation *
        </label>
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <input
            type="checkbox"
            id="budgetConfirmed"
            checked={formData.budgetConfirmed}
            onChange={(e) => handleChange("budgetConfirmed", e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="budgetConfirmed" className="text-sm text-gray-700 dark:text-gray-300">
            Lead has confirmed they have the budget for this program
          </label>
        </div>

        {formData.budgetConfirmed && (
          <div className="space-y-2">
            <label className="block text-sm text-gray-600 dark:text-gray-400">
              Budget Range (optional)
            </label>
            <select
              value={formData.budgetRange || ""}
              onChange={(e) => handleChange("budgetRange", e.target.value || null)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select range...</option>
              {budgetRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Timeline Discussion */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Timeline Discussion
        </label>
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <input
            type="checkbox"
            id="timelineDiscussed"
            checked={formData.timelineDiscussed}
            onChange={(e) => handleChange("timelineDiscussed", e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="timelineDiscussed" className="text-sm text-gray-700 dark:text-gray-300">
            Timeline and deadlines have been discussed with the lead
          </label>
        </div>
      </div>

      {/* Preferred Campus */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Preferred Campus
        </label>
        <div className="flex gap-3">
          {campuses.map((campus) => (
            <button
              key={campus.value}
              type="button"
              onClick={() => handleChange("preferredCampus", campus.value)}
              className={`
                flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all
                ${formData.preferredCampus === campus.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                }
              `}
            >
              {campus.label}
            </button>
          ))}
        </div>
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
                ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }
            `}
          >
            {isSaving ? "Saving..." : "Save Progress"}
          </button>
        </div>

        <button
          onClick={onComplete}
          disabled={!canComplete}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
            ${canComplete
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
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
          Select a program, intake, and confirm budget to proceed
        </p>
      )}
    </div>
  )
}
