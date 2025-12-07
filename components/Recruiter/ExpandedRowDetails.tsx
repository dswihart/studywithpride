"use client"

import { ColumnConfig, getColumnLabel } from "./columnConfig"

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
  country: string
  referral_source: string | null
  contact_status: string
  lead_quality: string | null
  lead_score: number | null
  last_contact_date: string | null
  date_imported: string | null
  created_at: string
  notes: string | null
  is_duplicate: boolean
  barcelona_timeline: number | null
  intake: string | null
  created_time: string | null
  [key: string]: any
}

interface ExpandedRowDetailsProps {
  lead: Lead
  hiddenColumns: ColumnConfig[]
  formatDate: (date: string | null) => string
}

export default function ExpandedRowDetails({
  lead,
  hiddenColumns,
  formatDate,
}: ExpandedRowDetailsProps) {
  const formatValue = (key: string, value: any): string | JSX.Element => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-400">-</span>
    }

    switch (key) {
      case "last_contact_date":
      case "date_added":
      case "created_time":
        return formatDate(value)
      case "barcelona_timeline":
        return `${value} months`
      case "is_duplicate":
        return value ? "Yes" : "No"
      case "lead_quality":
        return value
      default:
        return String(value)
    }
  }

  const getValue = (key: string): any => {
    if (key === "date_added") {
      return lead.date_imported || lead.created_at
    }
    return lead[key]
  }

  if (hiddenColumns.length === 0) {
    return null
  }

  return (
    <tr className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600">
      <td colSpan={100} className="px-6 py-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          {hiddenColumns.map((col) => (
            <div key={col.key} className="flex flex-col">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                {getColumnLabel(col.key)}
              </span>
              <span className="text-gray-900 dark:text-gray-100 truncate">
                {formatValue(col.key, getValue(col.key))}
              </span>
            </div>
          ))}
        </div>
      </td>
    </tr>
  )
}
