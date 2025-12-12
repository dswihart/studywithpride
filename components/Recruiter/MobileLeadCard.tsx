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

// SVG Icon Components
const EmailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
)

const LogIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

function formatLastContact(date: string | null): string {
  if (!date) return "Never contacted"
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return diffDays + " days ago"
  if (diffDays < 30) return Math.floor(diffDays / 7) + " weeks ago"
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
      className={"bg-white dark:bg-gray-800 rounded-lg border-2 transition-all " + (
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-700"
      )}
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
            className="w-5 h-5 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
            aria-label={"Select " + leadName}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {lead.prospect_name || "Unknown"}
              </span>
              {lead.recruit_priority && lead.recruit_priority > 0 && (
                <span className="flex-shrink-0" title="VIP Priority Lead" aria-label="VIP Priority Lead">
                  <StarIcon />
                </span>
              )}
            </div>
            {lead.prospect_email && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                <EmailIcon />
                <span>{lead.prospect_email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <PhoneIcon />
                <span>{lead.phone}</span>
                {lead.phone_valid ? (
                  <span title="Valid phone number" aria-label="Valid phone number"><CheckIcon /></span>
                ) : (
                  <span title="Invalid phone number" aria-label="Invalid phone number"><XIcon /></span>
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
          className="flex-1 py-2 px-3 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-gray-400 focus:outline-none"
          aria-label={"Log contact for " + leadName}
        >
          <LogIcon />
          <span>Log</span>
        </button>
        <div className="relative flex-1 group">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (canWhatsApp) onWhatsApp(lead)
            }}
            disabled={!canWhatsApp}
            className={"w-full py-2 px-3 text-sm rounded-lg transition flex items-center justify-center gap-1.5 focus:ring-2 focus:outline-none " + (
              canWhatsApp
                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 focus:ring-green-400"
                : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
            )}
            aria-label={canWhatsApp ? "Send WhatsApp to " + leadName : "WhatsApp unavailable - phone number not valid"}
            aria-disabled={!canWhatsApp}
          >
            <WhatsAppIcon />
            <span>WhatsApp</span>
          </button>
          {/* Tooltip for disabled state */}
          {!canWhatsApp && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10" role="tooltip">
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
          className="flex-1 py-2 px-3 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          aria-label={"Edit " + leadName}
        >
          <EditIcon />
          <span>Edit</span>
        </button>
      </div>
    </div>
  )
}
