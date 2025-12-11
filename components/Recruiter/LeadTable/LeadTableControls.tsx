"use client"

import { useRef, useEffect, useState } from "react"
import { ColumnKey, COLUMN_DEFINITIONS } from "./types"

interface LeadTableControlsProps {
  columnVisibility: Record<ColumnKey, boolean>
  selectedCount: number
  totalLeads: number
  selectAllPages: boolean
  onSelectAllPages: () => void
  onToggleColumn: (key: ColumnKey) => void
  onBulkEdit: () => void
}

export function LeadTableControls({
  columnVisibility,
  selectedCount,
  totalLeads,
  selectAllPages,
  onSelectAllPages,
  onToggleColumn,
  onBulkEdit,
}: LeadTableControlsProps) {
  const [showColumnMenu, setShowColumnMenu] = useState(false)
  const columnMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <>
      {selectedCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectAllPages ? `All \${totalLeads} leads selected` : `\${selectedCount} selected`}
            </span>
            {!selectAllPages && selectedCount < totalLeads && (
              <button onClick={onSelectAllPages} className="text-sm text-blue-600 hover:underline">
                Select all {totalLeads} leads
              </button>
            )}
          </div>
          <button
            onClick={onBulkEdit}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Bulk Edit
          </button>
        </div>
      )}

      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-end">
        <div className="relative" ref={columnMenuRef}>
          <button
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Columns
          </button>
          {showColumnMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-2 max-h-80 overflow-y-auto">
              {COLUMN_DEFINITIONS.map((col) => (
                <label key={col.key} className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={columnVisibility[col.key]}
                    onChange={() => onToggleColumn(col.key)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{col.labelKey.split(".").pop()}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
