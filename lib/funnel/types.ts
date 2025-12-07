// Funnel Stage Types
export type FunnelStageNumber = 1 | 2 | 3 | 4
export type FunnelStageName = 'contacted' | 'program_confirmed' | 'documents_verified' | 'ready_for_interview'

// Stage 1: Contacted & Interested
export interface Stage1Data {
  contactMethod: 'phone' | 'whatsapp' | 'email' | 'in_person' | null
  interestLevel: 'low' | 'medium' | 'high' | null
  responseDate: string | null
  initialNotes: string | null
  contactAttempts: number
}

// Stage 2: Program Confirmed
export interface Stage2Data {
  programId: string | null
  programName: string | null
  intakeId: string | null
  intakePeriod: string | null
  budgetConfirmed: boolean
  budgetRange: string | null
  timelineDiscussed: boolean
  preferredCampus: string | null
}

// Stage 3: Documents Verified
export interface Stage3Data {
  hasValidPassport: boolean | null
  passportExpiry: string | null
  passportStatus: 'not_started' | 'in_progress' | 'verified' | 'issue'
  educationVerified: boolean | null
  highestDegree: string | null
  transcriptsStatus: 'not_started' | 'in_progress' | 'verified' | 'issue'
  englishTest: string | null
  englishScore: string | null
  englishStatus: 'not_started' | 'in_progress' | 'verified' | 'issue' | 'not_required'
  financialDocsReady: boolean | null
  bankStatementsStatus: 'not_started' | 'in_progress' | 'verified' | 'issue'
  sponsorLetterRequired: boolean
  sponsorLetterStatus: 'not_started' | 'in_progress' | 'verified' | 'issue' | 'not_required'
  readinessScore: number
  verificationNotes: string | null
}

// Stage 4: Ready for Interview
export interface Stage4Data {
  preChecklistComplete: boolean
  informationVerified: boolean
  consentObtained: boolean
  readyToConvert: boolean
}

// Combined Lead Funnel Data
export interface LeadFunnelData {
  leadId: string
  currentStage: FunnelStageNumber
  stages: {
    stage1: Stage1Data | null
    stage2: Stage2Data | null
    stage3: Stage3Data | null
    stage4: Stage4Data | null
  }
  completedStages: FunnelStageNumber[]
  convertedToStudent: boolean
  convertedAt: string | null
  studentId: string | null
  applicationId: string | null
}

// Lead type with funnel data
export interface LeadWithFunnel {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
  country: string
  referral_source: string | null
  contact_status: string
  lead_quality: string | null
  lead_score: number | null
  last_contact_date: string | null
  date_imported: string | null
  created_at: string
  notes: string | null
  is_duplicate: boolean
  barcelona_timeline: number | null
  intake: string | null
  created_time: string | null
  // Funnel specific fields
  funnel_stage: FunnelStageNumber
  funnel_data: LeadFunnelData | null
  converted_to_student: boolean
  converted_at: string | null
  student_id: string | null
  [key: string]: any
}

// Program and Intake types for Stage 2
export interface Program {
  id: string
  name: string
  duration: string
  tuitionFee: number
  description: string | null
}

export interface Intake {
  id: string
  programId: string
  period: string // e.g., "Fall 2025", "Spring 2026"
  startDate: string
  applicationDeadline: string
  spotsAvailable: number
  totalSpots: number
}

// Conversion data
export interface ConversionData {
  leadId: string
  studentEmail: string
  generatePassword: boolean
  sendWelcomeEmail: boolean
  enableDocumentUpload: boolean
  enableInterviewScheduling: boolean
  notes: string | null
}

// Stage completion check
export interface StageCompletionStatus {
  isComplete: boolean
  missingFields: string[]
  completionPercentage: number
}

// Funnel stage info
export interface FunnelStageInfo {
  number: FunnelStageNumber
  name: FunnelStageName
  label: string
  description: string
  color: string
}

export const FUNNEL_STAGES: FunnelStageInfo[] = [
  {
    number: 1,
    name: 'contacted',
    label: 'Contacted & Interested',
    description: 'Lead has been contacted and expressed initial interest',
    color: 'amber'
  },
  {
    number: 2,
    name: 'program_confirmed',
    label: 'Program Confirmed',
    description: 'Lead confirmed interest in a specific program and intake',
    color: 'blue'
  },
  {
    number: 3,
    name: 'documents_verified',
    label: 'Documents Verified',
    description: 'Lead has verified they have required documents',
    color: 'purple'
  },
  {
    number: 4,
    name: 'ready_for_interview',
    label: 'Ready for Interview',
    description: 'Lead is ready to be converted to student',
    color: 'green'
  }
]

// Default stage data
export const DEFAULT_STAGE1_DATA: Stage1Data = {
  contactMethod: null,
  interestLevel: null,
  responseDate: null,
  initialNotes: null,
  contactAttempts: 0
}

export const DEFAULT_STAGE2_DATA: Stage2Data = {
  programId: null,
  programName: null,
  intakeId: null,
  intakePeriod: null,
  budgetConfirmed: false,
  budgetRange: null,
  timelineDiscussed: false,
  preferredCampus: null
}

export const DEFAULT_STAGE3_DATA: Stage3Data = {
  hasValidPassport: null,
  passportExpiry: null,
  passportStatus: 'not_started',
  educationVerified: null,
  highestDegree: null,
  transcriptsStatus: 'not_started',
  englishTest: null,
  englishScore: null,
  englishStatus: 'not_started',
  financialDocsReady: null,
  bankStatementsStatus: 'not_started',
  sponsorLetterRequired: false,
  sponsorLetterStatus: 'not_required',
  readinessScore: 0,
  verificationNotes: null
}

export const DEFAULT_STAGE4_DATA: Stage4Data = {
  preChecklistComplete: false,
  informationVerified: false,
  consentObtained: false,
  readyToConvert: false
}
