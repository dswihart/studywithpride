/**
 * Story 5.1-B: Secure Lead Read API for Recruiters
 * GET /api/recruiter/leads-read
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/role-guard'

interface LeadReadResponse {
  success: boolean
  data?: {
    leads: any[]
    total: number
    filtered: number
  }
  error?: string
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const roleCheck = await requireRole('recruiter')
    
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || 'Forbidden' } as LeadReadResponse,
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    const contactStatus = searchParams.get('contact_status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const supabase = await createClient()
    let query = supabase.from('leads').select('*', { count: 'exact' })
    
    if (country && country !== 'all') {
      query = query.eq('country', country)
    }
    
    if (contactStatus && contactStatus !== 'all') {
      query = query.eq('contact_status', contactStatus)
    }
    
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })
    
    const { data: leads, error, count } = await query
    
    if (error) {
      console.error('[leads-read] Error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leads' } as LeadReadResponse,
        { status: 500 }
      )
    }
    
    const elapsedTime = Date.now() - startTime
    console.log()
    
    if (elapsedTime > 250) {
      console.warn()
    }
    
    return NextResponse.json(
      {
        success: true,
        data: {
          leads: leads || [],
          total: count || 0,
          filtered: (leads || []).length
        }
      } as LeadReadResponse,
      { status: 200 }
    )
    
  } catch (error: any) {
    console.error('[leads-read] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as LeadReadResponse,
      { status: 500 }
    )
  }
}
