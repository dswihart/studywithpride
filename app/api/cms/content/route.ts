// Admin Content Management API (Story 2.2-A AC 3)
import { NextRequest, NextResponse } from 'next/server'
import { addTestimonial, saveTestimonials, getTestimonials } from '@/lib/cms/data'
import { validateAPIKey, getAPIKeyFromRequest } from '@/lib/cms/auth'
import { CMSResponse, Testimonial } from '@/lib/types/cms'

/**
 * POST /api/cms/content
 * Admin-only endpoint for adding/updating content
 * AC 3: Secure Write Endpoint with Admin Key authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key - Admin only
    const apiKey = getAPIKeyFromRequest(request)
    const authResult = validateAPIKey(apiKey)
    
    if (!authResult.authorized || authResult.role !== 'admin') {
      const response: CMSResponse<null> = {
        success: false,
        error: 'Unauthorized - Admin access required',
        timestamp: new Date().toISOString()
      }
      return NextResponse.json(response, { status: 403 })
    }
    
    const { action, contentType, data } = await request.json()
    
    if (contentType === 'testimonials') {
      if (action === 'add') {
        const newTestimonial = await addTestimonial(data)
        const response: CMSResponse<Testimonial> = {
          success: true,
          data: newTestimonial,
          timestamp: new Date().toISOString()
        }
        return NextResponse.json(response, { status: 201 })
      } else if (action === 'update') {
        const testimonials = await getTestimonials(false)
        const index = testimonials.findIndex(t => t.id === data.id)
        
        if (index === -1) {
          const response: CMSResponse<null> = {
            success: false,
            error: 'Testimonial not found',
            timestamp: new Date().toISOString()
          }
          return NextResponse.json(response, { status: 404 })
        }
        
        testimonials[index] = { ...testimonials[index], ...data, updatedAt: new Date().toISOString() }
        await saveTestimonials(testimonials)
        
        const response: CMSResponse<Testimonial> = {
          success: true,
          data: testimonials[index],
          timestamp: new Date().toISOString()
        }
        return NextResponse.json(response, { status: 200 })
      }
    }
    
    const response: CMSResponse<null> = {
      success: false,
      error: 'Invalid action or content type',
      timestamp: new Date().toISOString()
    }
    return NextResponse.json(response, { status: 400 })
  } catch (error) {
    console.error('Content management error:', error)
    const response: CMSResponse<null> = {
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }
    return NextResponse.json(response, { status: 500 })
  }
}
