// Content Approval API (Story 2.2-A AC 3 - NFR1)
import { NextRequest, NextResponse } from 'next/server'
import { approveTestimonial, rejectTestimonial } from '@/lib/cms/data'
import { validateAPIKey, getAPIKeyFromRequest, hasPermission } from '@/lib/cms/auth'
import { CMSResponse } from '@/lib/types/cms'

/**
 * POST /api/cms/approve
 * Content Approver role can approve/reject testimonials
 * NFR1: RBAC for Content Approver
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key and check for Content Approver role
    const apiKey = getAPIKeyFromRequest(request)
    const authResult = validateAPIKey(apiKey)
    
    if (!authResult.authorized) {
      const response: CMSResponse<null> = {
        success: false,
        error: authResult.reason || 'Unauthorized',
        timestamp: new Date().toISOString()
      }
      return NextResponse.json(response, { status: 401 })
    }
    
    const { contentId, action, contentType } = await request.json()
    
    // Check permission for approval operations
    const operation = `${action}:${contentType}`
    if (!hasPermission(authResult.role!, operation)) {
      const response: CMSResponse<null> = {
        success: false,
        error: `Insufficient permissions for ${operation}`,
        timestamp: new Date().toISOString()
      }
      return NextResponse.json(response, { status: 403 })
    }
    
    // Only testimonials are supported for now
    if (contentType !== 'testimonials') {
      const response: CMSResponse<null> = {
        success: false,
        error: 'Only testimonials can be approved/rejected at this time',
        timestamp: new Date().toISOString()
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    let result: boolean
    if (action === 'approve') {
      result = await approveTestimonial(contentId, authResult.role!)
    } else if (action === 'reject') {
      result = await rejectTestimonial(contentId)
    } else {
      const response: CMSResponse<null> = {
        success: false,
        error: 'Invalid action. Must be approve or reject',
        timestamp: new Date().toISOString()
      }
      return NextResponse.json(response, { status: 400 })
    }
    
    if (result) {
      const response: CMSResponse<{ contentId: string, action: string }> = {
        success: true,
        data: { contentId, action },
        timestamp: new Date().toISOString()
      }
      return NextResponse.json(response, { status: 200 })
    } else {
      const response: CMSResponse<null> = {
        success: false,
        error: 'Content not found',
        timestamp: new Date().toISOString()
      }
      return NextResponse.json(response, { status: 404 })
    }
  } catch (error) {
    const response: CMSResponse<null> = {
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }
    return NextResponse.json(response, { status: 500 })
  }
}
