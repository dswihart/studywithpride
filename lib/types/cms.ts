// CMS Content Types for Headless CMS Integration (Story 2.2-A)

export interface Testimonial {
  id: string
  name: string
  country: string
  countryCode: string
  program: string
  university: string
  year: number
  content: string
  contentEs: string
  imageUrl?: string
  approved: boolean
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedAt?: string
}

export interface FinancialRequirement {
  id: string
  category: string
  categoryEs: string
  amount: number
  currency: string
  description: string
  descriptionEs: string
  isMonthly: boolean
  updatedAt: string
}

export interface VisaRequirementOverride {
  countryCode: string
  field: string
  value: any
  updatedAt: string
  updatedBy: string
}

// API Response Types
export interface CMSResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface ContentApprovalRequest {
  contentType: 'testimonial' | 'financial' | 'visa'
  contentId: string
  action: 'approve' | 'reject'
  approverToken: string
}

export type CMSRole = 'public' | 'content-approver' | 'admin'

export interface CMSAuthToken {
  role: CMSRole
  permissions: string[]
  expiresAt?: string
}
