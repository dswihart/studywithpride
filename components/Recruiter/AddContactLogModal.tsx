"use client"

import { useState, useEffect, useCallback } from "react"

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
  contact_status: string
  notes: string | null
}

interface AddContactLogModalProps {
  onClose: () => void
  onSelectLead: (lead: Lead) => void
}

export default function AddContactLogModal({ onClose, onSelectLead }: AddContactLogModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const searchLeads = useCallback(async (query: string) => {
    if (!query.trim()) {
      setLeads([])
      setSearched(false)
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch(`/api/recruiter/leads-read?search=${encodeURIComponent(query)}&limit=10`, {
        credentials: "include"
      })
      const result = await response.json()

      if (result.success) {
        setLeads(result.data || [])
      } else {
        setLeads([])
      }
    } catch (err) {
      console.error("Search error:", err)
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchLeads(searchQuery)
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery, searchLeads])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      not_contacted: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      contacted: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
      interested: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
      qualified: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      converted: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
      unqualified: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
      referral: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
    }
    return colors[status] || colors.not_contacted
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Add Contact Log</h2>
              <p className="text-green-100 text-sm">Search for a lead to log contact</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              autoFocus
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {!searched && !searchQuery && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>Start typing to search for leads</p>
            </div>
          )}

          {searched && leads.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No leads found matching "{searchQuery}"</p>
            </div>
          )}

          {leads.length > 0 && (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {leads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                      {(lead.prospect_name || lead.prospect_email || "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {lead.prospect_name || "Unknown"}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(lead.contact_status)}`}>
                        {lead.contact_status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {lead.prospect_email || lead.phone || "No contact info"}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Select a lead to log contact information
          </p>
        </div>
      </div>
    </div>
  )
}
