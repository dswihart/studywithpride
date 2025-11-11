/**
 * Story 5.1-A: Role-Based Access Control (RBAC) Guard
 * AC 1: RBAC Role Provisioned
 * AC 3: Secure Write API with Recruiter-only access
 * 
 * Provides middleware and utility functions to check user roles
 * against the Auth Context (Supabase Auth).
 */

import { createClient } from "@/lib/supabase/server"
import { User } from "@supabase/supabase-js"

// Supported application roles
export type AppRole = 'student' | 'recruiter' | 'admin'

export interface RoleCheckResult {
  authorized: boolean
  user?: User
  role?: AppRole
  reason?: string
}

/**
 * Extract role from user metadata
 * Roles are stored in raw_user_meta_data.role
 */
export function getUserRole(user: User | null): AppRole | null {
  if (!user) return null
  
  const role = user.user_metadata?.role
  
  // Validate role
  const validRoles: AppRole[] = ['student', 'recruiter', 'admin']
  if (role && validRoles.includes(role as AppRole)) {
    return role as AppRole
  }
  
  // Default to student if no role specified
  return 'student'
}

/**
 * Check if user has a specific role
 * AC 4: TDD Forbidden Test - Students should get 403
 */
export async function hasRole(requiredRole: AppRole): Promise<RoleCheckResult> {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        authorized: false,
        reason: 'Not authenticated'
      }
    }
    
    const userRole = getUserRole(user)
    
    if (!userRole) {
      return {
        authorized: false,
        user,
        reason: 'No role assigned to user'
      }
    }
    
    // Check if user has required role
    if (userRole !== requiredRole && userRole !== 'admin') {
      return {
        authorized: false,
        user,
        role: userRole,
        reason: 'Insufficient permissions. Required: ' + requiredRole + ', User has: ' + userRole
      }
    }
    
    return {
      authorized: true,
      user,
      role: userRole
    }
  } catch (error: any) {
    return {
      authorized: false,
      reason: 'Authorization check failed: ' + error.message
    }
  }
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(roles: AppRole[]): Promise<RoleCheckResult> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        authorized: false,
        reason: 'Not authenticated'
      }
    }
    
    const userRole = getUserRole(user)
    
    if (!userRole) {
      return {
        authorized: false,
        user,
        reason: 'No role assigned to user'
      }
    }
    
    // Admin has access to everything
    if (userRole === 'admin' || roles.includes(userRole)) {
      return {
        authorized: true,
        user,
        role: userRole
      }
    }
    
    return {
      authorized: false,
      user,
      role: userRole,
      reason: 'Insufficient permissions. Required one of specified roles, User has: ' + userRole
    }
  } catch (error: any) {
    return {
      authorized: false,
      reason: 'Authorization check failed: ' + error.message
    }
  }
}

/**
 * Middleware wrapper for API routes
 * Use this to protect API endpoints with role-based access
 */
export async function requireRole(requiredRole: AppRole): Promise<RoleCheckResult> {
  return hasRole(requiredRole)
}

/**
 * Middleware to require any of the specified roles
 */
export async function requireAnyRole(roles: AppRole[]): Promise<RoleCheckResult> {
  return hasAnyRole(roles)
}
