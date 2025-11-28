"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/LanguageContext"

interface ActivityEvent {
  id: string
  type: "status_change" | "message_sent" | "message_received" | "note_added" | "score_updated" | "call" | "email"
  timestamp: string
  description: string
  details?: string
  user?: string
  metadata?: Record<string, any>
}

interface LeadActivityTimelineProps {
  leadId: string
  leadName?: string
  onClose?: () => void
}

// Generate mock activity based on lead data
function generateMockActivity(leadId: string): ActivityEvent[] {
  const now = new Date()
  const events: ActivityEvent[] = []

  // Create realistic activity timeline
  const baseDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) // 14 days ago

  events.push({
    id: `${leadId}_1`,
    type: "status_change",
    timestamp: baseDate.toISOString(),
    description: "Lead created",
    details: "New lead imported from campaign",
    metadata: { from: null, to: "not_contacted" },
  })

  events.push({
    id: `${leadId}_2`,
    type: "message_sent",
    timestamp: new Date(baseDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    description: "Welcome message sent",
    details: "WhatsApp template: welcome_message",
    user: "Recruiter",
  })

  events.push({
    id: `${leadId}_3`,
    type: "status_change",
    timestamp: new Date(baseDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    description: "Status updated",
    details: "Moved to Contacted",
    metadata: { from: "not_contacted", to: "contacted" },
  })

  events.push({
    id: `${leadId}_4`,
    type: "message_received",
    timestamp: new Date(baseDate.getTime() + 26 * 60 * 60 * 1000).toISOString(),
    description: "Response received",
    details: "Lead replied with interest in program",
  })

  events.push({
    id: `${leadId}_5`,
    type: "status_change",
    timestamp: new Date(baseDate.getTime() + 27 * 60 * 60 * 1000).toISOString(),
    description: "Status updated",
    details: "Moved to Interested",
    metadata: { from: "contacted", to: "interested" },
  })

  events.push({
    id: `${leadId}_6`,
    type: "score_updated",
    timestamp: new Date(baseDate.getTime() + 27 * 60 * 60 * 1000).toISOString(),
    description: "Lead score updated",
    details: "Score increased to 72 (Hot)",
    metadata: { score: 72, quality: "hot" },
  })

  events.push({
    id: `${leadId}_7`,
    type: "message_sent",
    timestamp: new Date(baseDate.getTime() + 48 * 60 * 60 * 1000).toISOString(),
    description: "Program details sent",
    details: "WhatsApp template: program_info",
    user: "Recruiter",
  })

  events.push({
    id: `${leadId}_8`,
    type: "note_added",
    timestamp: new Date(baseDate.getTime() + 72 * 60 * 60 * 1000).toISOString(),
    description: "Note added",
    details: "Interested in Fall 2025 intake. Budget concerns - mentioned scholarship options.",
    user: "Recruiter",
  })

  // Sort by timestamp descending (most recent first)
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const eventIcons: Record<ActivityEvent["type"], { icon: string; color: string }> = {
  status_change: { icon: "↗", color: "text-blue-500 dark:text-blue-400" },
  message_sent: { icon: "→", color: "text-green-500 dark:text-green-400" },
  message_received: { icon: "←", color: "text-purple-500 dark:text-purple-400" },
  note_added: { icon: "✎", color: "text-yellow-500 dark:text-yellow-400" },
  score_updated: { icon: "★", color: "text-orange-500 dark:text-orange-400" },
  call: { icon: "☎", color: "text-cyan-500 dark:text-cyan-400" },
  email: { icon: "✉", color: "text-pink-500 dark:text-pink-400" },
}

const eventLabels: Record<ActivityEvent["type"], string> = {
  status_change: "Status Change",
  message_sent: "Message Sent",
  message_received: "Message Received",
  note_added: "Note Added",
  score_updated: "Score Updated",
  call: "Call",
  email: "Email",
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function LeadActivityTimeline({ leadId, leadName, onClose }: LeadActivityTimelineProps) {
  const { t } = useLanguage()
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ActivityEvent["type"] | "all">("all")
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Simulate API call - in production, fetch from API
    setLoading(true)
    setTimeout(() => {
      setActivities(generateMockActivity(leadId))
      setLoading(false)
    }, 300)
  }, [leadId])

  const filteredActivities = filter === "all" ? activities : activities.filter((a) => a.type === filter)

  const toggleExpand = (eventId: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(eventId)) {
        next.delete(eventId)
      } else {
        next.add(eventId)
      }
      return next
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Timeline</h3>
          {leadName && <p className="text-sm text-gray-500 dark:text-gray-400">{leadName}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
            filter === "all"
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          All
        </button>
        {(Object.keys(eventLabels) as ActivityEvent["type"][]).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
              filter === type
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {eventLabels[type]}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No activities found</p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

            {/* Events */}
            <div className="space-y-4">
              {filteredActivities.map((event, index) => {
                const { icon, color } = eventIcons[event.type]
                const isExpanded = expandedEvents.has(event.id)

                return (
                  <div key={event.id} className="relative pl-10">
                    {/* Event dot */}
                    <div
                      className={`absolute left-2 w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center text-sm ${color}`}
                    >
                      {icon}
                    </div>

                    {/* Event content */}
                    <div
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => toggleExpand(event.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {formatRelativeTime(event.timestamp)}
                            {event.user && ` • ${event.user}`}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            event.type === "status_change"
                              ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                              : event.type === "message_sent"
                                ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                                : event.type === "message_received"
                                  ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300"
                                  : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {eventLabels[event.type]}
                        </span>
                      </div>

                      {/* Expanded details */}
                      {(isExpanded || event.details) && (
                        <div
                          className={`mt-2 text-sm text-gray-600 dark:text-gray-300 ${
                            !isExpanded ? "line-clamp-1" : ""
                          }`}
                        >
                          {event.details}
                        </div>
                      )}

                      {/* Metadata for status changes */}
                      {isExpanded && event.metadata && event.type === "status_change" && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          {event.metadata.from && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded">
                              {event.metadata.from}
                            </span>
                          )}
                          <span className="text-gray-400">→</span>
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded">
                            {event.metadata.to}
                          </span>
                        </div>
                      )}

                      {/* Score change metadata */}
                      {isExpanded && event.metadata && event.type === "score_updated" && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              event.metadata.quality === "hot"
                                ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                                : event.metadata.quality === "warm"
                                  ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                                  : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            Score: {event.metadata.score} ({event.metadata.quality})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer with quick actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg">
            Send Message
          </button>
          <button className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">
            Add Note
          </button>
        </div>
      </div>
    </div>
  )
}
