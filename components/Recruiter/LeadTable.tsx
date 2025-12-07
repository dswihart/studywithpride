"use client"

import { useToast } from '@/components/ui/Toast'
import { useEffect, useRef, useState, useCallback } from "react"
import { useLanguage } from "@/components/LanguageContext"
import BulkEditLeadModal from "./BulkEditLeadModal"
import MobileLeadCard from "./MobileLeadCard"
import StatusBadge, { QualityBadge } from "./StatusBadge"
import FunnelStageBadge from "./Funnel/FunnelStageBadge"
import { FunnelStageNumber } from "@/lib/funnel/types"
import ActionButtons from "./ActionButtons"
import ExpandedRowDetails from "./ExpandedRowDetails"
import HiddenColumnsIndicator from "./HiddenColumnsIndicator"
import { useResponsiveColumns } from "@/hooks/useResponsiveColumns"
import { ColumnConfig, getColumnLabel } from "@/lib/responsive/columnConfig"

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
  recruit_priority: number | null | null
  duplicate_of: string | null
  duplicate_detected_at: string | null
  recency_score: number | null
  lead_score: number | null
  lead_quality: string | null
  funnel_stage?: number
  funnel_data?: any
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
  { value: "unqualified", label: "unqualified" },
  { value: "notinterested", label: "notinterested" },
  { value: "wrongnumber", label: "wrongnumber" },
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
  | "recruit_priority"
  | "barcelona_timeline"
  | "intake"
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
  | "recruit_priority"
  | "barcelona_timeline"
  | "intake"
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
  { key: "referral_source", labelKey: "recruiter.table.referralColumn", sortable: "referral_source" },
  { key: "contact_status", labelKey: "recruiter.table.columns.status", sortable: "contact_status" },
  { key: "lead_quality", labelKey: "recruiter.table.columns.quality", sortable: "lead_quality" },
  { key: "last_contact_date", labelKey: "recruiter.table.columns.lastContact", sortable: "last_contact_date" },
  { key: "date_added", labelKey: "recruiter.table.columns.dateAdded", sortable: "date_added" },
  { key: "notes", labelKey: "recruiter.table.columns.notes" },
  { key: "is_duplicate", labelKey: "recruiter.table.columns.duplicate", sortable: "is_duplicate" },
  { key: "barcelona_timeline", labelKey: "recruiter.table.columns.barcelonaTimeline", sortable: "barcelona_timeline" },
  { key: "intake", labelKey: "recruiter.table.columns.intake", sortable: "intake" },
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
  const [selectedBarcelonaTimeline, setSelectedBarcelonaTimeline] = useState("all")
  const [selectedIntake, setSelectedIntake] = useState("all")
  const [intakes, setIntakes] = useState<string[]>([])
  const [includeArchived, setIncludeArchived] = useState(false)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const columnMenuRef = useRef<HTMLDivElement | null>(null)

  // Use responsive columns hook
  const { breakpoint, visibleColumns, hiddenColumns, isMobile, isTablet, isDesktop, mounted } = useResponsiveColumns(
    columnVisibility as Record<string, boolean>
  )

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
    const hasActiveFilters = selectedCountry !== "all" || selectedStatus !== "all" || dateFrom !== "" || dateTo !== "" || selectedBarcelonaTimeline !== "all" || selectedIntake !== "all"

    if (hasActiveFilters && allLeads.length > 0) {
      // Check if the highlighted lead exists in allLeads
      const leadExists = allLeads.some(lead => lead.id === highlightedLeadId)

      if (leadExists) {
        console.log("Auto-clearing filters to show highlighted lead:", highlightedLeadId)
        setSelectedCountry("all")
        setSelectedStatus("all")
        setDateFrom("")
        setDateTo("")
        setSelectedBarcelonaTimeline("all")
        setSelectedIntake("all")
      }
    }
  }, [highlightedLeadId, allLeads, selectedCountry, selectedStatus, selectedBarcelonaTimeline, selectedIntake])

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
      if (includeArchived) params.append("include_archived", "true")
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

      const uniqueIntakes = Array.from(new Set(fetchedLeads.map((lead) => lead.intake).filter((intake): intake is string => intake !== null && intake !== ""))).sort()
      setIntakes(uniqueIntakes)

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
  }, [selectedCountry, selectedStatus, includeArchived, t])

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

    // Barcelona timeline filter
    if (selectedBarcelonaTimeline !== "all") {
      const timelineValue = parseInt(selectedBarcelonaTimeline, 10)
      filtered = filtered.filter((lead) => lead.barcelona_timeline === timelineValue)
    }

    // Intake filter
    if (selectedIntake !== "all") {
      filtered = filtered.filter((lead) => lead.intake === selectedIntake)
    }

    return filtered
  }, [searchQuery, dateFrom, dateTo, selectedBarcelonaTimeline, selectedIntake])

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
        case "intake":
          aValue = a.intake?.toLowerCase() || ""
          bValue = b.intake?.toLowerCase() || ""
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
        case "recruit_priority":
          aValue = a.recruit_priority || 0
          bValue = b.recruit_priority || 0
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
      const date = new Date(dateString)
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return t("recruiter.table.na")
    }
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

  // Get visible columns based on breakpoint and user visibility
  const getVisibleTableColumns = () => {
    return visibleColumns.filter(col => columnVisibility[col.key as ColumnKey] !== false)
  }

  const tableVisibleColumns = getVisibleTableColumns()
  const totalColumns = tableVisibleColumns.length + 2 // selection + actions
  const allSelected = leads.length > 0 && selectedLeads.size === leads.length
  const someSelected = selectedLeads.size > 0 && selectedLeads.size < leads.length

  const handleRowClick = (lead: Lead, event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.closest('input[type="checkbox"]')) {
      return
    }

    // On tablet, toggle expanded row
    if (isTablet && hiddenColumns.length > 0) {
      setExpandedRowId(expandedRowId === lead.id ? null : lead.id)
      return
    }

    onViewLead?.(lead)
  }

  const renderCellContent = (lead: Lead, columnKey: string) => {
    switch (columnKey) {
      case "prospect_name":
        return (
          <span
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium truncate block max-w-[200px]"
            onClick={(e) => {
              e.stopPropagation()
              onViewLead?.(lead)
            }}
          >
            {lead.prospect_name || t("recruiter.table.na")}
          </span>
        )
      case "prospect_email":
        return <span className="truncate block max-w-[220px]">{lead.prospect_email || t("recruiter.table.na")}</span>
      case "phone":
        return lead.phone || t("recruiter.table.na")
      case "country":
        return lead.country
      case "referral_source":
        return lead.referral_source || t("recruiter.table.na")
      case "contact_status":
        return <StatusBadge status={lead.contact_status} compact={isTablet} />
      case "funnel_stage":
        return <FunnelStageBadge leadId={lead.id} contactStatus={lead.contact_status} currentStage={(lead.funnel_stage || 1) as FunnelStageNumber} completedStages={lead.funnel_data?.completedStages || []} size="sm" showLabel={false} />
      case "lead_quality":
        return <QualityBadge quality={lead.lead_quality} score={lead.lead_score} compact={isTablet} />
      case "last_contact_date":
        return formatDate(lead.last_contact_date)
      case "date_added":
        return formatDate(lead.date_imported || lead.created_at)
      case "notes":
        return (
          <div className="max-w-[200px] truncate" title={lead.notes || ""}>
            {lead.notes || t("recruiter.table.noNotes")}
          </div>
        )
      case "barcelona_timeline":
        return lead.barcelona_timeline ? lead.barcelona_timeline + " months" : t("recruiter.table.na")
      case "intake":
        return lead.intake || t("recruiter.table.na")
      case "created_time":
        return formatDate(lead.created_time)
      case "is_duplicate":
        return (
          <span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + (lead.is_duplicate ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300")}>
            {lead.is_duplicate ? "Dup" : "Orig"}
          </span>
        )
      case "recruit_priority":
        if (!lead.recruit_priority) return <span className="text-gray-400">-</span>
        return (
          <span className="text-yellow-400" title={`Priority: ${lead.recruit_priority}/5`}>
            {"*".repeat(lead.recruit_priority)}
          </span>
        )
      default:
        return null
    }
  }

  const renderHeaderCell = (column: ColumnConfig) => {
    const baseClasses = "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
    const sortable = COLUMN_DEFINITIONS.find(c => c.key === column.key)?.sortable

    if (sortable) {
      return (
        <th
          key={column.key}
          className={`${baseClasses} cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600`}
          onClick={() => handleSort(sortable)}
          style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}
        >
          <div className="flex items-center">
            {column.label}
            {renderSortIcon(sortable)}
          </div>
        </th>
      )
    }

    return (
      <th key={column.key} className={baseClasses} style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}>
        {column.label}
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
      {/* Filters Section */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="flex flex-col gap-4">
          {/* Search Input - Full width on mobile */}
          <div className="w-full">
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
            <label className="mt-2 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => {
                  setIncludeArchived(e.target.checked)
                  setCurrentPage(1)
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Include archived leads</span>
            </label>
          </div>

          {/* Filter Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor="country-filter">
                Country
              </label>
              <select
                id="country-filter"
                value={selectedCountry}
                onChange={(event) => setSelectedCountry(event.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor="status-filter">
                Status
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                {CONTACT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {t(`recruiter.statuses.${status.label}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor="date-from">
                From Date
              </label>
              <input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor="date-to">
                To Date
              </label>
              <input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor="timeline-filter">
                Timeline
              </label>
              <select
                id="timeline-filter"
                value={selectedBarcelonaTimeline}
                onChange={(event) => {
                  setSelectedBarcelonaTimeline(event.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor="intake-filter">
                Intake
              </label>
              <select
                id="intake-filter"
                value={selectedIntake}
                onChange={(event) => {
                  setSelectedIntake(event.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                {intakes.map((intake) => (
                  <option key={intake} value={intake}>
                    {intake}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Column Visibility & Items Per Page - Desktop only */}
          {isDesktop && (
            <div className="flex items-end gap-4">
              <div className="relative" ref={columnMenuRef}>
                <span className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Columns
                </span>
                <button
                  type="button"
                  onClick={() => setShowColumnMenu((prev) => !prev)}
                  className="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:border-transparent focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                >
                  Columns
                  <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor="items-per-page">
                  Per Page
                </label>
                <select
                  id="items-per-page"
                  value={itemsPerPage}
                  onChange={(event) => {
                    const newValue = Number(event.target.value)
                    setCurrentPage(1)
                    setItemsPerPage(newValue)
                  }}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  {[10, 25, 50, 100, 200].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Hidden columns indicator for tablet */}
      {mounted && (
        <HiddenColumnsIndicator hiddenColumns={hiddenColumns} breakpoint={breakpoint} />
      )}

      <div className="overflow-x-auto">
        {selectedLeads.size === leads.length && leads.length > 0 && !selectAllPages && allLeads.length > leads.length && (
          <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
            {leads.length} on this page selected.
            <button onClick={handleSelectAllPages} className="ml-2 font-medium text-blue-600 underline hover:text-blue-800">
              Select all {allLeads.length}
            </button>
          </div>
        )}
        {selectAllPages && (
          <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
            All {allLeads.length} leads selected.
            <button
              onClick={() => {
                setSelectedLeads(new Set())
                setSelectAllPages(false)
              }}
              className="ml-2 font-medium text-blue-600 underline hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Mobile Card View */}
        {isMobile ? (
          <div className="p-4 space-y-3">
            {leads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t("recruiter.table.noResults")}</div>
            ) : (
              leads.map((lead) => (
                <MobileLeadCard
                  key={lead.id}
                  lead={lead}
                  isSelected={selectedLeads.has(lead.id)}
                  onSelect={(leadId, selected) => handleSelectLead(leadId, selected)}
                  onView={() => onViewLead?.(lead)}
                  onWhatsApp={() => onWhatsAppClick?.(lead)}
                  onLogContact={() => onLogContactClick?.(lead)}
                  onEdit={() => onViewLead?.(lead)}
                />
              ))
            )}
          </div>
        ) : (
          /* Tablet and Desktop Table View */
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left w-10">
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
                {tableVisibleColumns.map((column) => renderHeaderCell(column))}
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {leads.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan={totalColumns}>
                    {t("recruiter.table.noResults")}
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <>
                    <tr
                      key={lead.id}
                      id={`lead-row-${lead.id}`}
                      className={`cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700 ${highlightedLeadId === lead.id
                        ? "bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 shadow-lg"
                        : selectedLeads.has(lead.id)
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : expandedRowId === lead.id
                            ? "bg-gray-50 dark:bg-gray-700/50"
                            : ""
                        }`}
                      onClick={(event) => handleRowClick(lead, event)}>
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.id)}
                          onChange={(event) => handleSelectLead(lead.id, event.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      {tableVisibleColumns.map((column) => (
                        <td key={`${lead.id}-${column.key}`} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {renderCellContent(lead, column.key)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <ActionButtons
                          lead={lead}
                          compact={isTablet}
                          onLogContact={onLogContactClick}
                          onWhatsApp={onWhatsAppClick}
                          onMessageHistory={onMessageHistoryClick}
                          onEdit={onViewLead}
                        />
                      </td>
                    </tr>
                    {/* Expanded row details for tablet */}
                    {isTablet && expandedRowId === lead.id && hiddenColumns.length > 0 && (
                      <ExpandedRowDetails
                        lead={lead}
                        hiddenColumns={hiddenColumns}
                        formatDate={formatDate}
                      />
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {leads.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-4 py-3">
          {selectedLeads.size > 0 && (
            <button
              onClick={() => setShowBulkEditModal(true)}
              className="mb-2 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 text-sm"
            >
              Edit Selected ({selectedLeads.size})
            </button>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, getSortedLeads(getFilteredLeads(allLeads)).length)} of {getSortedLeads(getFilteredLeads(allLeads)).length} leads
            {selectedLeads.size > 0 && ` (${selectedLeads.size} selected)`}
            {searchQuery && ` (filtered from ${allLeads.length} total)`}
          </p>
          {getSortedLeads(getFilteredLeads(allLeads)).length > itemsPerPage && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {Math.ceil(getSortedLeads(getFilteredLeads(allLeads)).length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage((page) => Math.min(Math.ceil(getSortedLeads(getFilteredLeads(allLeads)).length / itemsPerPage), page + 1))}
                disabled={currentPage >= Math.ceil(getSortedLeads(getFilteredLeads(allLeads)).length / itemsPerPage)}
                className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
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
