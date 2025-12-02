/**
 * MobileLeadCard Component
 * Card-based lead display for mobile viewports
 */

"use client"

interface Lead {
  id: string
  country: string
  contact_status: string
  last_contact_date: string | null
  notes: string | null
  created_at: string
  created_time: string | null
  prospect_email: string | null
  prospect_name: string | null
  referral_source: string | null
  phone: string | null
  campaign: string | null
  campaign_name: string | null
  barcelona_timeline: number | null
  intake: string | null
  date_imported: string | null
  name_score: number | null
  email_score: number | null
  phone_valid: boolean | null
  is_duplicate: boolean
  recruit_priority: number | null
  duplicate_of: string | null
  duplicate_detected_at: string | null
  recency_score: number | null
  lead_score: number | null
  lead_quality: string | null
}

interface MobileLeadCardProps {
  lead: Lead
  isSelected: boolean
  onSelect: (leadId: string, selected: boolean) => void
  onView: (lead: Lead) => void
  onWhatsApp: (lead: Lead) => void
  onLogContact: (lead: Lead) => void
  isHighlighted?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  not_contacted: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  contacted: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  interested: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  qualified: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  converted: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  unqualified: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  referral: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
}

const QUALITY_COLORS: Record<string, string> = {
  High: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
  Low: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  "Very Low": "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
}

export default function MobileLeadCard({
  lead,
  isSelected,
  onSelect,
  onView,
  onWhatsApp,
  onLogContact,
  isHighlighted = false
}: MobileLeadCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return "Today"
      if (diffDays === 1) return "Yesterday"
      if (diffDays < 7) return `${diffDays} days ago`
      return date.toLocaleDateString()
    } catch {
      return "N/A"
    }
  }

  const statusLabel = lead.contact_status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all ${
        isHighlighted
          ? "border-yellow-400 ring-2 ring-yellow-400/50"
          : isSelected
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
            : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(lead.id, e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600"
          />

          {/* Name and Info */}
          <div className="flex-1 min-w-0" onClick={() => onView(lead)}>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {lead.prospect_name || "Unknown"}
              </h3>
              {lead.recruit_priority && lead.recruit_priority > 0 && (
                <span className="text-yellow-400 text-sm">
                  {"â˜…".repeat(lead.recruit_priority)}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {lead.prospect_email || "No email"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lead.phone || "No phone"}
            </p>
          </div>
        </div>
      </div>

      {/* Meta Row */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {lead.country}
        </span>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[lead.contact_status] || STATUS_COLORS.not_contacted}`}>
          {statusLabel}
        </span>
        {lead.lead_quality && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${QUALITY_COLORS[lead.lead_quality] || "bg-gray-100 text-gray-700"}`}>
            {lead.lead_quality}
          </span>
        )}
        {lead.is_duplicate && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300">
            Duplicate
          </span>
        )}
      </div>

      {/* Date Row */}
      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
        {lead.last_contact_date ? (
          <span>Last contact: {formatDate(lead.last_contact_date)}</span>
        ) : (
          <span>Added: {formatDate(lead.date_imported || lead.created_at)}</span>
        )}
      </div>

      {/* Actions Row */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
        <button
          onClick={() => onWhatsApp(lead)}
          disabled={!lead.phone}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>
        <button
          onClick={() => onLogContact(lead)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Log
        </button>
        <button
          onClick={() => onView(lead)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          aria-label="More options"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
