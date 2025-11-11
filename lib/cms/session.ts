import { cookies } from 'next/headers'

export interface Session {
  user: {
    username: string
    role: 'content-approver' | 'admin'
  }
  expiresAt: number
}

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const SESSION_COOKIE_NAME = 'cms_session'

// Simple session store (in production, use Redis or similar)
const sessions = new Map<string, Session>()

export function createSession(username: string, role: 'content-approver' | 'admin'): string {
  const sessionId = generateSessionId()
  const session: Session = {
    user: { username, role },
    expiresAt: Date.now() + SESSION_DURATION
  }
  sessions.set(sessionId, session)
  return sessionId
}

export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId)
  if (!session) return null
  
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId)
    return null
  }
  
  return session
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}

export async function getSessionFromCookies(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!sessionId) return null
  return getSession(sessionId)
}

function generateSessionId(): string {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

export { SESSION_COOKIE_NAME }
