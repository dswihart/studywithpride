"use client"

import { useLanguage } from "@/components/LanguageContext"
import { CONTACT_STATUSES } from "./types"

interface LeadTableFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCountry: string
  onCountryChange: (country: string) => void
  countries: string[]
  selectedStatus: string
  onStatusChange: (status: string) => void
  dateFrom: string
  onDateFromChange: (date: string) => void
  dateTo: string
  onDateToChange: (date: string) => void
  selectedBarcelonaTimeline: string
  onBarcelonaTimelineChange: (timeline: string) => void
  selectedIntake: string
  onIntakeChange: (intake: string) => void
  intakes: string[]
  includeArchived: boolean
  onIncludeArchivedChange: (include: boolean) => void
}

// Clear filters icon
const ClearIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export function LeadTableFilters({
  searchQuery,
  onSearchChange,
  selectedCountry,
  onCountryChange,
  countries,
  selectedStatus,
  onStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  selectedBarcelonaTimeline,
  onBarcelonaTimelineChange,
  selectedIntake,
  onIntakeChange,
  intakes,
  includeArchived,
  onIncludeArchivedChange,
}: LeadTableFiltersProps) {
  const { t } = useLanguage()

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCountry !== "all" ||
    selectedStatus !== "all" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    selectedBarcelonaTimeline !== "all" ||
    selectedIntake !== "all" ||
    includeArchived

  // Clear all filters
  const handleClearAllFilters = () => {
    onSearchChange("")
    onCountryChange("all")
    onStatusChange("all")
    onDateFromChange("")
    onDateToChange("")
    onBarcelonaTimelineChange("all")
    onIntakeChange("all")
    onIncludeArchivedChange(false)
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4 lg:p-6">
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="search-input">
              Search Leads
            </label>
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors focus:ring-2 focus:ring-gray-400 focus:outline-none"
                aria-label="Clear all filters"
              >
                <ClearIcon />
                <span>Clear all filters</span>
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 pl-10 text-gray-900 dark:text-white placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <label className="mt-2 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => onIncludeArchivedChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Include archived leads</span>
          </label>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor="country-filter">
              Country
            </label>
            <select
              id="country-filter"
              value={selectedCountry}
              onChange={(e) => onCountryChange(e.target.value)}
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
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {CONTACT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {t("recruiter.statuses." + status.label)}
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
              onChange={(e) => onDateFromChange(e.target.value)}
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
              onChange={(e) => onDateToChange(e.target.value)}
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
              onChange={(e) => onBarcelonaTimelineChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="24">24+ months</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300" htmlFor="intake-filter">
              Intake
            </label>
            <select
              id="intake-filter"
              value={selectedIntake}
              onChange={(e) => onIntakeChange(e.target.value)}
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

        {/* Active filters indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400" aria-live="polite">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters active</span>
          </div>
        )}
      </div>
    </div>
  )
}
