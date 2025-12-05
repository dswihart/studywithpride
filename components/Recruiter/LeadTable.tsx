"use client"



import { useEffect, useRef, useState, useCallback } from "react"
import { useLanguage } from "@/components/LanguageContext"
import BulkEditLeadModal from "./BulkEditLeadModal"
import MobileLeadCard from "./MobileLeadCard"
import AdvancedFilters from "./AdvancedFilters"

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
  const [contactActivityFilter, setContactActivityFilter] = useState("all")

  // Unified filter state for AdvancedFilters component
  const filterState = {
    searchQuery,
    selectedCountry,
    selectedStatus,
    dateFrom,
    dateTo,
    selectedBarcelonaTimeline,
    selectedIntake,
    includeArchived,
    contactActivityFilter
  }

  const handleFiltersChange = (newFilters: typeof filterState) => {
    if (newFilters.searchQuery !== searchQuery) setSearchQuery(newFilters.searchQuery)
    if (newFilters.selectedCountry !== selectedCountry) setSelectedCountry(newFilters.selectedCountry)
    if (newFilters.selectedStatus !== selectedStatus) setSelectedStatus(newFilters.selectedStatus)
    if (newFilters.dateFrom !== dateFrom) setDateFrom(newFilters.dateFrom)
    if (newFilters.dateTo !== dateTo) setDateTo(newFilters.dateTo)
    if (newFilters.selectedBarcelonaTimeline !== selectedBarcelonaTimeline) setSelectedBarcelonaTimeline(newFilters.selectedBarcelonaTimeline)
    if (newFilters.selectedIntake !== selectedIntake) setSelectedIntake(newFilters.selectedIntake)
    if (newFilters.includeArchived !== includeArchived) setIncludeArchived(newFilters.includeArchived)
    if (newFilters.contactActivityFilter !== contactActivityFilter) setContactActivityFilter(newFilters.contactActivityFilter)
    setCurrentPage(1)
  }
  const [isMobile, setIsMobile] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const columnMenuRef = useRef<HTMLDivElement | null>(null)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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

  // Find the highest priority lead to call next
  const findPriorityLead = useCallback(() => {
    // Filter for leads that are not contacted, contacted but not recently, or need follow-up
    const eligibleLeads = allLeads.filter(lead => {
      const status = lead.contact_status
      // Skip converted, unqualified, not interested, wrong number
      if (["converted", "unqualified", "notinterested", "wrongnumber", "archived"].includes(status)) return false
      return true
    })

    // Sort by priority: intake timeline (sooner first), then lead_score (higher first)
    const sorted = [...eligibleLeads].sort((a, b) => {
      // First by intake timeline (6 months > 12 months > null)
      const aTimeline = a.barcelona_timeline || 99
      const bTimeline = b.barcelona_timeline || 99
      if (aTimeline !== bTimeline) return aTimeline - bTimeline

      // Then by lead_score (higher is better)
      const aScore = a.lead_score || 0
      const bScore = b.lead_score || 0
      if (bScore !== aScore) return bScore - aScore

      // Then by not contacted first
      if (a.contact_status === "not_contacted" && b.contact_status !== "not_contacted") return -1
      if (b.contact_status === "not_contacted" && a.contact_status !== "not_contacted") return 1

      return 0
    })

    if (sorted.length > 0) {
      const topLead = sorted[0]
      // Clear filters and navigate to the lead
      setSelectedCountry("all")
      setSelectedStatus("all")
      setSearchQuery("")
      setCurrentPage(1)
      // View the lead
      if (onViewLead) onViewLead(topLead)
    }
  }, [allLeads, onViewLead])

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
      case "notinterested":
        return "bg-orange-100 text-orange-800"
      case "wrongnumber":
        return "bg-gray-200 text-gray-600"
      case "archived":
        return "bg-slate-200 text-slate-600"
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
      high: "high",
      medium: "medium",
      low: "low",
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

    onViewLead?.(lead)
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
      case "notes":
        return (
          <div className="max-w-xs truncate" title={lead.notes || ""}>
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
          <span className={"px-3 py-1 rounded-full text-xs font-semibold " + (lead.is_duplicate ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800")}>
            {lead.is_duplicate ? "Duplicate" : "Original"}
          </span>
        )
      case "recruit_priority":
        if (!lead.recruit_priority) return <span className="text-gray-400">-</span>
        return (
          <span className="text-yellow-400" title={`Priority: ${lead.recruit_priority}/5`}>
            {"⭐".repeat(lead.recruit_priority)}
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
      <AdvancedFilters
        filters={filterState}
        onFiltersChange={handleFiltersChange}
        countries={countries}
        intakes={intakes}
        statusOptions={CONTACT_STATUSES.map(s => ({ value: s.value, label: t(`recruiter.statuses.${s.label}`) }))}
      />

      {/* Priority Lead Finder Button */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
        <button
          type="button"
          onClick={findPriorityLead}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:from-green-700 hover:to-emerald-700 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Find Priority Lead to Call
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Finds the best lead based on intake timeline and lead score</p>
      </div>

      {/* Table Controls Row */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex flex-wrap items-center gap-4">
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

        {/* Mobile Card View */}
        {isMobile ? (
          <div className="p-4 space-y-4">
            {leads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t("recruiter.table.noResults")}</div>
            ) : (
              leads.map((lead) => (
                <MobileLeadCard
                  key={lead.id}
                  lead={lead}
                  isSelected={selectedLeads.has(lead.id)}
                  onSelect={(leadId, selected) => handleSelectLead(leadId, selected)}
                  onView={(lead) => onViewLead?.(lead)}
                  onWhatsApp={(lead) => onWhatsAppClick?.(lead)}
                  onLogContact={(lead) => onLogContactClick?.(lead)}
                  isHighlighted={highlightedLeadId === lead.id}
                />
              ))
            )}
          </div>
        ) : (
          /* Desktop Table View */
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
                            onViewLead?.(lead)
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
        )}
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
