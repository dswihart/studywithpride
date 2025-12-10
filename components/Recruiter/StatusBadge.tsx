"use client"

interface StatusBadgeProps {
  status: string
  compact?: boolean
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; shortLabel: string; icon: string }> = {
  not_contacted: { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-800 dark:text-gray-300", label: "Not Contacted", shortLabel: "New", icon: "○" },
  referral: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-800 dark:text-cyan-300", label: "Referral", shortLabel: "Ref", icon: "↗" },
  contacted: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-800 dark:text-blue-300", label: "Contacted", shortLabel: "Con", icon: "◐" },
  interested: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-800 dark:text-yellow-300", label: "Interested", shortLabel: "Int", icon: "★" },
  qualified: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-800 dark:text-purple-300", label: "Qualified", shortLabel: "Qual", icon: "◆" },
  converted: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-300", label: "Converted", shortLabel: "Conv", icon: "✓" },
  notinterested: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-800 dark:text-orange-300", label: "Not Interested", shortLabel: "N/I", icon: "−" },
  wrongnumber: { bg: "bg-gray-200 dark:bg-gray-600", text: "text-gray-600 dark:text-gray-300", label: "Wrong Number", shortLabel: "W/N", icon: "✗" },
  unqualified: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-300", label: "Unqualified", shortLabel: "Unq", icon: "⊘" },
  callback: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-800 dark:text-indigo-300", label: "Callback", shortLabel: "CB", icon: "↺" },
  enrolled: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-800 dark:text-emerald-300", label: "Enrolled", shortLabel: "Enr", icon: "●" },
  archived: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", label: "Archived", shortLabel: "Arc", icon: "▣" },
  archived_referral: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", label: "Archived Referral", shortLabel: "A/R", icon: "▣" },
}

export default function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_contacted
  const label = compact ? config.shortLabel : config.label

  return (
    <span
      className={`inline-flex items-center justify-center gap-1 rounded-full font-semibold ${config.bg} ${config.text} ${
        compact ? "px-2 py-0.5 text-xs min-w-[40px]" : "px-3 py-1 text-xs"
      }`}
      title={compact ? config.label : undefined}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      {label}
    </span>
  )
}

// Quality badge component
interface QualityBadgeProps {
  quality: string | null
  score?: number | null
  compact?: boolean
}

const QUALITY_CONFIG: Record<string, { bg: string; text: string; label: string; shortLabel: string; icon: string }> = {
  High: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-300", label: "High", shortLabel: "H", icon: "▲" },
  Medium: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-800 dark:text-yellow-300", label: "Medium", shortLabel: "M", icon: "■" },
  Low: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-800 dark:text-orange-300", label: "Low", shortLabel: "L", icon: "▼" },
  "Very Low": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-300", label: "Very Low", shortLabel: "VL", icon: "⊗" },
}

export function QualityBadge({ quality, score, compact = false }: QualityBadgeProps) {
  if (!quality) {
    return (
      <span className="text-gray-400 dark:text-gray-500 text-xs" aria-label="Quality: Unscored">
        {compact ? "−" : "Unscored"}
      </span>
    )
  }

  const config = QUALITY_CONFIG[quality] || QUALITY_CONFIG.Low
  const label = compact ? config.shortLabel : config.label

  return (
    <span
      className={`inline-flex items-center justify-center gap-1 rounded-full font-semibold ${config.bg} ${config.text} ${
        compact ? "px-2 py-0.5 text-xs min-w-[28px]" : "px-3 py-1 text-xs"
      }`}
      title={compact && score !== null ? `${config.label} (Score: ${score})` : undefined}
      role="status"
      aria-label={`Quality: ${config.label}${score !== null && score !== undefined ? `, Score: ${score}` : ""}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      {label}
      {!compact && score !== null && score !== undefined && (
        <span className="ml-1 opacity-70">({score})</span>
      )}
    </span>
  )
}
