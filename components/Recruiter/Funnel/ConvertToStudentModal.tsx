"use client"

import { useState } from "react"
import { LeadWithFunnel, LeadFunnelData, ConversionData } from "@/lib/funnel/types"

interface ConvertToStudentModalProps {
  isOpen: boolean
  onClose: () => void
  lead: LeadWithFunnel
  funnelData: LeadFunnelData
  onConvert: (data: ConversionData) => Promise<void>
}

type Step = 1 | 2 | 3

export default function ConvertToStudentModal({
  isOpen,
  onClose,
  lead,
  funnelData,
  onConvert,
}: ConvertToStudentModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionData, setConversionData] = useState<ConversionData>({
    leadId: lead.id,
    studentEmail: lead.prospect_email || "",
    generatePassword: true,
    sendWelcomeEmail: true,
    enableDocumentUpload: true,
    enableInterviewScheduling: true,
    notes: null,
  })

  if (!isOpen) return null

  const handleChange = (field: keyof ConversionData, value: any) => {
    setConversionData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const handleConvert = async () => {
    setIsConverting(true)
    try {
      await onConvert(conversionData)
      onClose()
    } finally {
      setIsConverting(false)
    }
  }

  const stage2 = funnelData.stages.stage2

  const steps = [
    { number: 1, title: "Verify Info" },
    { number: 2, title: "Account Setup" },
    { number: 3, title: "Confirm" },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Convert to Student
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm
                        ${currentStep === step.number
                          ? "bg-green-500 text-white"
                          : currentStep > step.number
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }
                      `}
                    >
                      {currentStep > step.number ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-2 ${
                        currentStep > step.number
                          ? "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Verify Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Please verify the following information is correct before proceeding.
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Full Name</span>
                    <span className="font-medium text-gray-900 dark:text-white">{lead.prospect_name || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Email</span>
                    <span className="font-medium text-gray-900 dark:text-white">{lead.prospect_email || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Phone</span>
                    <span className="font-medium text-gray-900 dark:text-white">{lead.phone || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Country</span>
                    <span className="font-medium text-gray-900 dark:text-white">{lead.country || "-"}</span>
                  </div>
                  {stage2 && (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Program</span>
                        <span className="font-medium text-gray-900 dark:text-white">{stage2.programName || "-"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Intake</span>
                        <span className="font-medium text-gray-900 dark:text-white">{stage2.intakePeriod || "-"}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Account Setup */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Configure the student account settings.
                </p>

                <div className="space-y-4">
                  {/* Email for login */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Student Email (for login)
                    </label>
                    <input
                      type="email"
                      value={conversionData.studentEmail}
                      onChange={(e) => handleChange("studentEmail", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <input
                        type="checkbox"
                        id="generatePassword"
                        checked={conversionData.generatePassword}
                        onChange={(e) => handleChange("generatePassword", e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div>
                        <label htmlFor="generatePassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Auto-generate password
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Generate a secure random password for the student
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <input
                        type="checkbox"
                        id="sendWelcomeEmail"
                        checked={conversionData.sendWelcomeEmail}
                        onChange={(e) => handleChange("sendWelcomeEmail", e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div>
                        <label htmlFor="sendWelcomeEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Send welcome email
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Email login credentials and portal information
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <input
                        type="checkbox"
                        id="enableDocumentUpload"
                        checked={conversionData.enableDocumentUpload}
                        onChange={(e) => handleChange("enableDocumentUpload", e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div>
                        <label htmlFor="enableDocumentUpload" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Enable document uploads
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Allow student to upload documents in their portal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <input
                        type="checkbox"
                        id="enableInterviewScheduling"
                        checked={conversionData.enableInterviewScheduling}
                        onChange={(e) => handleChange("enableInterviewScheduling", e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div>
                        <label htmlFor="enableInterviewScheduling" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Enable interview scheduling
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Allow student to schedule their admission interview
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={conversionData.notes || ""}
                      onChange={(e) => handleChange("notes", e.target.value || null)}
                      rows={2}
                      placeholder="Add any notes for the conversion..."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Ready to Convert
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You&apos;re about to convert this lead to a student account.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-400">
                        Account: <span className="text-gray-900 dark:text-white">{conversionData.studentEmail}</span>
                      </span>
                    </div>
                    {conversionData.generatePassword && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400">Password will be auto-generated</span>
                      </div>
                    )}
                    {conversionData.sendWelcomeEmail && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400">Welcome email will be sent</span>
                      </div>
                    )}
                    {conversionData.enableDocumentUpload && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400">Document uploads enabled</span>
                      </div>
                    )}
                    {conversionData.enableInterviewScheduling && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400">Interview scheduling enabled</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        This action cannot be undone
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        The lead will be marked as converted and a new student account will be created.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button
              onClick={currentStep === 1 ? onClose : handleBack}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={currentStep === 2 && !conversionData.studentEmail}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                  ${currentStep === 2 && !conversionData.studentEmail
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                  }
                `}
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                {isConverting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Converting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Convert to Student
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
