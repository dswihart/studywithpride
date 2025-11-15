import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/recruiter/send-whatsapp/route'

jest.mock('@/lib/auth/role-guard', () => ({
  requireRole: jest.fn().mockResolvedValue({ authorized: true }),
}))

const updateLeadContactStatusMock = jest.fn()
const sendWhatsAppTemplateMessageMock = jest.fn().mockResolvedValue({ id: 'msg-123' })

jest.mock('@/src/db/utils/update-lead-status', () => ({
  updateLeadContactStatus: (leadId: string, status: string) => updateLeadContactStatusMock(leadId, status),
}))

jest.mock('@/src/services/messaging-service', () => ({
  sendWhatsAppTemplateMessage: (...args: any[]) => sendWhatsAppTemplateMessageMock(...args),
}))

const singleMock = jest.fn()
const eqMock = jest.fn(() => ({ single: singleMock }))
const selectMock = jest.fn(() => ({ eq: eqMock }))
const fromMock = jest.fn(() => ({ select: selectMock }))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    from: (...args: any[]) => fromMock(...args),
  }),
}))

describe('/api/recruiter/send-whatsapp', () => {
  beforeEach(() => {
    sendWhatsAppTemplateMessageMock.mockClear()
    updateLeadContactStatusMock.mockClear()
    singleMock.mockReset()
    eqMock.mockClear()
    selectMock.mockClear()
    fromMock.mockClear()
  })

  it('updates lead status after a successful send', async () => {
    singleMock.mockResolvedValue({
      data: {
        id: 'lead-123',
        prospect_name: 'Taylor',
        prospect_email: 'taylor@example.com',
        phone: '+123456789',
      },
      error: null,
    })

    const request = NextRequest.from(
      new Request('http://localhost/api/recruiter/send-whatsapp', {
        method: 'POST',
        body: JSON.stringify({ lead_id: 'lead-123', template_id: 'WelcomeMessage' }),
      })
    )

    const response = await POST(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.success).toBe(true)
    expect(sendWhatsAppTemplateMessageMock).toHaveBeenCalledWith({
      phoneNumber: '+123456789',
      templateId: 'WelcomeMessage',
      variables: { name: 'Taylor', email: 'taylor@example.com' },
    })
    expect(updateLeadContactStatusMock).toHaveBeenCalledWith('lead-123', 'contacted')
  })
})
