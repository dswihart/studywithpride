"use client"

import { useState, useCallback } from "react"
import { useLanguage } from "@/components/LanguageContext"
import { useResponsiveColumns } from "@/hooks/useResponsiveColumns"
import BulkEditLeadModal from "../BulkEditLeadModal"
import MobileLeadCard from "../MobileLeadCard"
import ExpandedRowDetails from "../ExpandedRowDetails"
import HiddenColumnsIndicator from "../HiddenColumnsIndicator"

import { Lead, LeadTableProps, ColumnKey } from "./types"
import { useLeadTable } from "./useLeadTable"
import { LeadTableFilters } from "./LeadTableFilters"
import { LeadTableControls } from "./LeadTableControls"
import { LeadTableHeader } from "./LeadTableHeader"
import { LeadTableRow } from "./LeadTableRow"
import { LeadTablePagination } from "./LeadTablePagination"

export default function LeadTable({
  onLeadsChange,
  onEditLead,
  onViewLead,
  onSelectionChange,
  onWhatsAppClick,
  onMessageHistoryClick,
  onLogContactClick,
  highlightedLeadId,
}: LeadTableProps) {
  const { t } = useLanguage()

  // Date formatter utility
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("recruiter.table.na")
    try {
      const date = new Date(dateString)
      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return t("recruiter.table.na")
    }
  }

  // Lead data hook
  const {
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
  } = useLeadTable({
    onLeadsChange,
    onSelectionChange,
    highlightedLeadId,
  })

  // UI State
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)

  // Responsive columns
  const { breakpoint, visibleColumns, hiddenColumns, isMobile, isTablet, mounted } = useResponsiveColumns(
    columnVisibility as Record<string, boolean>
  )

  // Get visible table columns filtered by user visibility
  const getVisibleTableColumns = () => {
    return visibleColumns.filter((col) => columnVisibility[col.key as ColumnKey] !== false)
  }

  const tableVisibleColumns = getVisibleTableColumns()

  // Handlers
  const handleRowClick = useCallback(
    (lead: Lead, event: React.MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('input[type="checkbox"]')) return

      if (isTablet && hiddenColumns.length > 0) {
        setExpandedRowId(expandedRowId === lead.id ? null : lead.id)
        return
      }

      onViewLead?.(lead)
    },
    [isTablet, hiddenColumns.length, expandedRowId, onViewLead]
  )

  const handleBulkEditSuccess = () => {
    fetchLeads()
    setShowBulkEditModal(false)
  }

  // Loading state
  if (loading && leads.length === 0) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-800 p-8 text-center shadow-md">
        <div className="text-lg text-gray-600 dark:text-gray-400">{t("recruiter.table.loading")}</div>
      </div>
    )
  }

  // Mobile view
  if (mounted && isMobile) {
    return (
      <div className="space-y-4">
        <LeadTableFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          countries={countries}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          selectedBarcelonaTimeline={selectedBarcelonaTimeline}
          onBarcelonaTimelineChange={setSelectedBarcelonaTimeline}
          selectedIntake={selectedIntake}
          onIntakeChange={setSelectedIntake}
          intakes={intakes}
          includeArchived={includeArchived}
          onIncludeArchivedChange={setIncludeArchived}
        />
        <div className="space-y-3">
          {leads.map((lead) => (
            <MobileLeadCard
              key={lead.id}
              lead={lead}
              isSelected={selectedLeads.has(lead.id)}
              onSelect={(id, selected) => handleSelectLead(id, selected)}
              onView={() => onViewLead?.(lead)}
              onEdit={() => onEditLead?.(lead)}
              onWhatsApp={() => onWhatsAppClick?.(lead)}
              onLogContact={() => onLogContactClick?.(lead)}
            />
          ))}
        </div>
        <LeadTablePagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalFilteredCount}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    )
  }

  const allSelected = leads.length > 0 && selectedLeads.size === leads.length
  const someSelected = selectedLeads.size > 0 && selectedLeads.size < leads.length

  return (
    <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md">
      {/* Filters */}
      <LeadTableFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        countries={countries}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        selectedBarcelonaTimeline={selectedBarcelonaTimeline}
        onBarcelonaTimelineChange={setSelectedBarcelonaTimeline}
        selectedIntake={selectedIntake}
        onIntakeChange={setSelectedIntake}
        intakes={intakes}
        includeArchived={includeArchived}
        onIncludeArchivedChange={setIncludeArchived}
      />

      {/* Hidden columns indicator */}
      {hiddenColumns.length > 0 && (
        <HiddenColumnsIndicator hiddenColumns={hiddenColumns} breakpoint={breakpoint} />
      )}

      {/* Table Controls */}
      <LeadTableControls
        columnVisibility={columnVisibility}
        selectedCount={selectedLeads.size}
        totalLeads={allLeads.length}
        selectAllPages={selectAllPages}
        onSelectAllPages={handleSelectAllPages}
        onToggleColumn={toggleColumnVisibility}
        onBulkEdit={() => setShowBulkEditModal(true)}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 text-center text-red-600 dark:text-red-400">{error}</div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <LeadTableHeader
            visibleColumns={tableVisibleColumns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            allSelected={allSelected}
            someSelected={someSelected}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
          />
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {leads.length === 0 ? (
              <tr>
                <td
                  colSpan={tableVisibleColumns.length + 2}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {t("recruiter.table.noResults")}
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <>
                  <LeadTableRow
                    key={lead.id}
                    lead={lead}
                    isSelected={selectedLeads.has(lead.id)}
                    isExpanded={expandedRowId === lead.id}
                    isHighlighted={highlightedLeadId === lead.id}
                    isTablet={isTablet}
                    visibleColumnKeys={tableVisibleColumns.map((c) => c.key)}
                    onSelect={(checked) => handleSelectLead(lead.id, checked)}
                    onRowClick={(e) => handleRowClick(lead, e)}
                    onView={() => onViewLead?.(lead)}
                    onEdit={() => onEditLead?.(lead)}
                    onWhatsApp={() => onWhatsAppClick?.(lead)}
                    onMessageHistory={() => onMessageHistoryClick?.(lead)}
                    onLogContact={() => onLogContactClick?.(lead)}
                  />
                  {isTablet && expandedRowId === lead.id && hiddenColumns.length > 0 && (
                    <tr key={`${lead.id}-expanded`}>
                      <td colSpan={tableVisibleColumns.length + 2}>
                        <ExpandedRowDetails lead={lead} hiddenColumns={hiddenColumns} formatDate={formatDate} />
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <LeadTablePagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalFilteredCount}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Bulk Edit Modal */}
      <BulkEditLeadModal
        isOpen={showBulkEditModal}
        selectedLeadIds={Array.from(selectedLeads)}
        onClose={() => setShowBulkEditModal(false)}
        onSuccess={handleBulkEditSuccess}
      />
    </div>
  )
}

// Re-export for backwards compatibility
export { LeadTable }
export type { Lead, LeadTableProps }
