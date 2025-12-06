"use client"

import { useState, useEffect, useCallback } from "react"

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
  country: string
  contact_status: string
  intake: string | null
  recruit_priority: number | null
  last_contact_date: string | null
}

interface VipStudentsCardProps {
  onViewLead: (lead: any) => void
  onLogContact: (lead: any) => void
  refreshKey?: number
}

export default function VipStudentsCard({ onViewLead, onLogContact, refreshKey }: VipStudentsCardProps) {
  const [vipLeads, setVipLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedLead, setExpandedLead] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(true)

  const fetchVipLeads = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/recruiter/leads-read?limit=500", { credentials: "include" })
      const result = await response.json()

      if (result.success) {
        const allLeads: Lead[] = result.data?.leads || []
        const eligible = allLeads.filter(lead => {
          const status = lead.contact_status
          return !["converted", "unqualified", "notinterested", "wrongnumber", "archived"].includes(status)
        })
        const vips = eligible.filter(l => l.recruit_priority && l.recruit_priority >= 1)
        setVipLeads(vips)
      }
    } catch (err) {
      console.error("Failed to fetch VIP leads:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleVipStatus = async (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch("/api/recruiter/leads-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: lead.id,
          contact_status: lead.contact_status,
          recruit_priority: 0
        })
      })
      if (response.ok) {
        setVipLeads(prev => prev.filter(l => l.id !== lead.id))
      }
    } catch (err) {
      console.error("Failed to remove VIP status:", err)
    }
  }

  useEffect(() => { fetchVipLeads() }, [fetchVipLeads, refreshKey])

  const formatLastContact = (date: string | null) => {
    if (!date) return "Never contacted"
    const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return diffDays + "d ago"
    return Math.floor(diffDays / 7) + "w ago"
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl shadow-lg mb-4 p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
          <span className="text-yellow-700 dark:text-yellow-300 text-sm">Loading VIP students...</span>
        </div>
      </div>
    )
  }

  if (vipLeads.length === 0) {
    return null
  }

  // Collapsed view
  if (isCollapsed) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl shadow-lg mb-4 border border-yellow-200 dark:border-yellow-800">
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-yellow-100/50 dark:hover:bg-yellow-800/20 transition rounded-xl"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <span className="font-bold text-yellow-800 dark:text-yellow-200">VIP Students</span>
            <span className="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded-full text-xs font-semibold">
              {vipLeads.length}
            </span>
          </div>
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl shadow-lg mb-4 border border-yellow-200 dark:border-yellow-800">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⭐</span>
          <h2 className="font-bold text-yellow-800 dark:text-yellow-200">VIP Students</h2>
          <span className="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded-full text-xs font-semibold">
            {vipLeads.length}
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-yellow-200/50 dark:hover:bg-yellow-700/30 rounded transition"
        >
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* VIP Chips */}
      <div className="px-4 pb-4 overflow-visible">
        <div className="flex flex-wrap gap-2">
          {vipLeads.map((lead) => (
            <div key={lead.id} className="relative group">
              {/* Chip */}
              <button
                onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                  ${expandedLead === lead.id
                    ? "bg-yellow-400 dark:bg-yellow-600 text-yellow-900 dark:text-white shadow-md"
                    : "bg-white dark:bg-gray-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700"
                  }
                `}
              >
                <span className="text-yellow-500">★</span>
                <span className="font-medium text-sm truncate max-w-[120px]">
                  {lead.prospect_name || lead.prospect_email?.split('@')[0] || "Unknown"}
                </span>
                <span className="text-xs px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-800 rounded text-yellow-700 dark:text-yellow-300">
                  {lead.country}
                </span>
              </button>

              {/* Expanded Actions Popup */}
              {expandedLead === lead.id && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-yellow-200 dark:border-yellow-700 p-3 min-w-[200px]">
                  <div className="mb-2">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {lead.prospect_name || lead.prospect_email || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">{lead.phone || "No phone"}</p>
                    <p className="text-xs text-gray-500">{lead.intake || "No intake"} • Last: {formatLastContact(lead.last_contact_date)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewLead(lead); setExpandedLead(null); }}
                      className="flex-1 px-2 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onLogContact(lead); setExpandedLead(null); }}
                      className="flex-1 px-2 py-1.5 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Log Contact
                    </button>
                  </div>
                  <button
                    onClick={(e) => toggleVipStatus(lead, e)}
                    className="w-full mt-2 px-2 py-1 text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 flex items-center justify-center gap-1"
                  >
                    <span>★</span> Remove VIP
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Click outside to close */}
      {expandedLead && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setExpandedLead(null)}
        />
      )}
    </div>
  )
}
