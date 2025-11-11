import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

describe('/api/admin/write-data', () => {
  let originalNodeEnv: string | undefined

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('should return 403 Forbidden when NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production'
    
    const response = await fetch('http://localhost:3000/api/admin/write-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'visa', data: {} })
    })

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('development environment')
  })

  it('should return 400 Bad Request for malformed data', async () => {
    process.env.NODE_ENV = 'development'
    
    const response = await fetch('http://localhost:3000/api/admin/write-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'data' })
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('should accept valid data in development environment', async () => {
    process.env.NODE_ENV = 'development'
    
    const response = await fetch('http://localhost:3000/api/admin/write-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'visa', data: { test: 'data' } })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
