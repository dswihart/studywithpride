import { NextRequest, NextResponse } from 'next/server'
import { CostCalculatorResponse, CostEstimate } from '@/lib/types/cost'
import { cityCosts } from '@/lib/data/cost-by-city'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lifestyle = searchParams.get('lifestyle')
  const city = searchParams.get('city') || 'barcelona'

  if (!lifestyle || !['saver', 'moderate', 'spender'].includes(lifestyle)) {
    const response: CostCalculatorResponse = {
      success: false,
      error: 'Invalid lifestyle parameter. Must be: saver, moderate, or spender'
    }
    return NextResponse.json(response, { status: 400 })
  }

  if (!['barcelona', 'madrid', 'valencia'].includes(city)) {
    const response: CostCalculatorResponse = {
      success: false,
      error: 'Invalid city parameter. Must be: barcelona, madrid, or valencia'
    }
    return NextResponse.json(response, { status: 400 })
  }

  const lifestyleType = lifestyle as 'saver' | 'moderate' | 'spender'
  const cityCode = city as 'barcelona' | 'madrid' | 'valencia'
  const costCategories = cityCosts[cityCode]
  
  const totalMonthly = costCategories.reduce((sum, cat) => sum + cat[lifestyleType], 0)
  const totalYearly = totalMonthly * 12

  const estimate: CostEstimate = {
    lifestyle: lifestyleType,
    categories: costCategories,
    totalMonthly,
    totalYearly
  }

  const response: CostCalculatorResponse = {
    success: true,
    data: estimate
  }

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'CDN-Cache-Control': 'public, max-age=86400'
    }
  })
}
