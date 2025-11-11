export type LifestyleType = 'saver' | 'moderate' | 'spender'

export interface CostCategory {
  category: string
  categoryEs: string
  saver: number
  moderate: number
  spender: number
  description: string
  descriptionEs: string
}

export interface CostEstimate {
  lifestyle: LifestyleType
  categories: CostCategory[]
  totalMonthly: number
  totalYearly: number
}

export interface CostCalculatorRequest {
  lifestyle: LifestyleType
}

export interface CostCalculatorResponse {
  success: boolean
  data?: CostEstimate
  error?: string
}
