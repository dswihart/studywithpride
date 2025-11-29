export interface PassportRequirement {
  validityMonths: number
  blankPages: number
  passportOffice: string
  passportOfficeWebsite: string
  processingDays: string
  passportFee: string
  requiredDocuments: string[]
  consulateInSpain: {
    city: string
    address: string
    phone: string
    email: string
    website: string
  }
  apostilleAuthority: string
  apostilleProcessingDays: string
  apostilleFee: string
  apostilleDocuments: string[]
  notes: string[]
  notesEs: string[]
}

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
  passport: PassportRequirement
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
