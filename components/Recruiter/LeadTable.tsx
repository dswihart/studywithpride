"use client"



import { useEffect, useRef, useState, useCallback } from "react"
import { useLanguage } from "@/components/LanguageContext"
import BulkEditLeadModal from "./BulkEditLeadModal"

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
  date_imported: string | null
  name_score: number | null
  email_score: number | null
  phone_valid: boolean | null
  is_duplicate: boolean | null
  duplicate_of: string | null
  duplicate_detected_at: string | null
  recency_score: number | null
  lead_score: number | null
  lead_quality: string | null
}

interface LeadTableProps {
  onLeadsChange?: (leads: Lead[]) => void
  onEditLead?: (lead: Lead) => void
  onViewLead?: (lead: Lead) => void
  onSelectionChange?: (selectedIds: string[]) => void
  onWhatsAppClick?: (lead: Lead) => void
  onMessageHistoryClick?: (lead: Lead) => void
  onLogContactClick?: (lead: Lead) => void
  highlightedLeadId?: string | null
}

const CONTACT_STATUSES = [
  { value: "all", label: "all" },
  { value: "not_contacted", label: "not_contacted" },
  { value: "referral", label: "referral" },
  { value: "contacted", label: "contacted" },
  { value: "interested", label: "interested" },
  { value: "qualified", label: "qualified" },
  { value: "converted", label: "converted" },
  { value: "unqualified", label: "unqualified" },
]

type SortColumn =
  | "prospect_name"
  | "prospect_email"
  | "country"
  | "phone"
  | "campaign"
  | "referral_source"
  | "contact_status"
  | "lead_quality"
  | "last_contact_date"
  | "is_duplicate"
  | "barcelona_timeline"
  | "created_time"
  | "date_added"
  | null

type SortDirection = "asc" | "desc" | null
type ColumnKey =
  | "prospect_name"
  | "prospect_email"
  | "phone"
  | "country"
  | "campaign"
  | "referral_source"
  | "contact_status"
  | "lead_quality"
  | "last_contact_date"
  | "is_duplicate"
  | "barcelona_timeline"
  | "created_time"
  | "date_added"
  | "notes"

type ColumnDefinition = {
  key: ColumnKey
  labelKey: string
  sortable?: SortColumn
}

const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  { key: "prospect_name", labelKey: "recruiter.table.columns.prospectName", sortable: "prospect_name" },
  { key: "prospect_email", labelKey: "recruiter.table.columns.email", sortable: "prospect_email" },
  { key: "phone", labelKey: "recruiter.table.columns.phone", sortable: "phone" },
  { key: "country", labelKey: "recruiter.table.columns.country", sortable: "country" },
  { key: "campaign", labelKey: "recruiter.table.columns.campaign", sortable: "campaign" },
  { key: "referral_source", labelKey: "recruiter.table.referralColumn", sortable: "referral_source" },
  { key: "contact_status", labelKey: "recruiter.table.columns.status", sortable: "contact_status" },
  { key: "lead_quality", labelKey: "recruiter.table.columns.quality", sortable: "lead_quality" },
  { key: "last_contact_date", labelKey: "recruiter.table.columns.lastContact", sortable: "last_contact_date" },
  { key: "date_added", labelKey: "recruiter.table.columns.dateAdded", sortable: "date_added" },
  { key: "notes", labelKey: "recruiter.table.columns.notes" },
  { key: "is_duplicate", labelKey: "recruiter.table.columns.duplicate", sortable: "is_duplicate" },
  { key: "barcelona_timeline", labelKey: "recruiter.table.columns.barcelonaTimeline", sortable: "barcelona_timeline" },
  { key: "created_time", labelKey: "recruiter.table.columns.createdTime", sortable: "created_time" },
]

const DEFAULT_COLUMN_VISIBILITY: Record<ColumnKey, boolean> = COLUMN_DEFINITIONS.reduce(
  (acc, column) => ({ ...acc, [column.key]: true }),
  {} as Record<ColumnKey, boolean>
)

