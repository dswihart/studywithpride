"use client"

import { useState, useEffect } from "react"
import { Stage1Data, DEFAULT_STAGE1_DATA, LeadWithFunnel } from "@/lib/funnel/types"

interface Stage1ContactedProps {
  lead: LeadWithFunnel
  data: Stage1Data | null
  onSave: (data: Stage1Data) => Promise<void>
  onComplete: () => void
  isEditing?: boolean
}

export default function Stage1Contacted({
  lead,
  data,
  onSave,
  onComplete,
  isEditing = false,
}: Stage1ContactedProps) {
  const [formData, setFormData] = useState<Stage1Data>(data || DEFAULT_STAGE1_DATA)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  const handleChange = (field: keyof Stage1Data, value: any) => {
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

  const canComplete = formData.contactMethod && formData.interestLevel && formData.responseDate

  const contactMethods = [
    { value: "phone", label: "Phone Call", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
    { value: "whatsapp", label: "WhatsApp", icon: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" },
    { value: "email", label: "Email", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { value: "in_person", label: "In Person", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  ]

  const interestLevels = [
    { value: "low", label: "Low", color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800" },
    { value: "medium", label: "Medium", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800" },
    { value: "high", label: "High", color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stage 1: Contacted & Interested
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Record initial contact details with {lead.prospect_name || "this lead"}
          </p>
        </div>
        {hasChanges && (
          <span className="text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>
        )}
      </div>

      {/* Contact Method */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Contact Method *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {contactMethods.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => handleChange("contactMethod", method.value)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                ${formData.contactMethod === method.value
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }
              `}
            >
              <svg
                className={`w-6 h-6 ${formData.contactMethod === method.value ? "text-amber-600" : "text-gray-400"}`}
                fill={method.value === "whatsapp" ? "currentColor" : "none"}
                stroke={method.value === "whatsapp" ? "none" : "currentColor"}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={method.icon} />
              </svg>
              <span className={`text-sm font-medium ${formData.contactMethod === method.value ? "text-amber-700 dark:text-amber-300" : "text-gray-600 dark:text-gray-400"}`}>
                {method.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Interest Level */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Interest Level *
        </label>
        <div className="flex gap-3">
          {interestLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => handleChange("interestLevel", level.value)}
              className={`
                flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all
                ${formData.interestLevel === level.value
                  ? `${level.color} border-current`
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                }
              `}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Response Date */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Response Date *
        </label>
        <input
          type="date"
          value={formData.responseDate || ""}
          onChange={(e) => handleChange("responseDate", e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Contact Attempts */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Contact Attempts
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleChange("contactAttempts", Math.max(0, formData.contactAttempts - 1))}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-2xl font-bold text-gray-900 dark:text-white w-12 text-center">
            {formData.contactAttempts}
          </span>
          <button
            type="button"
            onClick={() => handleChange("contactAttempts", formData.contactAttempts + 1)}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Initial Notes
        </label>
        <textarea
          value={formData.initialNotes || ""}
          onChange={(e) => handleChange("initialNotes", e.target.value)}
          rows={3}
          placeholder="Add any notes about the initial contact..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
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

        <button
          onClick={onComplete}
          disabled={!canComplete}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
            ${canComplete
              ? "bg-amber-500 text-white hover:bg-amber-600"
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
          Complete all required fields (*) to proceed to the next stage
        </p>
      )}
    </div>
  )
}
