"use client"

import { useToast } from '@/components/ui/Toast'

import { useState, useEffect, useCallback } from "react"

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
  country: string
  contact_status: string
  intake: string | null
  barcelona_timeline: number | null
  lead_score: number | null
  recruit_priority: number | null
  last_contact_date: string | null
}

interface CallQueueProps {
  onViewLead: (lead: any) => void
  onLogContact: (lead: any) => void
  refreshKey?: number
}

// Parse intake string like "February 2025" to a sortable number (YYYYMM)
function parseIntakeToSortValue(intake: string | null): number {
  if (!intake) return 999999 // No intake goes to end

  const months: { [key: string]: number } = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
  }

  const parts = intake.toLowerCase().trim().split(/\s+/)
  let month = 0
  let year = new Date().getFullYear()

  for (const part of parts) {
    if (months[part]) {
      month = months[part]
    } else if (/^\d{4}$/.test(part)) {
      year = parseInt(part)
    }
  }

  if (month === 0) return 999998 // Couldn't parse, put near end

  return year * 100 + month // e.g., February 2025 = 202502, October 2025 = 202510
}

export default function CallQueue({ onViewLead, onLogContact, refreshKey }: CallQueueProps) {
  const { showToast } = useToast()
  const [leads, setLeads] = useState<Lead[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/recruiter/leads-read?limit=500", { credentials: "include" })
      const result = await response.json()

      if (result.success) {
        const allLeads: Lead[] = result.data?.leads || []
        const uniqueCountries = Array.from(new Set(allLeads.map(l => l.country))).sort()
        setCountries(uniqueCountries)

        const eligible = allLeads.filter(lead => {
          const status = lead.contact_status
          return !["converted", "unqualified", "notinterested", "wrongnumber", "archived"].includes(status)
        })

        // Sort: VIP first, then by intake date (earlier first)
        const sorted = eligible.sort((a, b) => {
          // VIP status first (starred leads on top)
          const aVip = (a.recruit_priority && a.recruit_priority >= 1) ? 1 : 0
          const bVip = (b.recruit_priority && b.recruit_priority >= 1) ? 1 : 0
          if (bVip !== aVip) return bVip - aVip

          // Then by intake timeline (earlier dates first - Feb before Oct)
          const aIntakeVal = parseIntakeToSortValue(a.intake)
          const bIntakeVal = parseIntakeToSortValue(b.intake)
          if (aIntakeVal !== bIntakeVal) return aIntakeVal - bIntakeVal

          // Never contacted leads first
          if (a.contact_status === "not_contacted" && b.contact_status !== "not_contacted") return -1
          if (b.contact_status === "not_contacted" && a.contact_status !== "not_contacted") return 1

          return 0
        })

        setLeads(sorted)
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Toggle VIP status for a lead
  const toggleVipStatus = async (lead: Lead) => {
    const newPriority = lead.recruit_priority ? 0 : 1
    try {
      const response = await fetch("/api/recruiter/leads-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: lead.id,
          contact_status: lead.contact_status,
          recruit_priority: newPriority
        })
      })
      if (response.ok) {
        setLeads(prev => prev.map(l =>
          l.id === lead.id ? { ...l, recruit_priority: newPriority } : l
        ))
      }
    } catch (err) {
      console.error("Failed to toggle VIP status:", err)
    }
  }

  useEffect(() => { fetchLeads() }, [fetchLeads, refreshKey])

  const filteredLeads = selectedCountry === "all"
    ? leads.slice(0, 8)
    : leads.filter(l => l.country === selectedCountry).slice(0, 8)

  const formatLastContact = (date: string | null) => {
    if (!date) return "Never"
    const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return diffDays + "d ago"
    return Math.floor(diffDays / 7) + "w ago"
  }

  if (isCollapsed) {
    return (
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg mb-4">
        <button onClick={() => setIsCollapsed(false)} className="w-full px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">📞</span>
            <span className="font-semibold">Call Queue</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{filteredLeads.length} leads</span>
          </div>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-4 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📞</span>
            <div>
              <h2 className="text-white font-bold text-lg">Call Queue</h2>
              <p className="text-green-100 text-sm">VIP first, then earliest intake</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="rounded-lg bg-white/20 border-0 text-white px-3 py-1.5 text-sm">
              <option value="all" className="text-gray-900">All Countries</option>
              {countries.map(c => (<option key={c} value={c} className="text-gray-900">{c}</option>))}
            </select>
            <button onClick={() => fetchLeads()} className="p-2.5 hover:bg-white/20 rounded-lg" title="Refresh queue"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
            <button onClick={() => setIsCollapsed(true)} className="p-2.5 hover:bg-white/20 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div></div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No leads in queue</div>
        ) : (
          filteredLeads.map((lead, index) => (
            <div key={lead.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-700 dark:text-green-400 font-bold text-sm">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleVipStatus(lead); }}
                    className={"text-lg transition-transform hover:scale-125 " + (lead.recruit_priority ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300")}
                    title={lead.recruit_priority ? "VIP - Click to remove" : "Mark as VIP"}
                  >★</button>
                  <span className="font-medium text-gray-900 dark:text-white truncate">{lead.prospect_name || lead.prospect_email || "Unknown"}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{lead.country}</span>
                </div>
                <div className="text-sm text-gray-500">{lead.phone || "No phone"} • {lead.intake || "No intake"} • Last: {formatLastContact(lead.last_contact_date)}</div>
              </div>
              <div className="flex-shrink-0 flex gap-2">
                <button onClick={() => onViewLead(lead)} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200">View</button>
                <button onClick={() => onLogContact(lead)} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Log Contact</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
