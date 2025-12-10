/**
 * LeadTable Component - Re-export for backwards compatibility
 * 
 * The component has been split into multiple files:
 * - LeadTable/types.ts - Type definitions and constants
 * - LeadTable/useLeadTable.ts - Data management hook
 * - LeadTable/LeadTableFilters.tsx - Filter controls
 * - LeadTable/LeadTableHeader.tsx - Table header with sorting and column menu
 * - LeadTable/LeadTableRow.tsx - Individual row rendering
 * - LeadTable/LeadTablePagination.tsx - Pagination controls
 * - LeadTable/index.tsx - Main orchestrator component
 */
export { default, LeadTable } from "./LeadTable/index"
export type { Lead, LeadTableProps } from "./LeadTable/types"
