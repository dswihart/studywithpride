/**
 * UserManagementPanel Types
 */

export interface UserAccount {
  id: string
  email: string
  full_name: string | null
  country_of_origin: string | null
  phone_number: string | null
  crm_lead_id: string | null
  created_at: string
  role: string
  has_profile: boolean
  lead_prospect_name?: string
  lead_country?: string
  lead_converted_at?: string
  lead_conversion_source?: string
  intake_term?: string
}

export interface UserManagementPanelProps {
  onOpenLead?: (leadId: string) => void
}

export interface EditFormState {
  full_name: string
  email: string
  phone_number: string
  country_of_origin: string
  role: string
}

export type SortField = "created_at" | "full_name" | "country" | "role"
export type SortDirection = "asc" | "desc"

export const COUNTRIES = [
  "Dominican Republic",
  "Colombia",
  "Venezuela",
  "Mexico",
  "Brazil",
  "Argentina",
  "Chile",
  "Peru",
  "Ecuador",
  "Spain",
  "United States",
  "Nigeria",
  "Other",
]

export const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "student", label: "Student" },
  { value: "recruiter", label: "Recruiter" },
  { value: "admin", label: "Admin" },
]

export const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "crm_conversion", label: "CRM Conversion" },
  { value: "manual", label: "Manual Registration" },
]
