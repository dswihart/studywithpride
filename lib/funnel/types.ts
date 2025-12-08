// Funnel Stage Types - 4 stages based on lead readiness checklist
export type FunnelStageNumber = 1 | 2 | 3 | 4
export type FunnelStageName = 'interested' | 'education' | 'english' | 'has_funds'

// Combined Lead Funnel Data (derived from contact_history checklist)
export interface LeadFunnelData {
  leadId: string
  currentStage: FunnelStageNumber
  stages: {
    stage1: boolean // Interested
    stage2: boolean // Education
    stage3: boolean // English
    stage4: boolean // Has Funds
  }
  completedStages: FunnelStageNumber[]
  convertedToStudent: boolean
  convertedAt: string | null
  studentId: string | null
  applicationId: string | null
  intakePeriod: string | null
  programName: string | null
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

// Program and Intake types
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
  period: string
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

// Funnel stage info
export interface FunnelStageInfo {
  number: FunnelStageNumber
  name: FunnelStageName
  label: string
  shortLabel: string
  description: string
  color: string
  checklistField: string // Maps to contact_history field
}

export const FUNNEL_STAGES: FunnelStageInfo[] = [
  { number: 1, name: "interested", label: "Interested", shortLabel: "Interested", description: "Lead is interested", color: "amber", checklistField: "interested" },
  { number: 2, name: "education", label: "Education", shortLabel: "Education", description: "Has education documents", color: "purple", checklistField: "has_education_docs" },
  { number: 3, name: "english", label: "English", shortLabel: "English", description: "English proficiency verified", color: "blue", checklistField: "ready_to_proceed" },
  { number: 4, name: "has_funds", label: "Funds", shortLabel: "Funds", description: "Has confirmed funds", color: "green", checklistField: "has_funds" }
]

// Legacy types kept for compatibility
export interface Stage1Data {
  contactMethod: 'phone' | 'whatsapp' | 'email' | 'in_person' | null
  interestLevel: 'low' | 'medium' | 'high' | null
  responseDate: string | null
  initialNotes: string | null
  contactAttempts: number
}

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

export interface Stage4Data {
  preChecklistComplete: boolean
  informationVerified: boolean
  consentObtained: boolean
  readyToConvert: boolean
}

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