const COLUMN_VISIBILITY_STORAGE_KEY = "recruiter-lead-table-columns"

export default function LeadTable({ onLeadsChange, onEditLead, onViewLead, onSelectionChange, onWhatsAppClick, onMessageHistoryClick, onLogContactClick, highlightedLeadId }: LeadTableProps) {
  const { t } = useLanguage()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [countries, setCountries] = useState<string[]>([])
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [selectAllPages, setSelectAllPages] = useState(false)
  const [sortColumn, setSortColumn] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKey, boolean>>(DEFAULT_COLUMN_VISIBILITY)
  const [showColumnMenu, setShowColumnMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const columnMenuRef = useRef<HTMLDivElement | null>(null)

  // Use refs for callbacks to prevent infinite re-render loops
  const onLeadsChangeRef = useRef(onLeadsChange)
  const onSelectionChangeRef = useRef(onSelectionChange)

  // Keep refs up to date
  useEffect(() => {
    onLeadsChangeRef.current = onLeadsChange
    onSelectionChangeRef.current = onSelectionChange
  }, [onLeadsChange, onSelectionChange])

  useEffect(() => {

    const loadVisibility = () => {
      if (typeof window === "undefined") return
      const stored = window.localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY)
      if (!stored) return
      try {
        const parsed = JSON.parse(stored)
        const nextVisibility = { ...DEFAULT_COLUMN_VISIBILITY }
        COLUMN_DEFINITIONS.forEach(({ key }) => {
          if (typeof parsed[key] === "boolean") {
            nextVisibility[key] = parsed[key]
          }
        })
        setColumnVisibility(nextVisibility)
      } catch {
        // Ignore malformed data
      }
    }

    loadVisibility()
  }, [])

  useEffect(() => {

    if (typeof window === "undefined") return
    window.localStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(columnVisibility))
  }, [columnVisibility])

  useEffect(() => {

    const handleClick = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Auto-clear filters when highlighting a lead to ensure it's visible
  useEffect(() => {

    if (!highlightedLeadId) return

    // Check if filters are currently active
    const hasActiveFilters = selectedCountry !== "all" || selectedStatus !== "all" || dateFrom !== "" || dateTo !== ""

    if (hasActiveFilters && allLeads.length > 0) {
      // Check if the highlighted lead exists in allLeads
      const leadExists = allLeads.some(lead => lead.id === highlightedLeadId)

      if (leadExists) {
        console.log("Auto-clearing filters to show highlighted lead:", highlightedLeadId)
        setSelectedCountry("all")
        setSelectedStatus("all")
        setDateFrom("")
        setDateTo("")
      }
    }
  }, [highlightedLeadId, allLeads, selectedCountry, selectedStatus])

  useEffect(() => {
    if (onSelectionChangeRef.current) {
      onSelectionChangeRef.current(Array.from(selectedLeads))
    }
  }, [selectedLeads])

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams()
      if (selectedCountry !== "all") params.append("country", selectedCountry)
      if (selectedStatus !== "all") params.append("contact_status", selectedStatus)
      params.append("limit", "10000")

      const response = await fetch(`/api/recruiter/leads-read?${params.toString()}`, {
        credentials: "include",
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || t("recruiter.table.noResults"))
        setLeads([])
        return
      }

      const fetchedLeads: Lead[] = result.data?.leads || []
      setAllLeads(fetchedLeads)
      setCurrentPage(1)
      setSelectedLeads(new Set())
      setSelectAllPages(false)

      const uniqueCountries = Array.from(new Set(fetchedLeads.map((lead) => lead.country))).sort()
      setCountries(uniqueCountries)

      // Use ref to call callback without causing re-render loop
      if (onLeadsChangeRef.current) {
        onLeadsChangeRef.current(fetchedLeads)
      }
    } catch {
      setError(t("recruiter.table.noResults"))
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [selectedCountry, selectedStatus, t])

  // Fetch leads when filters change
  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleBulkEditSuccess = () => {
    fetchLeads()
    setShowBulkEditModal(false)
  }

  const handleSort = (column: SortColumn) => {
    let newDirection: SortDirection = "asc"

    if (sortColumn === column) {
      if (sortDirection === "asc") {
        newDirection = "desc"
      } else if (sortDirection === "desc") {
        setSortColumn(null)
        setSortDirection(null)
        setCurrentPage(1)
        return
      }
    }

    setSortColumn(column)
    setSortDirection(newDirection)
    setCurrentPage(1)
  }

  const getFilteredLeads = useCallback((leadsToFilter: Lead[]) => {
    let filtered = leadsToFilter

    // Text search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((lead) => {
        const name = (lead.prospect_name || "").toLowerCase()
        const email = (lead.prospect_email || "").toLowerCase()
        const phone = (lead.phone || "").toLowerCase()
        return name.includes(query) || email.includes(query) || phone.includes(query)
      })
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filtered = filtered.filter((lead) => {
        const leadDate = lead.date_imported || lead.created_at
        if (!leadDate) return false
        const leadDateObj = new Date(leadDate)
        leadDateObj.setHours(0, 0, 0, 0)

        if (dateFrom) {
          const fromDate = new Date(dateFrom)
          fromDate.setHours(0, 0, 0, 0)
          if (leadDateObj < fromDate) return false
        }

        if (dateTo) {
          const toDate = new Date(dateTo)
          toDate.setHours(23, 59, 59, 999)
          if (leadDateObj > toDate) return false
        }

        return true
      })
    }

    return filtered
  }, [searchQuery, dateFrom, dateTo])

  const getSortedLeads = (leadsToSort: Lead[]) => {
    if (!sortColumn || !sortDirection) return leadsToSort

    return [...leadsToSort].sort((a, b) => {
      let aValue: any = null
      let bValue: any = null

      switch (sortColumn) {
        case "prospect_name":
          aValue = a.prospect_name?.toLowerCase() || ""
          bValue = b.prospect_name?.toLowerCase() || ""
          break
        case "prospect_email":
          aValue = a.prospect_email?.toLowerCase() || ""
          bValue = b.prospect_email?.toLowerCase() || ""
          break
        case "country":
          aValue = a.country.toLowerCase()
          bValue = b.country.toLowerCase()
          break
        case "phone":
          aValue = a.phone || ""
          bValue = b.phone || ""
          break
        case "campaign":
          aValue = a.campaign || ""
          bValue = b.campaign || ""
          break
        case "referral_source":
          aValue = a.referral_source?.toLowerCase() || ""
          bValue = b.referral_source?.toLowerCase() || ""
          break
        case "contact_status":
          aValue = a.contact_status.toLowerCase()
          bValue = b.contact_status.toLowerCase()
          break
        case "lead_quality": {
          const qualityOrder: Record<string, number> = {
            High: 4,
            Medium: 3,
            Low: 2,
            "Very Low": 1,
          }
          aValue = qualityOrder[a.lead_quality || ""] || 0
          bValue = qualityOrder[b.lead_quality || ""] || 0
          break
        }
        case "barcelona_timeline":
          aValue = a.barcelona_timeline || 0
          bValue = b.barcelona_timeline || 0
          break
        case "created_time":
          aValue = a.created_time ? new Date(a.created_time).getTime() : 0
          bValue = b.created_time ? new Date(b.created_time).getTime() : 0
          break
        case "date_added": {
          const aDate = a.date_imported || a.created_at
          const bDate = b.date_imported || b.created_at
          aValue = aDate ? new Date(aDate).getTime() : 0
          bValue = bDate ? new Date(bDate).getTime() : 0
          break
        }
        case "is_duplicate":
          aValue = a.is_duplicate ? 1 : 0
          bValue = b.is_duplicate ? 1 : 0
          break
        case "last_contact_date":
          aValue = a.last_contact_date ? new Date(a.last_contact_date).getTime() : 0
          bValue = b.last_contact_date ? new Date(b.last_contact_date).getTime() : 0
          break
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }

  useEffect(() => {
    const filteredLeads = getFilteredLeads(allLeads)
    const sortedLeads = getSortedLeads(filteredLeads)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setLeads(sortedLeads.slice(startIndex, endIndex))
  }, [allLeads, currentPage, itemsPerPage, sortColumn, sortDirection, getFilteredLeads])

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return (
        <span className="ml-1 text-gray-400">
          <svg className="inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </span>
      )
    }

    if (sortDirection === "asc") {
      return (
        <span className="ml-1 text-blue-600">
          <svg className="inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </span>
      )
    }

    return (
      <span className="ml-1 text-blue-600">
        <svg className="inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(leads.map((lead) => lead.id)))
      setSelectAllPages(false)
    } else {
      setSelectedLeads(new Set())
      setSelectAllPages(false)
    }
  }

  const handleSelectAllPages = () => {
    setSelectedLeads(new Set(allLeads.map((lead) => lead.id)))
    setSelectAllPages(true)
  }

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const nextSelected = new Set(selectedLeads)
    if (checked) {
      nextSelected.add(leadId)
    } else {
      nextSelected.delete(leadId)
    }
    setSelectedLeads(nextSelected)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("recruiter.table.na")
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return t("recruiter.table.na")
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "not_contacted":
        return "bg-gray-100 text-gray-800"
      case "referral":
        return "bg-cyan-100 text-cyan-800"
      case "contacted":
        return "bg-blue-100 text-blue-800"
      case "interested":
        return "bg-yellow-100 text-yellow-800"
      case "qualified":
        return "bg-purple-100 text-purple-800"
      case "converted":
        return "bg-green-100 text-green-800"
      case "unqualified":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => t(`recruiter.statuses.${status}`)

  const getLeadQualityBadgeColor = (quality: string | null) => {
    switch (quality) {
      case "High":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-orange-100 text-orange-800"
      case "Very Low":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLeadQualityLabel = (quality: string | null) => {
    if (!quality) return t("recruiter.qualities.unscored")

    const map: Record<string, string> = {
      High: "high",
      Medium: "medium",
      Low: "low",
      "Very Low": "veryLow",
    }

    return t(`recruiter.qualities.${map[quality] || "unscored"}`)
  }

  const toggleColumnVisibility = (key: ColumnKey) => {
    setColumnVisibility((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      if (Object.values(next).some(Boolean)) {
        return next
      }
      return prev
    })
  }

  const visibleColumns = COLUMN_DEFINITIONS.filter((column) => columnVisibility[column.key])
  const totalColumns = visibleColumns.length + 2 // selection + actions
  const allSelected = leads.length > 0 && selectedLeads.size === leads.length
  const someSelected = selectedLeads.size > 0 && selectedLeads.size < leads.length

  const handleRowClick = (lead: Lead, event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.closest('input[type="checkbox"]')) {
      return
    }

    onEditLead?.(lead)
  }

  const renderCellContent = (lead: Lead, columnKey: ColumnKey) => {
    switch (columnKey) {
      case "prospect_name":
        return (
          <span 
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
            onClick={(e) => {
              e.stopPropagation()
              onViewLead?.(lead)
            }}
          >
            {lead.prospect_name || t("recruiter.table.na")}
          </span>
        )
      case "prospect_email":
        return lead.prospect_email || t("recruiter.table.na")
      case "phone":
        return lead.phone || t("recruiter.table.na")
      case "country":
        return lead.country
      case "campaign":
        return lead.campaign || t("recruiter.table.na")
      case "referral_source":
        return lead.referral_source || t("recruiter.table.na")
      case "contact_status":
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(lead.contact_status)}`}>
            {getStatusLabel(lead.contact_status)}
          </span>
        )
      case "lead_quality":
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLeadQualityBadgeColor(lead.lead_quality)}`}>
            {getLeadQualityLabel(lead.lead_quality)}
            {lead.lead_score !== null && <span className="ml-2 text-gray-500">({lead.lead_score})</span>}
          </span>
        )
      case "last_contact_date":
        return formatDate(lead.last_contact_date)
      case "date_added":
        return formatDate(lead.date_imported || lead.created_at)
      case "notes":
        return (
          <div className="max-w-xs truncate" title={lead.notes || ""}>
            {lead.notes || t("recruiter.table.noNotes")}
          </div>
        )
      case "barcelona_timeline":
        return lead.barcelona_timeline ? lead.barcelona_timeline + " months" : t("recruiter.table.na")
      case "created_time":
        return lead.created_time || t("recruiter.table.na")
      case "is_duplicate":
        return (
          <span className={"px-3 py-1 rounded-full text-xs font-semibold " + (lead.is_duplicate ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800")}>
            {lead.is_duplicate ? "Duplicate" : "Original"}
          </span>
        )
      default:
        return null
    }
  }

  const renderHeaderCell = (column: ColumnDefinition) => {
    const baseClasses = "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"

    if (column.sortable) {
      return (
        <th
          key={column.key}
          className={`${baseClasses} cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600`}
          onClick={() => handleSort(column.sortable!)}
        >
          <div className="flex items-center">
            {t(column.labelKey)}
            {renderSortIcon(column.sortable!)}
          </div>
        </th>
      )
    }

    return (
      <th key={column.key} className={baseClasses}>
        {t(column.labelKey)}
      </th>
    )
  }

  if (loading && leads.length === 0) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-800 p-8 text-center shadow-md">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t("recruiter.table.loading")}</div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md">
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search Input */}
          <div className="flex-1 sm:flex-[2]">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="search-input">
              Search Leads
            </label>
            <div className="relative">
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by name, email, or phone..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 pl-10 text-gray-900 dark:text-white placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setCurrentPage(1)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="country-filter">
              {t("recruiter.table.filterCountry")}
            </label>
            <select
              id="country-filter"
              value={selectedCountry}
              onChange={(event) => setSelectedCountry(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t("recruiter.table.allCountries")}</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="status-filter">
              {t("recruiter.table.filterStatus")}
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {CONTACT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {t(`recruiter.statuses.${status.label}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="date-from">
              Date Added From
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="date-to">
              Date Added To
            </label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1" ref={columnMenuRef}>
            <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("recruiter.table.columnVisibility")}
            </span>
            <button
              type="button"
              onClick={() => setShowColumnMenu((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {t("recruiter.table.columnButton")}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showColumnMenu && (
              <div className="absolute z-10 mt-2 w-64 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg">
                <div className="max-h-64 overflow-auto p-4">
                  {COLUMN_DEFINITIONS.map((column) => (
                    <label key={column.key} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={columnVisibility[column.key]}
                        onChange={() => toggleColumnVisibility(column.key)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{t(column.labelKey)}</span>
                    </label>
                  ))}
                  <p className="mt-3 text-xs text-gray-500">{t("recruiter.table.columnHint")}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="items-per-page">
              {t("recruiter.table.leadsPerPage")}
            </label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(event) => {
                const newValue = Number(event.target.value)
                setCurrentPage(1)
                setItemsPerPage(newValue)
              }}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {[10, 25, 50, 100, 200].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        {selectedLeads.size === leads.length && leads.length > 0 && !selectAllPages && allLeads.length > leads.length && (
          <div className="border-b border-blue-200 bg-blue-50 px-6 py-3 text-sm text-blue-800">
            {t("recruiter.table.pageSelectionPrefix")} {leads.length} {t("recruiter.table.pageSelectionSuffix")}
            <button onClick={handleSelectAllPages} className="ml-2 font-medium text-blue-600 underline hover:text-blue-800">
              {t("recruiter.table.selectAllLink")} {allLeads.length} {t("recruiter.table.selectAllSuffix")}
            </button>
          </div>
        )}
        {selectAllPages && (
          <div className="border-b border-blue-200 bg-blue-50 px-6 py-3 text-sm text-blue-800">
            {t("recruiter.table.allSelectedPrefix")} {allLeads.length} {t("recruiter.table.allSelectedSuffix")}
            <button
              onClick={() => {
                setSelectedLeads(new Set())
                setSelectAllPages(false)
              }}
              className="ml-2 font-medium text-blue-600 underline hover:text-blue-800"
            >
              {t("recruiter.table.clearSelection")}
            </button>
          </div>
        )}

        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
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
              {visibleColumns.map((column) => renderHeaderCell(column))}
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {t("recruiter.table.columns.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {leads.length === 0 ? (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={totalColumns}>
                  {t("recruiter.table.noResults")}
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  id={`lead-row-${lead.id}`}
                  className={`cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700 ${highlightedLeadId === lead.id
                    ? "bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 shadow-lg"
                    : selectedLeads.has(lead.id)
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                    }`}
                  onClick={(event) => handleRowClick(lead, event)}>
                  <td className="px-6 py-4" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.id)}
                      onChange={(event) => handleSelectLead(lead.id, event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  {visibleColumns.map((column) => (
                    <td key={`${lead.id}-${column.key}`} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {renderCellContent(lead, column.key)}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      {lead.phone_valid && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation()
                            onWhatsAppClick?.(lead)
                          }}
                          className="flex items-center gap-1 font-medium text-green-600 hover:text-green-800"
                          title="Send WhatsApp message"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          WhatsApp
                        </button>
                      )}
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          onMessageHistoryClick?.(lead)
                        }}
                        style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 500, color: "#9333ea" }}
                        title="View message history"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Messages
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          onLogContactClick?.(lead)
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
                        onClick={(event) => {
                          event.stopPropagation()
                          onEditLead?.(lead)
                        }}
                        className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t("recruiter.table.edit")}
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
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-6 py-4">
          {selectedLeads.size > 0 && (
            <button
              onClick={() => setShowBulkEditModal(true)}
              className="mb-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              {t("recruiter.table.editSelected")} ({selectedLeads.size})
            </button>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("recruiter.table.selectionSummaryPrefix")} {((currentPage - 1) * itemsPerPage) + 1} {t("recruiter.table.selectionSummaryTo")} {Math.min(currentPage * itemsPerPage, getSortedLeads(getFilteredLeads(allLeads)).length)} {t("recruiter.table.selectionSummaryOf")} {getSortedLeads(getFilteredLeads(allLeads)).length}{" "}
            {getSortedLeads(getFilteredLeads(allLeads)).length === 1 ? t("recruiter.table.leadLabel") : t("recruiter.table.leadsLabel")}
            {selectedLeads.size > 0 && ` (${selectedLeads.size} ${t("recruiter.table.selectedSuffix")})`}
            {searchQuery && ` (filtered from ${allLeads.length} total)`}
          </p>
          {getSortedLeads(getFilteredLeads(allLeads)).length > itemsPerPage && (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded border px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("recruiter.table.previous")}
              </button>
              <span className="text-sm text-gray-600">
                {t("recruiter.table.page")} {currentPage} {t("recruiter.table.of")} {Math.ceil(getSortedLeads(getFilteredLeads(allLeads)).length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage((page) => Math.min(Math.ceil(getSortedLeads(getFilteredLeads(allLeads)).length / itemsPerPage), page + 1))}
                disabled={currentPage >= Math.ceil(getSortedLeads(getFilteredLeads(allLeads)).length / itemsPerPage)}
                className="rounded border px-3 py-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("recruiter.table.next")}
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
