'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isRequired, setIsRequired] = useState(false)
  const { user, session } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if this is a required password change
    const checkRequiredChange = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const result = await response.json()
          if (result.data?.must_change_password) {
            setIsRequired(true)
          }
        }
      } catch (err) {
        console.error('Error checking password change requirement:', err)
      }
    }

    checkRequiredChange()
  }, [user])

  // Password validation
  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = []

    if (pwd.length < 12) {
      errors.push('Password must be at least 12 characters long')
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('Password must contain at least one number')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)')
    }

    return errors
  }

  const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0
    if (pwd.length >= 12) score++
    if (pwd.length >= 16) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    const validationErrors = validatePassword(password)
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '))
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Update password via Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      // Clear the must_change_password flag via API
      const response = await fetch('/api/auth/password-changed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        console.error('Failed to clear password change flag')
      }

      setSuccess(true)

      // Redirect to student portal after 2 seconds
      setTimeout(() => {
        router.push('/student-portal')
      }, 2000)

    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!user && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-purple-950 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Please Log In
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You need to be logged in to change your password.
              </p>
              <Link
                href="/login"
                className="inline-block py-3 px-6 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-purple-950 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Password Changed Successfully!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Redirecting to your portal...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-purple-950 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {isRequired ? 'Set Your Password' : 'Change Password'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isRequired
              ? 'For security, please create a new password for your account'
              : 'Enter your new password below'
            }
          </p>
        </div>

        {isRequired && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Password Change Required
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  You must change your temporary password before accessing your account.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={12}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter new password"
              />

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Password Strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.label === 'Weak' ? 'text-red-600' :
                      passwordStrength.label === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Requirements:</p>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <li className={`flex items-center ${password.length >= 12 ? 'text-green-600' : ''}`}>
                    {password.length >= 12 ? '✓' : '○'} At least 12 characters
                  </li>
                  <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                    {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                  </li>
                  <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                    {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
                  </li>
                  <li className={`flex items-center ${/[0-9]/.test(password) ? 'text-green-600' : ''}`}>
                    {/[0-9]/.test(password) ? '✓' : '○'} One number
                  </li>
                  <li className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : ''}`}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'} One special character (!@#$%^&*)
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={12}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Confirm new password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-green-600 mt-1">Passwords match ✓</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || validatePassword(password).length > 0 || password !== confirmPassword}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                loading || validatePassword(password).length > 0 || password !== confirmPassword
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-lg'
              }`}
            >
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>

          {!isRequired && (
            <div className="mt-6 text-center">
              <Link
                href="/student-portal"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Portal
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
