/**
 * Database Types for Study With Pride (Story 4.2)
 * 
 * TypeScript interfaces matching the PostgreSQL schema
 * Provides type safety for database operations
 */

// ============================================
// User Profile Types
// ============================================

export interface UserProfile {
  id: string // UUID from auth.users
  email: string
  full_name: string | null
  country_of_origin: string | null
  preferred_language: string
  phone_number: string | null
  created_at: string
  updated_at: string
}

export type UserProfileInsert = Omit<UserProfile, "created_at" | "updated_at">
export type UserProfileUpdate = Partial<Omit<UserProfile, "id" | "email" | "created_at" | "updated_at">>

// ============================================
// Application State Types
// ============================================

export type ApplicationStatus = 
  | "draft"
  | "submitted"
  | "under_review"
  | "accepted"
  | "rejected"
  | "withdrawn"

export type VisaStatus =
  | "not_started"
  | "documents_collecting"
  | "submitted"
  | "interview_scheduled"
  | "approved"
  | "rejected"

export interface ChecklistProgress {
  [key: string]: boolean | string | number
}

export interface DocumentMetadata {
  name: string
  url: string
  uploadedAt: string
  type: string
  size?: number
}

export interface ApplicationState {
  id: string
  user_id: string
  university_name: string | null
  program_name: string | null
  intake_term: string | null
  application_status: ApplicationStatus
  visa_status: VisaStatus
  checklist_progress: ChecklistProgress
  documents_uploaded: DocumentMetadata[]
  application_submitted_at: string | null
  visa_submitted_at: string | null
  expected_decision_date: string | null
  actual_decision_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ApplicationStateInsert = Omit<ApplicationState, "id" | "created_at" | "updated_at">
export type ApplicationStateUpdate = Partial<Omit<ApplicationState, "id" | "user_id" | "created_at" | "updated_at">>

// ============================================
// Saved Content Types
// ============================================

export type ContentType = 
  | "course"
  | "article"
  | "university"
  | "partner"
  | "resource"

export interface SavedContent {
  id: string
  user_id: string
  content_type: ContentType
  content_id: string
  title: string | null
  url: string | null
  notes: string | null
  tags: string[] | null
  saved_at: string
  last_viewed_at: string | null
}

export type SavedContentInsert = Omit<SavedContent, "id" | "saved_at" | "last_viewed_at">
export type SavedContentUpdate = Partial<Omit<SavedContent, "id" | "user_id" | "content_type" | "content_id" | "saved_at">>

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================
// Database Error Types
// ============================================

export interface DatabaseError {
  code: string
  message: string
  details?: string
}
