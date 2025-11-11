/**
 * Story 5.1-A: TDD Tests for Secure Lead Write API
 * AC 4: Test that Student role receives 403 Forbidden
 * AC 4: Test that malformed data receives 400 Bad Request
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        maybeSingle: jest.fn()
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }))
}

// Mock the Supabase server module
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabaseClient))
}))

describe('/api/recruiter/leads-write - TDD Red Phase', () => {
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * AC 4: TDD Forbidden Test
   * CRITICAL: Student role must receive 403 Forbidden
   */
  it('RED: should return 403 Forbidden when user has Student role', async () => {
    // Mock authenticated student user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'student-user-id',
          email: 'student@test.com',
          user_metadata: { role: 'student' },
          raw_user_meta_data: { role: 'student' }
        }
      },
      error: null
    })

    const response = await fetch('http://localhost:3000/api/recruiter/leads-write', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: 'lead-user-id',
        country: 'US',
        contact_status: 'not_contacted'
      })
    })

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('Forbidden')
  })

  /**
   * AC 4: TDD Bad Request Test
   * Missing required field (country) should return 400
   */
  it('RED: should return 400 Bad Request when Country field is missing', async () => {
    // Mock authenticated recruiter user
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'recruiter-user-id',
          email: 'recruiter@test.com',
          user_metadata: { role: 'recruiter' },
          raw_user_meta_data: { role: 'recruiter' }
        }
      },
      error: null
    })

    const response = await fetch('http://localhost:3000/api/recruiter/leads-write', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: 'lead-user-id',
        // country: missing!
        contact_status: 'not_contacted'
      })
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('Missing required fields')
  })

  /**
   * AC 4: TDD Bad Request Test
   * Missing user_id should return 400
   */
  it('RED: should return 400 Bad Request when user_id is missing', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'recruiter-user-id',
          email: 'recruiter@test.com',
          user_metadata: { role: 'recruiter' },
          raw_user_meta_data: { role: 'recruiter' }
        }
      },
      error: null
    })

    const response = await fetch('http://localhost:3000/api/recruiter/leads-write', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // user_id: missing!
        country: 'US',
        contact_status: 'not_contacted'
      })
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('Missing required fields')
  })

  /**
   * AC 4: TDD Bad Request Test
   * Invalid contact_status should return 400
   */
  it('RED: should return 400 Bad Request when contact_status is invalid', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'recruiter-user-id',
          email: 'recruiter@test.com',
          user_metadata: { role: 'recruiter' },
          raw_user_meta_data: { role: 'recruiter' }
        }
      },
      error: null
    })

    const response = await fetch('http://localhost:3000/api/recruiter/leads-write', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: 'lead-user-id',
        country: 'US',
        contact_status: 'invalid_status'
      })
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid contact_status')
  })

  /**
   * GREEN Phase: Valid Recruiter request should succeed
   */
  it('GREEN: should return 200 OK when Recruiter creates valid lead', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'recruiter-user-id',
          email: 'recruiter@test.com',
          user_metadata: { role: 'recruiter' },
          raw_user_meta_data: { role: 'recruiter' }
        }
      },
      error: null
    })

    // Mock successful database insert
    const mockLeadResult = {
      id: 'new-lead-id',
      created_at: new Date().toISOString()
    }

    mockSupabaseClient.from().select().eq().maybeSingle.mockResolvedValue({
      data: null,
      error: null
    })

    mockSupabaseClient.from().insert().select().single.mockResolvedValue({
      data: mockLeadResult,
      error: null
    })

    const response = await fetch('http://localhost:3000/api/recruiter/leads-write', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: 'lead-user-id',
        country: 'US',
        contact_status: 'not_contacted',
        notes: 'Test lead'
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })

  /**
   * AC 4: Unauthenticated requests should be rejected
   */
  it('RED: should return 403 when user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' }
    })

    const response = await fetch('http://localhost:3000/api/recruiter/leads-write', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: 'lead-user-id',
        country: 'US',
        contact_status: 'not_contacted'
      })
    })

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.success).toBe(false)
  })
})
