/**
 * TemplatesLibrary Types
 */

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  display_order: number
}

export interface Template {
  id: string
  category_id: string
  name: string
  description: string
  file_type: string
  file_url: string
  file_size: number
  content: string
  version: string
  visibility: string
  created_at: string
  updated_at: string
  template_categories?: { name: string; icon: string }
}

export interface QuickMessage {
  id: string
  category_id: string
  title: string
  content: string
  created_at: string
  template_categories?: { name: string; icon: string }
}

export interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
}

export interface PortalStudent {
  id: string
  email: string
  full_name: string | null
  country_of_origin: string | null
  phone_number: string | null
  crm_lead_id: string | null
  role: string
}

export interface TemplatesLibraryProps {
  isAdmin?: boolean
  selectedLead?: Lead | null
  onSendComplete?: () => void
  fullWidth?: boolean
}

export type SendableItem = Template | QuickMessage
export type ItemType = "template" | "message"
export type ActiveTab = "templates" | "messages"
