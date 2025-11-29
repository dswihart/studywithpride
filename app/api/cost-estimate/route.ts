import { NextRequest, NextResponse } from "next/server"
import { cityCosts } from "@/lib/data/cost-by-city"
import { CostEstimate } from "@/lib/types/cost"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const city = searchParams.get("city") || "barcelona"

  const costCategories = cityCosts[city] || cityCosts.barcelona
  
  const totalMonthly = costCategories.reduce((sum, cat) => sum + cat.cost, 0)
  const totalYearly = totalMonthly * 12

  const estimate: CostEstimate = {
    categories: costCategories,
    totalMonthly,
    totalYearly
  }

  return NextResponse.json({
    success: true,
    data: estimate
  })
}
