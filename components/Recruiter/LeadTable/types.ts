/**
 * LeadTable Types
 */

export interface Lead {
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
  recruit_priority: number | null
  duplicate_of: string | null
  duplicate_detected_at: string | null
  recency_score: number | null
  lead_score: number | null
  lead_quality: string | null
  funnel_stage?: number
  funnel_data?: any
}

export interface LeadTableProps {
  onLeadsChange?: (leads: Lead[]) => void
  onEditLead?: (lead: Lead) => void
  onViewLead?: (lead: Lead) => void
  onSelectionChange?: (selectedIds: string[]) => void
  onWhatsAppClick?: (lead: Lead) => void
  onMessageHistoryClick?: (lead: Lead) => void
  onLogContactClick?: (lead: Lead) => void
  highlightedLeadId?: string | null
}

export type SortColumn =
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

export type SortDirection = "asc" | "desc" | null

export type ColumnKey =
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

export interface ColumnDefinition {
  key: ColumnKey
  labelKey: string
  sortable?: SortColumn
}

export const COLUMN_DEFINITIONS: ColumnDefinition[] = [
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

export const CONTACT_STATUSES = [
  { value: "all", label: "all" },
  { value: "not_contacted", label: "not_contacted" },
  { value: "referral", label: "referral" },
  { value: "contacted", label: "contacted" },
  { value: "unqualified", label: "unqualified" },
  { value: "notinterested", label: "notinterested" },
  { value: "wrongnumber", label: "wrongnumber" },
]

export const DEFAULT_COLUMN_VISIBILITY: Record<ColumnKey, boolean> = COLUMN_DEFINITIONS.reduce(
  (acc, column) => ({ ...acc, [column.key]: true }),
  {} as Record<ColumnKey, boolean>
)

export const COLUMN_VISIBILITY_STORAGE_KEY = "recruiter-lead-table-columns"
