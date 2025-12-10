/**
 * useLeadTable Hook
 *
 * Manages lead data fetching, filtering, sorting, and pagination
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import {
  Lead,
  SortColumn,
  SortDirection,
  ColumnKey,
  DEFAULT_COLUMN_VISIBILITY,
  COLUMN_VISIBILITY_STORAGE_KEY,
} from "./types"

interface UseLeadTableProps {
  onLeadsChange?: (leads: Lead[]) => void
  onSelectionChange?: (selectedIds: string[]) => void
  highlightedLeadId?: string | null
}

interface UseLeadTableReturn {
  // Data
  leads: Lead[]
  allLeads: Lead[]
  countries: string[]
  intakes: string[]

  // Loading/Error
  loading: boolean
  error: string

  // Filters
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCountry: string
  setSelectedCountry: (country: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  dateFrom: string
  setDateFrom: (date: string) => void
  dateTo: string
  setDateTo: (date: string) => void
  selectedBarcelonaTimeline: string
  setSelectedBarcelonaTimeline: (timeline: string) => void
  selectedIntake: string
  setSelectedIntake: (intake: string) => void
  includeArchived: boolean
  setIncludeArchived: (include: boolean) => void

  // Sorting
  sortColumn: SortColumn
  sortDirection: SortDirection
  handleSort: (column: SortColumn) => void

  // Pagination
  currentPage: number
  setCurrentPage: (page: number) => void
  itemsPerPage: number
  setItemsPerPage: (items: number) => void
  totalFilteredCount: number

  // Selection
  selectedLeads: Set<string>
  selectAllPages: boolean
  handleSelectAll: (checked: boolean) => void
  handleSelectAllPages: () => void
  handleSelectLead: (leadId: string, checked: boolean) => void

  // Column visibility
  columnVisibility: Record<ColumnKey, boolean>
  toggleColumnVisibility: (key: ColumnKey) => void

  // Actions
  fetchLeads: () => Promise<void>
}

export function useLeadTable({
  onLeadsChange,
  onSelectionChange,
  highlightedLeadId,
}: UseLeadTableProps): UseLeadTableReturn {
  // Data state
  const [leads, setLeads] = useState<Lead[]>([])
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [intakes, setIntakes] = useState<string[]>([])

  // Loading/Error state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedBarcelonaTimeline, setSelectedBarcelonaTimeline] = useState("all")
  const [selectedIntake, setSelectedIntake] = useState("all")
  const [includeArchived, setIncludeArchived] = useState(false)

  // Sort state
  const [sortColumn, setSortColumn] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)

  // Selection state
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [selectAllPages, setSelectAllPages] = useState(false)

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKey, boolean>>(DEFAULT_COLUMN_VISIBILITY)

  // Refs for callbacks
  const onLeadsChangeRef = useRef(onLeadsChange)
  const onSelectionChangeRef = useRef(onSelectionChange)

  useEffect(() => {
    onLeadsChangeRef.current = onLeadsChange
    onSelectionChangeRef.current = onSelectionChange
  }, [onLeadsChange, onSelectionChange])

  // Load column visibility from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      setColumnVisibility((prev) => ({ ...prev, ...parsed }))
    } catch {
      // Ignore
    }
  }, [])

  // Save column visibility to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(columnVisibility))
  }, [columnVisibility])

  // Notify selection changes
  useEffect(() => {
    onSelectionChangeRef.current?.(Array.from(selectedLeads))
  }, [selectedLeads])

  // Auto-clear filters for highlighted lead
  useEffect(() => {
    if (!highlightedLeadId) return
    const hasActiveFilters =
      selectedCountry !== "all" ||
      selectedStatus !== "all" ||
      dateFrom !== "" ||
      dateTo !== "" ||
      selectedBarcelonaTimeline !== "all" ||
      selectedIntake !== "all"

    if (hasActiveFilters && allLeads.some((l) => l.id === highlightedLeadId)) {
      setSelectedCountry("all")
      setSelectedStatus("all")
      setDateFrom("")
      setDateTo("")
      setSelectedBarcelonaTimeline("all")
      setSelectedIntake("all")
    }
  }, [highlightedLeadId, allLeads, selectedCountry, selectedStatus, dateFrom, dateTo, selectedBarcelonaTimeline, selectedIntake])

  // Fetch leads
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
        setError(result.error || "Failed to load leads")
        setLeads([])
        return
      }

      const fetchedLeads: Lead[] = result.data?.leads || []
      setAllLeads(fetchedLeads)
      setCurrentPage(1)
      setSelectedLeads(new Set())
      setSelectAllPages(false)

      setCountries(Array.from(new Set(fetchedLeads.map((l) => l.country))).sort())
      setIntakes(
        Array.from(
          new Set(fetchedLeads.map((l) => l.intake).filter((i): i is string => !!i))
        ).sort()
      )

      onLeadsChangeRef.current?.(fetchedLeads)
    } catch {
      setError("Failed to load leads")
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [selectedCountry, selectedStatus, includeArchived])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Filter leads
  const getFilteredLeads = useCallback(
    (leadsToFilter: Lead[]) => {
      let filtered = leadsToFilter

      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim()
        const normalizedQuery = query.replace(/[\s\-\(\)]/g, "")
        filtered = filtered.filter((lead) => {
          const name = (lead.prospect_name || "").toLowerCase()
          const email = (lead.prospect_email || "").toLowerCase()
          const phone = (lead.phone || "").toLowerCase()
          const normalizedPhone = phone.replace(/[\s\-\(\)]/g, "")
          return name.includes(query) || email.includes(query) || phone.includes(query) || normalizedPhone.includes(normalizedQuery)
        })
      }

      if (dateFrom || dateTo) {
        filtered = filtered.filter((lead) => {
          const leadDate = lead.date_imported || lead.created_at
          if (!leadDate) return false
          const leadDateObj = new Date(leadDate)
          leadDateObj.setHours(0, 0, 0, 0)

          if (dateFrom && leadDateObj < new Date(dateFrom)) return false
          if (dateTo) {
            const toDate = new Date(dateTo)
            toDate.setHours(23, 59, 59, 999)
            if (leadDateObj > toDate) return false
          }
          return true
        })
      }

      if (selectedBarcelonaTimeline !== "all") {
        const timelineValue = parseInt(selectedBarcelonaTimeline, 10)
        filtered = filtered.filter((lead) => lead.barcelona_timeline === timelineValue)
      }

      if (selectedIntake !== "all") {
        filtered = filtered.filter((lead) => lead.intake === selectedIntake)
      }

      return filtered
    },
    [debouncedSearch, dateFrom, dateTo, selectedBarcelonaTimeline, selectedIntake]
  )

  // Sort leads
  const getSortedLeads = useCallback(
    (leadsToSort: Lead[]) => {
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
          case "lead_quality":
            const qualityOrder: Record<string, number> = { High: 4, Medium: 3, Low: 2, "Very Low": 1 }
            aValue = qualityOrder[a.lead_quality || ""] || 0
            bValue = qualityOrder[b.lead_quality || ""] || 0
            break
          case "date_added":
            aValue = new Date(a.date_imported || a.created_at).getTime()
            bValue = new Date(b.date_imported || b.created_at).getTime()
            break
          case "last_contact_date":
            aValue = a.last_contact_date ? new Date(a.last_contact_date).getTime() : 0
            bValue = b.last_contact_date ? new Date(b.last_contact_date).getTime() : 0
            break
          default:
            aValue = (a as any)[sortColumn] || ""
            bValue = (b as any)[sortColumn] || ""
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    },
    [sortColumn, sortDirection]
  )

  // Apply filters, sorting, pagination
  useEffect(() => {
    const filteredLeads = getFilteredLeads(allLeads)
    const sortedLeads = getSortedLeads(filteredLeads)
    const startIndex = (currentPage - 1) * itemsPerPage
    setLeads(sortedLeads.slice(startIndex, startIndex + itemsPerPage))
  }, [allLeads, currentPage, itemsPerPage, getFilteredLeads, getSortedLeads])

  const totalFilteredCount = getFilteredLeads(allLeads).length

  // Handlers
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortColumn(null)
        setSortDirection(null)
      }
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(leads.map((l) => l.id)))
      setSelectAllPages(false)
    } else {
      setSelectedLeads(new Set())
      setSelectAllPages(false)
    }
  }

  const handleSelectAllPages = () => {
    setSelectedLeads(new Set(allLeads.map((l) => l.id)))
    setSelectAllPages(true)
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

  const toggleColumnVisibility = (key: ColumnKey) => {
    setColumnVisibility((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      if (Object.values(next).some(Boolean)) return next
      return prev
    })
  }

  return {
    leads,
    allLeads,
    countries,
    intakes,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCountry,
    setSelectedCountry,
    selectedStatus,
    setSelectedStatus,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    selectedBarcelonaTimeline,
    setSelectedBarcelonaTimeline,
    selectedIntake,
    setSelectedIntake,
    includeArchived,
    setIncludeArchived,
    sortColumn,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalFilteredCount,
    selectedLeads,
    selectAllPages,
    handleSelectAll,
    handleSelectAllPages,
    handleSelectLead,
    columnVisibility,
    toggleColumnVisibility,
    fetchLeads,
  }
}
