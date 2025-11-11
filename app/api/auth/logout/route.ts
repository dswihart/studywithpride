import { NextRequest, NextResponse } from 'next/server'
import { deleteSession, SESSION_COOKIE_NAME } from '@/lib/cms/session'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (sessionId) {
    deleteSession(sessionId)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete(SESSION_COOKIE_NAME)
  
  return response
}
