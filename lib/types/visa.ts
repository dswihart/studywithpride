export interface VisaRequirement {
  countryCode: string
  countryName: string
  countryNameEs: string
  consulateCity: string
  consulateAddress: string
  consulatePhone: string
  consulateEmail: string
  consulateWebsite: string
  appointmentUrl?: string
  processingTimeDays: number
  visaFee: string
  documents: VisaDocument[]
  additionalNotes: string
  additionalNotesEs: string
}

export interface VisaDocument {
  id: string
  name: string
  nameEs: string
  description: string
  descriptionEs: string
  required: boolean
  format?: string
}

export interface VisaLookupRequest {
  countryCode: string
}

export interface VisaLookupResponse {
  success: boolean
  data?: VisaRequirement
  error?: string
}
