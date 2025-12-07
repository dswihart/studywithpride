"use client"

import { ColumnConfig, getColumnLabel } from "./columnConfig"

interface HiddenColumnsIndicatorProps {
  hiddenColumns: ColumnConfig[]
  breakpoint: "mobile" | "tablet" | "desktop"
}

export default function HiddenColumnsIndicator({
  hiddenColumns,
  breakpoint,
}: HiddenColumnsIndicatorProps) {
  if (hiddenColumns.length === 0 || breakpoint === "desktop") {
    return null
  }

  const columnNames = hiddenColumns.map(col => getColumnLabel(col.key)).join(", ")

  return (
    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
      <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>{hiddenColumns.length}</strong> column{hiddenColumns.length !== 1 ? "s" : ""} hidden on {breakpoint}:
          <span className="ml-1 text-blue-600 dark:text-blue-400">{columnNames}</span>
        </span>
        {breakpoint === "tablet" && (
          <span className="ml-auto text-xs text-blue-500 dark:text-blue-400">
            Click a row to see details
          </span>
        )}
      </div>
    </div>
  )
}
