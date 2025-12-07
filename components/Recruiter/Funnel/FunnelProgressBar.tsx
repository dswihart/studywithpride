"use client"

import { FunnelStageNumber, FUNNEL_STAGES } from "@/lib/funnel/types"

interface FunnelProgressBarProps {
  currentStage: FunnelStageNumber
  completedStages: FunnelStageNumber[]
  onStageClick?: (stage: FunnelStageNumber) => void
  size?: "sm" | "md" | "lg"
}

export default function FunnelProgressBar({
  currentStage,
  completedStages,
  onStageClick,
  size = "md",
}: FunnelProgressBarProps) {
  const sizeClasses = {
    sm: {
      circle: "w-6 h-6 text-xs",
      line: "h-0.5",
      label: "text-xs",
      container: "gap-1",
    },
    md: {
      circle: "w-8 h-8 text-sm",
      line: "h-1",
      label: "text-sm",
      container: "gap-2",
    },
    lg: {
      circle: "w-10 h-10 text-base",
      line: "h-1.5",
      label: "text-base",
      container: "gap-3",
    },
  }

  const getStageStatus = (stageNumber: FunnelStageNumber) => {
    if (completedStages.includes(stageNumber)) return "completed"
    if (stageNumber === currentStage) return "current"
    return "upcoming"
  }

  const getStageColors = (status: string, stageColor: string) => {
    if (status === "completed") {
      return {
        circle: "bg-green-500 text-white border-green-500",
        line: "bg-green-500",
      }
    }
    if (status === "current") {
      const colorMap: Record<string, { circle: string; line: string }> = {
        amber: {
          circle: "bg-amber-500 text-white border-amber-500 ring-4 ring-amber-100 dark:ring-amber-900/30",
          line: "bg-amber-200 dark:bg-amber-800",
        },
        blue: {
          circle: "bg-blue-500 text-white border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30",
          line: "bg-blue-200 dark:bg-blue-800",
        },
        purple: {
          circle: "bg-purple-500 text-white border-purple-500 ring-4 ring-purple-100 dark:ring-purple-900/30",
          line: "bg-purple-200 dark:bg-purple-800",
        },
        green: {
          circle: "bg-green-500 text-white border-green-500 ring-4 ring-green-100 dark:ring-green-900/30",
          line: "bg-green-200 dark:bg-green-800",
        },
      }
      return colorMap[stageColor] || colorMap.blue
    }
    return {
      circle: "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600",
      line: "bg-gray-200 dark:bg-gray-700",
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {FUNNEL_STAGES.map((stage, index) => {
          const status = getStageStatus(stage.number)
          const colors = getStageColors(status, stage.color)
          const isLast = index === FUNNEL_STAGES.length - 1
          const isClickable = onStageClick && (status === "completed" || status === "current")

          return (
            <div key={stage.number} className="flex items-center flex-1 last:flex-none">
              {/* Stage Circle */}
              <div className={`flex flex-col items-center ${sizeClasses[size].container}`}>
                <button
                  onClick={() => isClickable && onStageClick(stage.number)}
                  disabled={!isClickable}
                  className={`
                    ${sizeClasses[size].circle}
                    ${colors.circle}
                    rounded-full border-2 flex items-center justify-center font-medium
                    transition-all duration-200
                    ${isClickable ? "cursor-pointer hover:scale-110" : "cursor-default"}
                  `}
                  title={stage.label}
                >
                  {status === "completed" ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stage.number
                  )}
                </button>
                {/* Stage Label - only show on md and lg */}
                {size !== "sm" && (
                  <span
                    className={`
                      ${sizeClasses[size].label}
                      text-center mt-1 max-w-[80px]
                      ${status === "current" ? "text-gray-900 dark:text-white font-medium" : "text-gray-500 dark:text-gray-400"}
                    `}
                  >
                    {stage.label.split(" ")[0]}
                  </span>
                )}
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className={`flex-1 mx-2 ${sizeClasses[size].line} ${colors.line} rounded-full`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
