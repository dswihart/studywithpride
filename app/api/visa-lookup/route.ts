import { NextRequest, NextResponse } from 'next/server'
import { visaRequirements } from '@/lib/data/visa-requirements'
import { VisaLookupResponse } from '@/lib/types/visa'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const countryCode = searchParams.get('countryCode')

  if (!countryCode) {
    const response: VisaLookupResponse = {
      success: false,
      error: 'Country code is required'
    }
    return NextResponse.json(response, { status: 400 })
  }

  const visaData = visaRequirements[countryCode.toUpperCase()]

  if (!visaData) {
    const response: VisaLookupResponse = {
      success: false,
      error: `Visa information not available for country code: ${countryCode}`
    }
    return NextResponse.json(response, { status: 404 })
  }

  const response: VisaLookupResponse = {
    success: true,
    data: visaData
  }

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'CDN-Cache-Control': 'public, max-age=86400'
    }
  })
}
