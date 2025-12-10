/**
 * Service Layer Types
 * 
 * Shared types for all service operations
 */

// Generic service result wrapper
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

// Pagination types
export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  filtered: number
  limit: number
  offset: number
  hasMore: boolean
}

// Lead types
export interface LeadFilters {
  country?: string
  contactStatus?: string
  search?: string
  includeArchived?: boolean
  funnelStage?: number
  leadQuality?: string
  dateFrom?: string
  dateTo?: string
}

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
  student_user_id?: string | null
  converted_at?: string | null
  conversion_source?: string | null
}

export interface LeadUpdate {
  contact_status?: string
  notes?: string
  last_contact_date?: string
  funnel_stage?: number
  lead_quality?: string
  recruit_priority?: number
  intake?: string
  barcelona_timeline?: number
}

// Conversion types
export interface ConversionRequest {
  leadId: string
  intakePeriod?: string
  readinessComments?: string
}

export interface ConversionResult {
  studentUserId: string
  alreadyExisted: boolean
  message: string
}

// Contact history types
export interface ContactLogEntry {
  leadId: string
  contactType: 'phone' | 'whatsapp' | 'email' | 'in_person' | 'system'
  outcome: string
  notes?: string
  followUpAction?: string
  followUpDate?: string
  readyToProceed?: boolean
  interested?: boolean
  hasEducationDocs?: boolean
  hasFunds?: boolean
}
