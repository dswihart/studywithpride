import { NextRequest, NextResponse } from 'next/server'
import { createSession, SESSION_COOKIE_NAME } from '@/lib/cms/session'

// In production, use bcrypt for password hashing
const USERS = {
  'admin': {
    password: process.env.CMS_ADMIN_PASSWORD || 'admin123',
    role: 'admin' as const
  },
  'approver': {
    password: process.env.CMS_APPROVER_PASSWORD || 'approver123',
    role: 'content-approver' as const
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    const user = USERS[username as keyof typeof USERS]
    
    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const sessionId = createSession(username, user.role)
    
    const response = NextResponse.json({
      success: true,
      user: {
        username,
        role: user.role
      }
    })

    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
