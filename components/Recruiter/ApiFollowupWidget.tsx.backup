/**
 * ApiFollowupWidget Component
 * Shows leads flagged for API follow-up callback
 */

'use client'

import { useState, useEffect } from 'react'

interface Lead {
  id: string
  prospect_name: string | null
  phone: string | null
  contact_status: string
  last_contact_date: string | null
}

interface Props {
  onViewLead?: (leadId: string) => void
  refreshKey?: number
}

export default function ApiFollowupWidget({ onViewLead, refreshKey }: Props) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [clearingId, setClearingId] = useState<string | null>(null)

  useEffect(() => {
    fetchFollowupLeads()
  }, [refreshKey])

  const fetchFollowupLeads = async () => {
    try {
      const response = await fetch('/api/recruiter/leads-read?needs_followup=true&limit=50', { credentials: 'include' })
      const result = await response.json()
      if (result.success) {
        const sorted = (result.data?.leads || result.data || []).sort((a: Lead, b: Lead) => {
          if (!a.last_contact_date) return -1
          if (!b.last_contact_date) return 1
          return new Date(a.last_contact_date).getTime() - new Date(b.last_contact_date).getTime()
        })
        setLeads(sorted)
      }
    } catch (err) {
      console.error('Failed to fetch follow-up leads:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClearFlag = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setClearingId(leadId)
    try {
      const response = await fetch('/api/recruiter/leads-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: leadId, needs_followup: false })
      })
      const result = await response.json()
      if (result.success) setLeads(prev => prev.filter(l => l.id !== leadId))
    } catch (err) {
      console.error('Failed to clear flag:', err)
    } finally {
      setClearingId(null)
    }
  }

  const formatTime = (date: string | null) => {
    if (!date) return 'Never'
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 60) return diffMins + 'm ago'
    if (diffHours < 24) return diffHours + 'h ago'
    if (diffDays < 7) return diffDays + 'd ago'
    return d.toLocaleDateString()
  }

  if (!loading && leads.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700 transition">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white">API Callback Queue</h3>
            <p className="text-xs text-gray-500">{loading ? 'Loading...' : leads.length + ' leads awaiting callback'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {leads.length > 0 && <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700">{leads.length}</span>}
          <svg className={'w-5 h-5 text-gray-400 transition-transform ' + (isCollapsed ? '' : 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>
      {!isCollapsed && (
        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
          {loading ? <div className="p-4 text-center text-gray-500">Loading...</div> : leads.map(lead => (
            <div key={lead.id} onClick={() => onViewLead?.(lead.id)} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white truncate">{lead.prospect_name || 'Unknown'}</span>
                  <span className="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-700">{lead.contact_status}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {lead.phone && <a href={'tel:' + lead.phone} onClick={e => e.stopPropagation()} className="text-blue-600 hover:underline">{lead.phone}</a>}
                  <span> • {formatTime(lead.last_contact_date)}</span>
                </div>
              </div>
              <div className="flex gap-1">
                {lead.phone && <a href={'tel:' + lead.phone} onClick={e => e.stopPropagation()} className="p-2 rounded-full hover:bg-green-100 text-green-600" title="Call"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></a>}
                <button onClick={e => handleClearFlag(lead.id, e)} disabled={clearingId === lead.id} className="p-2 rounded-full hover:bg-gray-100 text-gray-400" title="Done">
                  {clearingId === lead.id ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
