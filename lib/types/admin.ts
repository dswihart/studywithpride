export interface WriteDataRequest {
  type: 'visa' | 'financial'
  data: any
}

export interface WriteDataResponse {
  success: boolean
  message?: string
  error?: string
}
