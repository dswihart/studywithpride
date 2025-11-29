export interface CostCategory {
  category: string
  categoryEs: string
  cost: number
  description: string
  descriptionEs: string
}

export interface CostEstimate {
  categories: CostCategory[]
  totalMonthly: number
  totalYearly: number
}

export interface CostCalculatorResponse {
  success: boolean
  data?: CostEstimate
  error?: string
}
