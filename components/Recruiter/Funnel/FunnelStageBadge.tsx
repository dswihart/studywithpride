"use client"

import { FunnelStageNumber, FUNNEL_STAGES } from "@/lib/funnel/types"

interface FunnelStageBadgeProps {
  currentStage: FunnelStageNumber
  completedStages: FunnelStageNumber[]
  showLabel?: boolean
  size?: "sm" | "md"
}

export default function FunnelStageBadge({
  currentStage,
  completedStages = [],
  showLabel = true,
  size = "md",
}: FunnelStageBadgeProps) {
  const safeCompletedStages = completedStages || []
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

  return (
    <div
      className={`
        inline-flex items-center ${sizeClasses[size].gap} rounded-full border
        ${getBadgeColor()} ${sizeClasses[size].badge}
      `}
    >
      {/* 5 Dot indicators */}
      <div className={`flex items-center ${sizeClasses[size].gap}`}>
        {[1, 2, 3, 4, 5].map((stageNum) => {
          const status = getStageStatus(stageNum as FunnelStageNumber)
          return (
            <div
              key={stageNum}
              className={`
                ${sizeClasses[size].dot}
                ${getDotColor(status, stageNum as FunnelStageNumber)}
                rounded-full
                ${status === "current" ? "ring-2 ring-offset-1 ring-current opacity-100" : ""}
              `}
            />
          )
        })}
      </div>

      {/* Label */}
      {showLabel && (
        <span className="font-medium ml-1">{currentStageInfo?.shortLabel || "New"}</span>
      )}
    </div>
  )
}
