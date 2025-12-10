"use client"

import StatusBadge from "./StatusBadge"

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
  phone_valid: boolean | null
  country: string
  contact_status: string
  recruit_priority: number | null
  last_contact_date: string | null
}

interface MobileLeadCardProps {
  lead: Lead
  isSelected: boolean
  onSelect: (id: string, selected: boolean) => void
  onView: (lead: Lead) => void
  onLogContact: (lead: Lead) => void
  onWhatsApp: (lead: Lead) => void
  onEdit: (lead: Lead) => void
}

function formatLastContact(date: string | null): string {
  if (!date) return "Never contacted"
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return d.toLocaleDateString()
}

export default function MobileLeadCard({
  lead,
  isSelected,
  onSelect,
  onView,
  onLogContact,
  onWhatsApp,
  onEdit,
}: MobileLeadCardProps) {
  const canWhatsApp = lead.phone_valid
  const leadName = lead.prospect_name || "Unknown lead"

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Header with checkbox and name */}
      <div
        className="p-3 cursor-pointer"
        onClick={() => onView(lead)}
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              onSelect(lead.id, e.target.checked)
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            aria-label={`Select ${leadName}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {lead.prospect_name || "Unknown"}
              </span>
              {lead.recruit_priority && lead.recruit_priority > 0 && (
                <span className="text-yellow-500 flex-shrink-0" title="VIP Priority Lead" aria-label="VIP Priority Lead">⭐</span>
              )}
            </div>
            {lead.prospect_email && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                <span aria-hidden="true">📧</span>
                <span>{lead.prospect_email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span aria-hidden="true">📱</span>
                <span>{lead.phone}</span>
                {lead.phone_valid ? (
                  <span className="text-green-500 text-xs" title="Valid phone number" aria-label="Valid phone number">✓</span>
                ) : (
                  <span className="text-red-500 text-xs" title="Invalid phone number" aria-label="Invalid phone number">✗</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status row */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{lead.country}</span>
            <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">|</span>
            <StatusBadge status={lead.contact_status} compact />
          </div>
        </div>

        {/* Last contact */}
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Last contact: {formatLastContact(lead.last_contact_date)}
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-2 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onLogContact(lead)
          }}
          className="flex-1 py-2 px-3 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-1"
          aria-label={`Log contact for ${leadName}`}
        >
          <span aria-hidden="true">📝</span>
          <span>Log</span>
        </button>
        <div className="relative flex-1 group">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (canWhatsApp) onWhatsApp(lead)
            }}
            disabled={!canWhatsApp}
            className={`w-full py-2 px-3 text-sm rounded-lg transition flex items-center justify-center gap-1 ${
              canWhatsApp
                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
                : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
            }`}
            aria-label={canWhatsApp ? `Send WhatsApp to ${leadName}` : "WhatsApp unavailable - phone number not valid"}
            aria-disabled={!canWhatsApp}
          >
            <span aria-hidden="true">💬</span>
            <span>WhatsApp</span>
          </button>
          {/* Tooltip for disabled state */}
          {!canWhatsApp && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              Phone number not valid for WhatsApp
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(lead)
          }}
          className="flex-1 py-2 px-3 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition flex items-center justify-center gap-1"
          aria-label={`Edit ${leadName}`}
        >
          <span aria-hidden="true">✏️</span>
          <span>Edit</span>
        </button>
      </div>
    </div>
  )
}
