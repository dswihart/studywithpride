// CMS Authentication & Authorization (Story 2.2-A AC 3, 4)
import { NextRequest } from 'next/server'
import { CMSRole, CMSAuthToken } from '@/lib/types/cms'

// API Keys stored in environment variables (NEVER in code)
const CMS_READ_ONLY_KEY = process.env.CMS_READ_ONLY_API_KEY || 'dev-read-only-key'
const CMS_ADMIN_KEY = process.env.CMS_ADMIN_API_KEY
const CMS_APPROVER_KEY = process.env.CMS_APPROVER_API_KEY

export interface AuthResult {
  authorized: boolean
  role?: CMSRole
  reason?: string
}

/**
 * Validates API key and returns authorization status
 * AC 3: Admin Key for write operations
 * AC 4: Read-Only Key for frontend
 */
export function validateAPIKey(apiKey: string | null): AuthResult {
  if (!apiKey) {
    return { authorized: false, reason: 'No API key provided' }
  }

  // Admin key - full access
  if (apiKey === CMS_ADMIN_KEY && CMS_ADMIN_KEY) {
    return { authorized: true, role: 'admin' }
  }

  // Content Approver key - can approve/reject testimonials
  if (apiKey === CMS_APPROVER_KEY && CMS_APPROVER_KEY) {
    return { authorized: true, role: 'content-approver' }
  }

  // Read-only key - public access
  if (apiKey === CMS_READ_ONLY_KEY) {
    return { authorized: true, role: 'public' }
  }

  return { authorized: false, reason: 'Invalid API key' }
}

/**
 * Extract API key from request headers
 */
export function getAPIKeyFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '') || null
}

/**
 * Check if role has permission for operation
 * NFR1: Role-Based Access Control (RBAC)
 */
export function hasPermission(role: CMSRole, operation: string): boolean {
  const permissions: Record<CMSRole, string[]> = {
    'public': ['read:testimonials', 'read:visa', 'read:financial'],
    'content-approver': ['read:*', 'approve:testimonials', 'reject:testimonials'],
    'admin': ['*']
  }

  const rolePermissions = permissions[role] || []
  
  // Check for wildcard permission
  if (rolePermissions.includes('*')) {
    return true
  }

  // Check for exact match
  if (rolePermissions.includes(operation)) {
    return true
  }

  // Check for wildcard category match (e.g., 'read:*')
  const [action] = operation.split(':')
  if (rolePermissions.includes(`${action}:*`)) {
    return true
  }

  return false
}

/**
 * Middleware to protect CMS write operations
 * AC 3: Only authenticated admins can write data
 */
export function requireAuth(minRole: CMSRole = 'content-approver') {
  return (request: NextRequest): AuthResult => {
    const apiKey = getAPIKeyFromRequest(request)
    const authResult = validateAPIKey(apiKey)

    if (!authResult.authorized) {
      return authResult
    }

    const roleHierarchy: Record<CMSRole, number> = {
      'public': 0,
      'content-approver': 1,
      'admin': 2
    }

    if (roleHierarchy[authResult.role!] < roleHierarchy[minRole]) {
      return {
        authorized: false,
        reason: `Insufficient permissions. Required: ${minRole}, Provided: ${authResult.role}`
      }
    }

    return authResult
  }
}
