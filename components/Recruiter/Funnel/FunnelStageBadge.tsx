"use client"

import { useState, useEffect } from "react"
import { FunnelStageNumber, FUNNEL_STAGES } from "@/lib/funnel/types"

interface FunnelStageBadgeProps {
  leadId: string
  contactStatus?: string
  currentStage?: FunnelStageNumber
  completedStages?: FunnelStageNumber[]
  showLabel?: boolean
  size?: "sm" | "md"
}

export default function FunnelStageBadge({
  leadId,
  contactStatus = "",
  currentStage = 1,
  completedStages: passedCompletedStages = [],
  showLabel = true,
  size = "md",
}: FunnelStageBadgeProps) {
  const [derivedCompletedStages, setDerivedCompletedStages] = useState<FunnelStageNumber[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch contact history and derive completed stages
  useEffect(() => {
    const fetchAndDeriveStages = async () => {
      if (!leadId) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`/api/recruiter/contact-log?lead_id=${leadId}`)
        const result = await response.json()
        if (result.success && result.data) {
          const history = result.data
          const completed: FunnelStageNumber[] = []
          
          // Check interested (stage 1)
          const isInterested = contactStatus === "interested" ||
            history.some((c: any) => {
              const outcome = c.outcome?.toLowerCase() || ""
              return outcome.includes("interested") && !outcome.includes("not interested")
            })
          if (isInterested) completed.push(1)
          
          // Check education (stage 2)
          if (history.some((c: any) => c.has_education_docs || c.meets_education_level)) completed.push(2)
          
          // Check english (stage 3)
          if (history.some((c: any) => c.ready_to_proceed || c.english_level_basic)) completed.push(3)
          
          // Check funds (stage 4)
          if (history.some((c: any) => c.has_funds || c.confirmed_financial_support)) completed.push(4)
          
          setDerivedCompletedStages(completed)
        }
      } catch (error) {
        console.error("Failed to fetch contact history for badge:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAndDeriveStages()
  }, [leadId, contactStatus])

  // Use derived stages if available, otherwise fall back to passed stages
  const safeCompletedStages = derivedCompletedStages.length > 0 ? derivedCompletedStages : (passedCompletedStages || [])
  const currentStageInfo = FUNNEL_STAGES.find((s) => s.number === currentStage) || FUNNEL_STAGES[0]

  const getStageStatus = (stageNumber: FunnelStageNumber) => {
    if (safeCompletedStages.includes(stageNumber)) return "completed"
    if (stageNumber === currentStage) return "current"
    return "upcoming"
  }

  const getDotColor = (status: string, stageNumber: FunnelStageNumber) => {
    if (status === "completed") return "bg-green-500"
    if (status === "current") {
      const stageInfo = FUNNEL_STAGES.find((s) => s.number === stageNumber)
      const colorMap: Record<string, string> = {
        amber: "bg-amber-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
        emerald: "bg-emerald-500",
        green: "bg-green-500",
      }
      return colorMap[stageInfo?.color || "blue"]
    }
    return "bg-gray-300 dark:bg-gray-600"
  }

  const getBadgeColor = () => {
    // Show green when all 4 stages are complete
    if (safeCompletedStages.length === 4) {
      return "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
    }
    const colorMap: Record<string, string> = {
      amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      green: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    }
    return colorMap[currentStageInfo?.color || "blue"]
  }

  const sizeClasses = {
    sm: {
      dot: "w-1.5 h-1.5",
      gap: "gap-0.5",
      badge: "px-2 py-0.5 text-xs",
    },
    md: {
      dot: "w-2 h-2",
      gap: "gap-1",
      badge: "px-2.5 py-1 text-sm",
    },
  }

  // Show loading state briefly
  if (loading) {
    return (
      <div className={`inline-flex items-center ${sizeClasses[size].gap} rounded-full border bg-gray-50 dark:bg-gray-900/20 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 ${sizeClasses[size].badge}`}>
        <div className={`flex items-center ${sizeClasses[size].gap}`}>
          {[1, 2, 3, 4].map((stageNum) => (
            <div key={stageNum} className={`${sizeClasses[size].dot} bg-gray-300 dark:bg-gray-600 rounded-full`} />
          ))}
        </div>
        {showLabel && <span className="font-medium ml-1">...</span>}
      </div>
    )
  }

  return (
    <div
      className={`
        inline-flex items-center ${sizeClasses[size].gap} rounded-full border
        ${getBadgeColor()} ${sizeClasses[size].badge}
      `}
    >
      {/* 4 Dot indicators */}
      <div className={`flex items-center ${sizeClasses[size].gap}`}>
        {([1, 2, 3, 4] as FunnelStageNumber[]).map((stageNum) => {
          const status = getStageStatus(stageNum)
          return (
            <div
              key={stageNum}
              className={`
                ${sizeClasses[size].dot}
                ${getDotColor(status, stageNum)}
                rounded-full
                ${status === "current" ? "ring-2 ring-offset-1 ring-current opacity-100" : ""}
              `}
            />
          )
        })}
      </div>

      {/* Label */}
      {showLabel && (
        <span className="font-medium ml-1">
          {safeCompletedStages.length === 4 ? "Ready" : (currentStageInfo?.shortLabel || "New")}
        </span>
      )}
    </div>
  )
}
