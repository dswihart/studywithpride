"use client"

import { ColumnConfig } from "@/lib/responsive/columnConfig"
import { SortColumn, SortDirection, ColumnKey, COLUMN_DEFINITIONS } from "./types"

interface LeadTableHeaderProps {
  visibleColumns: ColumnConfig[]
  sortColumn: SortColumn
  sortDirection: SortDirection
  allSelected: boolean
  someSelected: boolean
  onSelectAll: (checked: boolean) => void
  onSort: (column: SortColumn) => void
}

export function LeadTableHeader({
  visibleColumns,
  sortColumn,
  sortDirection,
  allSelected,
  someSelected,
  onSelectAll,
  onSort,
}: LeadTableHeaderProps) {
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return (
        <span className="ml-1 text-gray-400">
          <svg className="inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </span>
      )
    }
    if (sortDirection === "asc") {
      return (
        <span className="ml-1 text-blue-600">
          <svg className="inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </span>
      )
    }
    return (
      <span className="ml-1 text-blue-600">
        <svg className="inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    )
  }

  return (
    <thead className="bg-gray-50 dark:bg-gray-700/50">
      <tr>
        <th className="px-4 py-3 w-10">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected
            }}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </th>
        {visibleColumns.map((column) => {
          const def = COLUMN_DEFINITIONS.find((c) => c.key === column.key)
          const sortable = def?.sortable
          const baseClasses = "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"

          if (sortable) {
            return (
              <th
                key={column.key}
                className={`${baseClasses} cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600`}
                onClick={() => onSort(sortable)}
                style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}
              >
                <div className="flex items-center">
                  {column.label}
                  {renderSortIcon(sortable)}
                </div>
              </th>
            )
          }

          return (
            <th key={column.key} className={baseClasses} style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}>
              {column.label}
            </th>
          )
        })}
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  )
}
