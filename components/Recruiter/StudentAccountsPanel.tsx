/**
 * Student Portal Accounts Admin Panel
 * Lists all converted leads/student accounts with filtering
 */

"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/LanguageContext"
import {
  AcademicCapIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  UserCircleIcon,
  CalendarIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline"

interface StudentAccount {
  id: string
  email: string
  full_name: string | null
  country_of_origin: string | null
  phone_number: string | null
  crm_lead_id: string | null
  created_at: string
  // From leads table (joined)
  lead_prospect_name?: string
  lead_country?: string
  lead_converted_at?: string
  lead_conversion_source?: string
  intake_term?: string
}

interface StudentAccountsPanelProps {
  onOpenLead?: (leadId: string) => void
}

const COUNTRIES = [
  "Dominican Republic",
  "Colombia",
  "Venezuela",
  "Mexico",
  "Brazil",
  "Argentina",
  "Chile",
  "Peru",
  "Ecuador",
  "Other",
]

const INTAKE_OPTIONS = [
  { value: "", label: "All Intakes" },
  { value: "february", label: "February" },
  { value: "may", label: "May" },
  { value: "october", label: "October" },
]

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "crm_conversion", label: "CRM Conversion" },
  { value: "manual", label: "Manual Registration" },
]

export default function StudentAccountsPanel({ onOpenLead }: StudentAccountsPanelProps) {
  const { t } = useLanguage()
  const [students, setStudents] = useState<StudentAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [countryFilter, setCountryFilter] = useState("")
  const [intakeFilter, setIntakeFilter] = useState("")
  const [sourceFilter, setSourceFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Sorting
  const [sortBy, setSortBy] = useState<"created_at" | "full_name" | "country">("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/recruiter/student-accounts")
      const result = await response.json()

      if (result.success) {
        setStudents(result.data || [])
      } else {
        setError(result.error || "Failed to fetch student accounts")
      }
    } catch (err) {
      setError("Failed to load student accounts")
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort students
  const filteredStudents = students
    .filter((student) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesName = student.full_name?.toLowerCase().includes(search)
        const matchesEmail = student.email?.toLowerCase().includes(search)
        const matchesLeadName = student.lead_prospect_name?.toLowerCase().includes(search)
        if (!matchesName && !matchesEmail && !matchesLeadName) return false
      }

      // Country filter
      if (countryFilter) {
        const studentCountry = student.country_of_origin || student.lead_country || ""
        if (!studentCountry.toLowerCase().includes(countryFilter.toLowerCase())) return false
      }

      // Intake filter
      if (intakeFilter && student.intake_term !== intakeFilter) return false

      // Source filter
      if (sourceFilter) {
        const isCrmConversion = student.crm_lead_id !== null
        if (sourceFilter === "crm_conversion" && !isCrmConversion) return false
        if (sourceFilter === "manual" && isCrmConversion) return false
      }

      // Date range filter
      if (dateFrom) {
        const createdDate = new Date(student.created_at)
        const fromDate = new Date(dateFrom)
        if (createdDate < fromDate) return false
      }
      if (dateTo) {
        const createdDate = new Date(student.created_at)
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (createdDate > toDate) return false
      }

      return true
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === "created_at") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortBy === "full_name") {
        comparison = (a.full_name || "").localeCompare(b.full_name || "")
      } else if (sortBy === "country") {
        comparison = (a.country_of_origin || "").localeCompare(b.country_of_origin || "")
      }
      return sortDir === "desc" ? -comparison : comparison
    })

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDir("desc")
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getSourceBadge = (student: StudentAccount) => {
    if (student.crm_lead_id) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          CRM
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        Manual
      </span>
    )
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCountryFilter("")
    setIntakeFilter("")
    setSourceFilter("")
    setDateFrom("")
    setDateTo("")
  }

  const activeFilterCount = [
    searchTerm,
    countryFilter,
    intakeFilter,
    sourceFilter,
    dateFrom,
    dateTo,
  ].filter(Boolean).length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Student Portal Accounts</h2>
              <p className="text-purple-100 text-sm">
                {filteredStudents.length} of {students.length} accounts
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showFilters || activeFilterCount > 0
                ? "bg-white text-purple-600"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-600 text-white text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-200" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Country
              </label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Countries</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Intake
              </label>
              <select
                value={intakeFilter}
                onChange={(e) => setIntakeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {INTAKE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Source
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading student accounts...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center">
          <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {students.length === 0
              ? "No student accounts found"
              : "No accounts match the current filters"}
          </p>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort("full_name")}
                >
                  <div className="flex items-center gap-1">
                    Student
                    {sortBy === "full_name" && (
                      <span className="text-purple-600">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort("country")}
                >
                  <div className="flex items-center gap-1">
                    Country
                    {sortBy === "country" && (
                      <span className="text-purple-600">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center gap-1">
                    Created
                    {sortBy === "created_at" && (
                      <span className="text-purple-600">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                        {(student.full_name || student.email || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {student.full_name || "No name"}
                        </div>
                        {student.phone_number && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {student.phone_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{student.email}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {student.country_of_origin || student.lead_country || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">{getSourceBadge(student)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(student.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {student.crm_lead_id && onOpenLead && (
                      <button
                        onClick={() => onOpenLead(student.crm_lead_id!)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        View Lead
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Footer */}
      {!loading && filteredStudents.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Total:</span>{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {filteredStudents.length}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">From CRM:</span>{" "}
                <span className="font-medium text-blue-600">
                  {filteredStudents.filter((s) => s.crm_lead_id).length}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Manual:</span>{" "}
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {filteredStudents.filter((s) => !s.crm_lead_id).length}
                </span>
              </div>
            </div>
            <button
              onClick={fetchStudents}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
