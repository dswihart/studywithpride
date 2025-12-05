/**
 * AdvancedFilters Component
 * Collapsible advanced filter panel with Quick Presets and basic/advanced toggle
 */

"use client"

import { useState } from "react"

interface FilterState {
  searchQuery: string
  selectedCountry: string
  selectedStatus: string
  dateFrom: string
  dateTo: string
  selectedBarcelonaTimeline: string
  selectedIntake: string
  includeArchived: boolean
  contactActivityFilter: string // NEW: "all" | "never_contacted" | "needs_followup" | "recently_contacted" | "new_leads"
}

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  countries: string[]
  intakes: string[]
  statusOptions: { value: string; label: string }[]
}

// Quick Filter Presets - using only reliable timestamp data
const QUICK_PRESETS = [
  {
    id: "starting_soon",
    label: "Starting Soon",
    icon: "🚀",
    description: "6-month timeline - wants to enroll sooner",
    filters: {
      contactActivityFilter: "all",
      selectedBarcelonaTimeline: "6",
      selectedStatus: "all",
    }
  },
  {
    id: "new_leads",
    label: "New Leads",
    icon: "🆕",
    description: "Added this week, not yet contacted",
    filters: {
      contactActivityFilter: "new_leads",
      selectedBarcelonaTimeline: "all",
      selectedStatus: "all",
    }
  },
  {
    id: "needs_followup",
    label: "Needs Follow-up",
    icon: "📞",
    description: "Last contact > 3 days ago",
    filters: {
      contactActivityFilter: "needs_followup",
      selectedBarcelonaTimeline: "all",
      selectedStatus: "all",
    }
  },
  {
    id: "never_contacted",
    label: "Never Contacted",
    icon: "⏳",
    description: "No contact history",
    filters: {
      contactActivityFilter: "never_contacted",
      selectedBarcelonaTimeline: "all",
      selectedStatus: "all",
    }
  }
]

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  countries,
  intakes,
  statusOptions
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const activeAdvancedFilters = [
    filters.dateFrom,
    filters.dateTo,
    filters.selectedBarcelonaTimeline !== "all" ? filters.selectedBarcelonaTimeline : "",
    filters.selectedIntake !== "all" ? filters.selectedIntake : "",
    filters.includeArchived ? "archived" : "",
    filters.contactActivityFilter && filters.contactActivityFilter !== "all" ? filters.contactActivityFilter : ""
  ].filter(Boolean).length

  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    setActivePreset(null) // Clear preset when manually changing filters
    onFiltersChange({ ...filters, [key]: value })
  }

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    if (activePreset === preset.id) {
      // Toggle off - reset to defaults
      setActivePreset(null)
      onFiltersChange({
        ...filters,
        contactActivityFilter: "all",
        selectedBarcelonaTimeline: "all",
        dateFrom: "",
        dateTo: ""
      })
    } else {
      setActivePreset(preset.id)
      onFiltersChange({
        ...filters,
        ...preset.filters,
        dateFrom: "",
        dateTo: ""
      })
    }
  }

  const clearAdvancedFilters = () => {
    setActivePreset(null)
    onFiltersChange({
      ...filters,
      dateFrom: "",
      dateTo: "",
      selectedBarcelonaTimeline: "all",
      selectedIntake: "all",
      includeArchived: false,
      contactActivityFilter: "all"
    })
  }

  const clearAllFilters = () => {
    setActivePreset(null)
    onFiltersChange({
      searchQuery: "",
      selectedCountry: "all",
      selectedStatus: "all",
      dateFrom: "",
      dateTo: "",
      selectedBarcelonaTimeline: "all",
      selectedIntake: "all",
      includeArchived: false,
      contactActivityFilter: "all"
    })
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Quick Preset Buttons - Horizontal scroll on mobile */}
      <div className="px-3 sm:px-6 pt-3 sm:pt-4 pb-3 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Quick Filters</span>
          {/* Clear All button - mobile friendly position */}
          {(activePreset || filters.searchQuery || filters.selectedCountry !== "all" || filters.selectedStatus !== "all" || activeAdvancedFilters > 0) && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear</span>
            </button>
          )}
        </div>
        {/* Horizontal scrollable container on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible scrollbar-hide">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all ${
                activePreset === preset.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              title={preset.description}
            >
              <span className="text-lg sm:text-base">{preset.icon}</span>
              <span className="whitespace-nowrap">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Basic Filters Row */}
      <div className="p-4 sm:p-6 pt-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 sm:flex-[2]">
            <div className="relative">
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => updateFilter("searchQuery", e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 pl-10 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {filters.searchQuery && (
                <button onClick={() => updateFilter("searchQuery", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Status Dropdown */}
          <select
            value={filters.selectedStatus}
            onChange={(e) => updateFilter("selectedStatus", e.target.value)}
            className="w-full sm:w-40 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-gray-900 dark:text-white"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          {/* Country Dropdown */}
          <select
            value={filters.selectedCountry}
            onChange={(e) => updateFilter("selectedCountry", e.target.value)}
            className="w-full sm:w-40 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-gray-900 dark:text-white"
          >
            <option value="all">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          {/* Filters Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition ${
              isExpanded || activeAdvancedFilters > 0
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{isExpanded ? "Less" : "More"} Filters</span>
            {activeAdvancedFilters > 0 && (
              <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-blue-500 text-white rounded-full">
                {activeAdvancedFilters}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Pills */}
        {!isExpanded && activeAdvancedFilters > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Active:</span>
            {filters.contactActivityFilter && filters.contactActivityFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                {QUICK_PRESETS.find(p => p.filters.contactActivityFilter === filters.contactActivityFilter)?.label || filters.contactActivityFilter}
                <button onClick={() => updateFilter("contactActivityFilter", "all")} className="hover:text-blue-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            )}
            {filters.dateFrom && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                From: {filters.dateFrom}
                <button onClick={() => updateFilter("dateFrom", "")} className="hover:text-blue-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            )}
            {filters.dateTo && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                To: {filters.dateTo}
                <button onClick={() => updateFilter("dateTo", "")} className="hover:text-blue-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            )}
            {filters.selectedBarcelonaTimeline !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                Timeline: {filters.selectedBarcelonaTimeline} months
                <button onClick={() => updateFilter("selectedBarcelonaTimeline", "all")} className="hover:text-blue-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            )}
            {filters.selectedIntake !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                Intake: {filters.selectedIntake}
                <button onClick={() => updateFilter("selectedIntake", "all")} className="hover:text-blue-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            )}
            {filters.includeArchived && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                Including archived
                <button onClick={() => updateFilter("includeArchived", false)} className="hover:text-blue-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            )}
            <button onClick={clearAdvancedFilters} className="text-sm text-gray-500 hover:text-gray-700">
              Clear all
            </button>
          </div>
        )}

        {/* Advanced Filters Panel */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced Filters</h3>
              {activeAdvancedFilters > 0 && (
                <button onClick={clearAdvancedFilters} className="text-sm text-blue-600 hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date Added From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date Added To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter("dateTo", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Barcelona Timeline</label>
                <select
                  value={filters.selectedBarcelonaTimeline}
                  onChange={(e) => updateFilter("selectedBarcelonaTimeline", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                >
                  <option value="all">All Timelines</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Intake</label>
                <select
                  value={filters.selectedIntake}
                  onChange={(e) => updateFilter("selectedIntake", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                >
                  <option value="all">All Intakes</option>
                  {intakes.map((intake) => (
                    <option key={intake} value={intake}>{intake}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.includeArchived}
                  onChange={(e) => updateFilter("includeArchived", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Include archived leads</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
