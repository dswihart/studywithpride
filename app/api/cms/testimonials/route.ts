import { NextRequest, NextResponse } from 'next/server'
import { getTestimonials } from '@/lib/cms/data'
import { getSessionFromCookies } from '@/lib/cms/session'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  const session = await getSessionFromCookies()
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - please login' },
      { status: 401 }
    )
  }
  
  const approvedOnly = session.user.role !== 'admin'
  const testimonials = await getTestimonials(approvedOnly)
  
  const processingTime = Date.now() - startTime
  
  return NextResponse.json(
    {
      success: true,
      data: testimonials,
      meta: {
        count: testimonials.length,
        processingTimeMs: processingTime,
        role: session.user.role
      }
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Processing-Time-Ms': processingTime.toString()
      }
    }
  )
}
