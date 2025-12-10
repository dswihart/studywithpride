"use client"

interface Lead {
  id: string
  phone: string | null
  prospect_name: string | null
  [key: string]: any
}

interface ActionButtonsProps {
  lead: Lead
  compact?: boolean
  onLogContact?: (lead: any) => void
  onMessageHistory?: (lead: any) => void
  onEdit?: (lead: any) => void
}

export default function ActionButtons({
  lead,
  compact = false,
  onLogContact,
  onMessageHistory,
  onEdit,
}: ActionButtonsProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {/* Log Contact - Icon only */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onLogContact?.(lead)
          }}
          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
          title="Log contact"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </button>

        {/* Messages - Icon only */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMessageHistory?.(lead)
          }}
          className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          title="Message history"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        {/* Edit - Icon only */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.(lead)
          }}
          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title="Edit lead"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    )
  }

  // Full version with labels
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onLogContact?.(lead)
        }}
        className="flex items-center gap-1 font-medium text-amber-600 hover:text-amber-800"
        title="Log contact attempt"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        Log
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onEdit?.(lead)
        }}
        className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </button>
    </div>
  )
}
