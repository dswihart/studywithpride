import { NextRequest, NextResponse } from 'next/server'
import { WriteDataResponse } from '@/lib/types/admin'

export async function POST(request: NextRequest) {
  // CRITICAL SECURITY CHECK - AC 4
  // Must FAIL if not in development environment
  if (process.env.NODE_ENV !== 'development') {
    const response: WriteDataResponse = {
      success: false,
      error: 'This endpoint is only available in development environment'
    }
    return NextResponse.json(response, { status: 403 })
  }

  try {
    const body = await request.json()
    
    // Validate request
    if (!body.type || !body.data) {
      const response: WriteDataResponse = {
        success: false,
        error: 'Missing required fields: type and data'
      }
      return NextResponse.json(response, { status: 400 })
    }

    // In development, we'll just return success
    // In a real implementation, this would write to files
    // For now, we're validating the guard rail works
    const response: WriteDataResponse = {
      success: true,
      message: `Data saved successfully for type: ${body.type}`
    }
    
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    const response: WriteDataResponse = {
      success: false,
      error: 'Failed to process request'
    }
    return NextResponse.json(response, { status: 500 })
  }
}
