/**
 * Responsive Column Configuration for LeadTable
 * Defines column visibility at different breakpoints
 */

export type ColumnVisibility = "always" | "tablet-up" | "desktop-only" | "hidden"

export interface ColumnConfig {
  key: string
  label: string
  visibility: ColumnVisibility
  minWidth: number
  priority: number // Higher = more important, less likely to be hidden
  truncate?: boolean
  maxWidth?: number
  sortable?: boolean
}

// Column definitions with responsive behavior
export const LEAD_COLUMN_DEFINITIONS: ColumnConfig[] = [
  // Always visible - critical info
  { key: "prospect_name", label: "Name", visibility: "always", minWidth: 150, priority: 10, truncate: true, maxWidth: 200, sortable: true },
  { key: "contact_status", label: "Status", visibility: "always", minWidth: 100, priority: 9, sortable: true },

  // Visible on tablet and up
  { key: "phone", label: "Phone", visibility: "tablet-up", minWidth: 120, priority: 8, sortable: true },
  { key: "country", label: "Country", visibility: "tablet-up", minWidth: 100, priority: 7, sortable: true },
  { key: "last_contact_date", label: "Last Contact", visibility: "tablet-up", minWidth: 130, priority: 6, sortable: true },

  // Desktop only - lower priority info
  { key: "prospect_email", label: "Email", visibility: "desktop-only", minWidth: 180, priority: 5, truncate: true, maxWidth: 220, sortable: true },
  { key: "referral_source", label: "Source", visibility: "desktop-only", minWidth: 120, priority: 4, sortable: true },
  { key: "lead_quality", label: "Quality", visibility: "desktop-only", minWidth: 90, priority: 4, sortable: true },
  { key: "date_added", label: "Date Added", visibility: "desktop-only", minWidth: 130, priority: 3, sortable: true },
  { key: "notes", label: "Notes", visibility: "desktop-only", minWidth: 150, priority: 2, truncate: true, maxWidth: 200 },
  { key: "is_duplicate", label: "Duplicate", visibility: "desktop-only", minWidth: 90, priority: 1, sortable: true },
  { key: "barcelona_timeline", label: "Timeline", visibility: "desktop-only", minWidth: 100, priority: 1, sortable: true },
  { key: "intake", label: "Intake", visibility: "desktop-only", minWidth: 100, priority: 1, sortable: true },
  { key: "created_time", label: "Created", visibility: "desktop-only", minWidth: 130, priority: 1, sortable: true },
]

export type Breakpoint = "mobile" | "tablet" | "desktop"

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const

/**
 * Get visible columns for a given breakpoint
 */
export function getVisibleColumns(breakpoint: Breakpoint, userVisibility?: Record<string, boolean>): ColumnConfig[] {
  return LEAD_COLUMN_DEFINITIONS.filter(col => {
    // Check user visibility override first
    if (userVisibility && userVisibility[col.key] === false) {
      return false
    }

    // Check breakpoint visibility
    switch (col.visibility) {
      case "always":
        return true
      case "tablet-up":
        return breakpoint === "tablet" || breakpoint === "desktop"
      case "desktop-only":
        return breakpoint === "desktop"
      case "hidden":
        return false
      default:
        return true
    }
  })
}

/**
 * Get hidden columns for a given breakpoint (for showing in expand panel)
 */
export function getHiddenColumns(breakpoint: Breakpoint, userVisibility?: Record<string, boolean>): ColumnConfig[] {
  return LEAD_COLUMN_DEFINITIONS.filter(col => {
    // If user explicitly hid it, don't count as "hidden by breakpoint"
    if (userVisibility && userVisibility[col.key] === false) {
      return false
    }

    // Check if hidden by breakpoint
    switch (col.visibility) {
      case "always":
        return false
      case "tablet-up":
        return breakpoint === "mobile"
      case "desktop-only":
        return breakpoint === "mobile" || breakpoint === "tablet"
      case "hidden":
        return false // Don't show hidden columns in expand panel
      default:
        return false
    }
  })
}

/**
 * Get column label for display
 */
export function getColumnLabel(key: string): string {
  const col = LEAD_COLUMN_DEFINITIONS.find(c => c.key === key)
  return col?.label || key
}
