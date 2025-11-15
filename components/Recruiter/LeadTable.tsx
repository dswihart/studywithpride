"use client"

import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '@/components/LanguageContext'
import BulkEditLeadModal from '@/components/Recruiter/BulkEditLeadModal'

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
  lead_score: number | null
  lead_quality: string | null
}

interface LeadTableProps {
  onLeadsChange?: (leads: Lead[]) => void
  onEditLead?: (lead: Lead) => void
  onSelectionChange?: (selectedIds: string[]) => void
}

type SortColumn =
  | 'prospect_name'
  | 'prospect_email'
  | 'country'
  | 'phone'
  | 'campaign'
  | 'contact_status'
  | 'lead_quality'
  | 'last_contact_date'
  | null

type SortDirection = 'asc' | 'desc' | null

type ColumnKey =
  | 'prospect_name'
  | 'prospect_email'
  | 'phone'
  | 'country'
  | 'campaign'
  | 'referral_source'
  | 'contact_status'
  | 'lead_quality'
  | 'last_contact_date'
  | 'notes'

const CONTACT_STATUSES = [
  { value: 'all', labelKey: 'recruiter.statuses.all' },
  { value: 'new', labelKey: 'recruiter.statuses.new' },
  { value: 'contacted', labelKey: 'recruiter.statuses.contacted' },
  { value: 'nurturing', labelKey: 'recruiter.statuses.nurturing' },
  { value: 'converted', labelKey: 'recruiter.statuses.converted' },
]

const MESSAGE_TEMPLATES = [
  { id: 'WelcomeMessage', labelKey: 'recruiter.table.templates.welcome' },
  { id: 'FollowUp', labelKey: 'recruiter.table.templates.followUp' },
]

const COLUMN_DEFINITIONS: Array<{ key: ColumnKey; labelKey: string; sortable?: SortColumn }> = [
  { key: 'prospect_name', labelKey: 'recruiter.table.columns.prospectName', sortable: 'prospect_name' },
  { key: 'prospect_email', labelKey: 'recruiter.table.columns.email', sortable: 'prospect_email' },
  { key: 'phone', labelKey: 'recruiter.table.columns.phone', sortable: 'phone' },
  { key: 'country', labelKey: 'recruiter.table.columns.country', sortable: 'country' },
  { key: 'campaign', labelKey: 'recruiter.table.columns.campaign', sortable: 'campaign' },
  { key: 'referral_source', labelKey: 'recruiter.table.referralColumn' },
  { key: 'contact_status', labelKey: 'recruiter.table.columns.status', sortable: 'contact_status' },
  { key: 'lead_quality', labelKey: 'recruiter.table.columns.quality', sortable: 'lead_quality' },
  { key: 'last_contact_date', labelKey: 'recruiter.table.columns.lastContact', sortable: 'last_contact_date' },
  { key: 'notes', labelKey: 'recruiter.table.columns.notes' },
]

