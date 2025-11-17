import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
    }

    // Return mock data for now to test the UI
    const mockMessages = [
      {
        id: '1',
        lead_id: leadId,
        direction: 'outbound',
        content: 'Hello! This is a test message from Study With Pride.',
        status: 'delivered',
        sent_at: new Date().toISOString()
      }
    ]

    return NextResponse.json({ messages: mockMessages })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
