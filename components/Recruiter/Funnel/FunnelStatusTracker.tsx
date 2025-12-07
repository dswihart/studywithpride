"use client"

import { useState, useEffect } from "react"
import {
  FunnelStageNumber,
  LeadWithFunnel,
  LeadFunnelData,
  Stage1Data,
  Stage2Data,
  Stage3Data,
  Stage4Data,
  Program,
  Intake,
  ConversionData,
  DEFAULT_STAGE1_DATA,
  DEFAULT_STAGE2_DATA,
  DEFAULT_STAGE3_DATA,
  DEFAULT_STAGE4_DATA,
} from "@/lib/funnel/types"
import FunnelProgressBar from "./FunnelProgressBar"
import Stage1Contacted from "./Stage1Contacted"
import Stage2ProgramConfirmed from "./Stage2ProgramConfirmed"
import Stage3DocumentsVerified from "./Stage3DocumentsVerified"
import Stage4ReadyForInterview from "./Stage4ReadyForInterview"
import ConvertToStudentModal from "./ConvertToStudentModal"

interface FunnelStatusTrackerProps {
  lead: LeadWithFunnel
  programs: Program[]
  intakes: Intake[]
  onSaveStage: (leadId: string, stage: FunnelStageNumber, data: any) => Promise<void>
  onCompleteStage: (leadId: string, stage: FunnelStageNumber) => Promise<void>
  onConvertToStudent: (data: ConversionData) => Promise<void>
  onRefresh?: () => void
}

export default function FunnelStatusTracker({
  lead,
  programs,
  intakes,
  onSaveStage,
  onCompleteStage,
  onConvertToStudent,
  onRefresh,
}: FunnelStatusTrackerProps) {
  const [activeStage, setActiveStage] = useState<FunnelStageNumber>((lead?.funnel_stage || 1) as FunnelStageNumber)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize funnel data with proper defaults for nested properties
  const rawFunnelData = (lead.funnel_data || {}) as Partial<LeadFunnelData>
  const funnelData: LeadFunnelData = {
    leadId: rawFunnelData.leadId || lead.id,
    currentStage: rawFunnelData.currentStage || lead.funnel_stage || 1,
    stages: {
      stage1: rawFunnelData.stages?.stage1 || null,
      stage2: rawFunnelData.stages?.stage2 || null,
      stage3: rawFunnelData.stages?.stage3 || null,
      stage4: rawFunnelData.stages?.stage4 || null,
    },
    completedStages: rawFunnelData.completedStages || [],
    convertedToStudent: rawFunnelData.convertedToStudent || false,
    convertedAt: rawFunnelData.convertedAt || null,
    studentId: rawFunnelData.studentId || null,
    applicationId: rawFunnelData.applicationId || null,
  }

  // Update active stage when lead changes
  useEffect(() => {
    setActiveStage((lead?.funnel_stage || 1) as FunnelStageNumber)
  }, [lead.funnel_stage])

  const completedStages = funnelData.completedStages || []

  const handleStageClick = (stage: FunnelStageNumber) => {
    // Allow clicking on completed stages or current stage
    if (completedStages.includes(stage) || stage === funnelData.currentStage) {
      setActiveStage(stage)
    }
  }

  const handleSaveStage1 = async (data: Stage1Data) => {
    setIsLoading(true)
    try {
      await onSaveStage(lead.id, 1, data)
      onRefresh?.()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveStage2 = async (data: Stage2Data) => {
    setIsLoading(true)
    try {
      await onSaveStage(lead.id, 2, data)
      onRefresh?.()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveStage3 = async (data: Stage3Data) => {
    setIsLoading(true)
    try {
      await onSaveStage(lead.id, 3, data)
      onRefresh?.()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveStage4 = async (data: Stage4Data) => {
    setIsLoading(true)
    try {
      await onSaveStage(lead.id, 4, data)
      onRefresh?.()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteStage = async (stage: FunnelStageNumber) => {
    setIsLoading(true)
    try {
      await onCompleteStage(lead.id, stage)
      // Move to next stage
      if (stage < 4) {
        setActiveStage((stage + 1) as FunnelStageNumber)
      }
      onRefresh?.()
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (activeStage > 1) {
      setActiveStage((activeStage - 1) as FunnelStageNumber)
    }
  }

  const handleConvert = async (data: ConversionData) => {
    setIsLoading(true)
    try {
      await onConvertToStudent(data)
      setShowConvertModal(false)
      onRefresh?.()
    } finally {
      setIsLoading(false)
    }
  }

  // If already converted, show a success state
  if (lead.converted_to_student) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Converted to Student
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {lead.prospect_name} has been successfully converted to a student.
          </p>
          {lead.converted_at && (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Converted on {new Date(lead.converted_at).toLocaleDateString()}
            </p>
          )}
          {lead.student_id && (
            <a
              href={`/students/${lead.student_id}`}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header with Progress */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recruitment Funnel
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Stage {funnelData.currentStage} of 4
          </span>
        </div>
        <FunnelProgressBar
          currentStage={funnelData.currentStage}
          completedStages={completedStages}
          onStageClick={handleStageClick}
          size="md"
        />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400">Saving...</span>
          </div>
        </div>
      )}

      {/* Stage Content */}
      <div className="p-6 relative">
        {activeStage === 1 && (
          <Stage1Contacted
            lead={lead}
            data={funnelData.stages.stage1}
            onSave={handleSaveStage1}
            onComplete={() => handleCompleteStage(1)}
            isEditing={completedStages.includes(1)}
          />
        )}

        {activeStage === 2 && (
          <Stage2ProgramConfirmed
            lead={lead}
            data={funnelData.stages.stage2}
            programs={programs}
            intakes={intakes}
            onSave={handleSaveStage2}
            onComplete={() => handleCompleteStage(2)}
            onBack={handleBack}
            isEditing={completedStages.includes(2)}
          />
        )}

        {activeStage === 3 && (
          <Stage3DocumentsVerified
            lead={lead}
            data={funnelData.stages.stage3}
            onSave={handleSaveStage3}
            onComplete={() => handleCompleteStage(3)}
            onBack={handleBack}
            isEditing={completedStages.includes(3)}
          />
        )}

        {activeStage === 4 && (
          <Stage4ReadyForInterview
            lead={lead}
            funnelData={funnelData}
            data={funnelData.stages.stage4}
            onSave={handleSaveStage4}
            onConvert={() => setShowConvertModal(true)}
            onBack={handleBack}
            isEditing={completedStages.includes(4)}
          />
        )}
      </div>

      {/* Convert Modal */}
      <ConvertToStudentModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        lead={lead}
        funnelData={funnelData}
        onConvert={handleConvert}
      />
    </div>
  )
}