export default function LeadTable({ onLeadsChange, onEditLead, onSelectionChange }: LeadTableProps) {
  const { t } = useLanguage()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [countries, setCountries] = useState<string[]>([])
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [selectedTemplate, setSelectedTemplate] = useState(MESSAGE_TEMPLATES[0].id)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [selectAllPages, setSelectAllPages] = useState(false)
  const [sortColumn, setSortColumn] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [sendingLeadId, setSendingLeadId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams()
      if (selectedCountry !== 'all') params.append('country', selectedCountry)
      if (selectedStatus !== 'all') params.append('contact_status', selectedStatus)
      params.append('limit', '10000')

      const response = await fetch(`/api/recruiter/leads-read?${params.toString()}`, {
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch leads')
      }

      const fetched: Lead[] = result.data?.leads || []
      setAllLeads(fetched)
      setCurrentPage(1)
      setSelectedLeads(new Set())
      setSelectAllPages(false)

      const uniqueCountries = Array.from(new Set(fetched.map((lead) => lead.country))).sort()
      setCountries(uniqueCountries)

      onLeadsChange?.(fetched)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads')
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [selectedCountry, selectedStatus])

  useEffect(() => {
    onSelectionChange?.(Array.from(selectedLeads))
  }, [selectedLeads, onSelectionChange])

  const handleBulkEditSuccess = () => {
    setShowBulkEditModal(false)
    fetchLeads()
    setNotification({ type: 'success', message: t('recruiter.table.bulkSuccess') })
  }

  const handleSort = (column: SortColumn) => {
    let direction: SortDirection = 'asc'

    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        direction = 'desc'
      } else if (sortDirection === 'desc') {
        setSortColumn(null)
        setSortDirection(null)
        return
      }
    }

    setSortColumn(column)
    setSortDirection(direction)
  }

  const sortedLeads = useMemo(() => {
    if (!sortColumn || !sortDirection) return allLeads

    return [...allLeads].sort((a, b) => {
      let aValue: any = null
      let bValue: any = null

      switch (sortColumn) {
        case 'prospect_name':
          aValue = a.prospect_name?.toLowerCase() || ''
          bValue = b.prospect_name?.toLowerCase() || ''
          break
        case 'prospect_email':
          aValue = a.prospect_email?.toLowerCase() || ''
          bValue = b.prospect_email?.toLowerCase() || ''
          break
        case 'country':
          aValue = a.country.toLowerCase()
          bValue = b.country.toLowerCase()
          break
        case 'phone':
          aValue = a.phone || ''
          bValue = b.phone || ''
          break
        case 'campaign':
          aValue = a.campaign || ''
          bValue = b.campaign || ''
          break
        case 'contact_status':
          aValue = a.contact_status
          bValue = b.contact_status
          break
        case 'lead_quality':
          aValue = a.lead_quality || ''
          bValue = b.lead_quality || ''
          break
        case 'last_contact_date':
          aValue = a.last_contact_date ? new Date(a.last_contact_date).getTime() : 0
          bValue = b.last_contact_date ? new Date(b.last_contact_date).getTime() : 0
          break
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [allLeads, sortColumn, sortDirection])

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setLeads(sortedLeads.slice(startIndex, endIndex))
  }, [sortedLeads, currentPage, itemsPerPage])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(leads.map((lead) => lead.id)))
      setSelectAllPages(false)
    } else {
      setSelectedLeads(new Set())
      setSelectAllPages(false)
    }
  }

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const next = new Set(selectedLeads)
    if (checked) {
      next.add(leadId)
    } else {
      next.delete(leadId)
    }
    setSelectedLeads(next)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('recruiter.table.na')
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return t('recruiter.table.na')
    }
  }

  const formatStatus = (status: string) => {
    const key = status as keyof typeof statusMap
    return t(`recruiter.statuses.${statusMap[key] || 'contacted'}`)
  }

  const statusMap: Record<string, string> = {
    new: 'new',
    contacted: 'contacted',
    nurturing: 'nurturing',
    converted: 'converted',
  }

  const handleSendWhatsApp = async (lead: Lead) => {
    setNotification(null)
    setSendingLeadId(lead.id)
    try {
      const response = await fetch('/api/recruiter/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id, template_id: selectedTemplate }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send WhatsApp message')
      }

      setNotification({ type: 'success', message: t('recruiter.table.whatsappSuccess') })
      fetchLeads()
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || t('recruiter.table.whatsappError') })
    } finally {
      setSendingLeadId(null)
    }
  }

  const leadsTotal = sortedLeads.length
  const allSelected = leads.length > 0 && selectedLeads.size === leads.length
  const someSelected = selectedLeads.size > 0 && selectedLeads.size < leads.length

  if (loading && leads.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-md">
        <p className="text-gray-600">{t('recruiter.table.loading')}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="border-b border-gray-200 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="country-filter">
              {t('recruiter.table.filterCountry')}
            </label>
            <select
              id="country-filter"
              value={selectedCountry}
              onChange={(event) => setSelectedCountry(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('recruiter.table.allCountries')}</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="status-filter">
              {t('recruiter.table.filterStatus')}
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {CONTACT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {t(status.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="template-filter">
              {t('recruiter.table.templateLabel')}
            </label>
            <select
              id="template-filter"
              value={selectedTemplate}
              onChange={(event) => setSelectedTemplate(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {MESSAGE_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {t(template.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="items-per-page">
              {t('recruiter.table.leadsPerPage')}
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(event) => {
                setCurrentPage(1)
                setItemsPerPage(Number(event.target.value))
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {[10, 25, 50, 100, 200].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'} border-b border-gray-200 px-6 py-3 text-sm`}>
          {notification.message}
        </div>
      )}

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-x-auto">
        {selectedLeads.size === leads.length && leads.length > 0 && !selectAllPages && leadsTotal > leads.length && (
          <div className="border-b border-blue-200 bg-blue-50 px-6 py-3 text-sm text-blue-800">
            {t('recruiter.table.pageSelectionPrefix')} {leads.length} {t('recruiter.table.pageSelectionSuffix')}
            <button
              onClick={() => {
                setSelectedLeads(new Set(allLeads.map((lead) => lead.id)))
                setSelectAllPages(true)
              }}
              className="ml-2 font-medium underline"
            >
              {t('recruiter.table.selectAllLink')} {allLeads.length} {t('recruiter.table.selectAllSuffix')}
            </button>
          </div>
        )}
        {selectAllPages && (
          <div className="border-b border-blue-200 bg-blue-50 px-6 py-3 text-sm text-blue-800">
            {t('recruiter.table.allSelectedPrefix')} {allLeads.length} {t('recruiter.table.allSelectedSuffix')}
            <button
              onClick={() => {
                setSelectedLeads(new Set())
                setSelectAllPages(false)
              }}
              className="ml-2 font-medium underline"
            >
              {t('recruiter.table.clearSelection')}
            </button>
          </div>
        )}

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected
                  }}
                  onChange={(event) => handleSelectAll(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {COLUMN_DEFINITIONS.map((column) => {
                const baseClass = 'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                if (column.sortable) {
                  return (
                    <th
                      key={column.key}
                      className={`${baseClass} cursor-pointer select-none hover:bg-gray-100`}
                      onClick={() => handleSort(column.sortable!)}
                    >
                      <div className="flex items-center gap-1">
                        {t(column.labelKey)}
                        {sortColumn === column.sortable && (
                          <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  )
                }
                return (
                  <th key={column.key} className={baseClass}>
                    {t(column.labelKey)}
                  </th>
                )
              })}
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {t('recruiter.table.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {leads.length === 0 ? (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={COLUMN_DEFINITIONS.length + 2}>
                  {t('recruiter.table.noResults')}
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className={`cursor-pointer transition hover:bg-gray-50 ${selectedLeads.has(lead.id) ? 'bg-blue-50' : ''}`}
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest('button, input')) {
                      return
                    }
                    onEditLead?.(lead)
                  }}
                >
                  <td className="px-6 py-4" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.id)}
                      onChange={(event) => handleSelectLead(lead.id, event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{lead.prospect_name || t('recruiter.table.na')}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{lead.prospect_email || t('recruiter.table.na')}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{lead.phone || t('recruiter.table.na')}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{lead.country}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{lead.campaign || t('recruiter.table.na')}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{lead.referral_source || t('recruiter.table.na')}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                      {formatStatus(lead.contact_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-800">
                      {lead.lead_quality || t('recruiter.qualities.unscored')}
                      {lead.lead_score !== null && <span className="ml-1 text-gray-500">({lead.lead_score})</span>}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDate(lead.last_contact_date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="max-w-xs truncate" title={lead.notes || ''}>
                      {lead.notes || t('recruiter.table.noNotes')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          onEditLead?.(lead)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {t('recruiter.table.edit')}
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          handleSendWhatsApp(lead)
                        }}
                        disabled={sendingLeadId === lead.id || !lead.phone}
                        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {sendingLeadId === lead.id ? t('recruiter.table.whatsappSending') : t('recruiter.table.whatsappButton')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {leads.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          {selectedLeads.size > 0 && (
            <button
              onClick={() => setShowBulkEditModal(true)}
              className="mb-2 rounded bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              {t('recruiter.table.editSelected')} ({selectedLeads.size})
            </button>
          )}
          <p className="text-sm text-gray-600">
            {t('recruiter.table.selectionSummaryPrefix')} {((currentPage - 1) * itemsPerPage) + 1} {t('recruiter.table.selectionSummaryTo')} {Math.min(currentPage * itemsPerPage, sortedLeads.length)} {t('recruiter.table.selectionSummaryOf')} {sortedLeads.length} {sortedLeads.length === 1 ? t('recruiter.table.leadLabel') : t('recruiter.table.leadsLabel')}
            {selectedLeads.size > 0 && ` (${selectedLeads.size} ${t('recruiter.table.selectedSuffix')})`}
          </p>
          {sortedLeads.length > itemsPerPage && (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded border px-3 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('recruiter.table.previous')}
              </button>
              <span className="text-sm text-gray-600">
                {t('recruiter.table.page')} {currentPage} {t('recruiter.table.of')} {Math.ceil(sortedLeads.length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage((page) => Math.min(Math.ceil(sortedLeads.length / itemsPerPage), page + 1))}
                disabled={currentPage >= Math.ceil(sortedLeads.length / itemsPerPage)}
                className="rounded border px-3 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('recruiter.table.next')}
              </button>
            </div>
          )}
        </div>
      )}
      <BulkEditLeadModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        selectedLeadIds={Array.from(selectedLeads)}
        onSuccess={handleBulkEditSuccess}
      />
    </div>
  )
}
