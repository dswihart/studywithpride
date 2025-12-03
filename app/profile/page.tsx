'use client'

import { useAuth } from '@/components/AuthContext'
import { useLanguage } from '@/components/LanguageContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supportedCountries } from '@/lib/data/visa-requirements'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  country_of_origin?: string
  preferred_language?: string
  phone_number?: string
}

export default function ProfileSettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [fullName, setFullName] = useState('')
  const [countryOfOrigin, setCountryOfOrigin] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState('en')
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      if (response.status === 401) {
        router.push('/login')
        return
      }
      const result = await response.json()
      if (result.success && result.data) {
        setProfile(result.data)
        setFullName(result.data.full_name || '')
        setCountryOfOrigin(result.data.country_of_origin || '')
        setPreferredLanguage(result.data.preferred_language || 'en')
        setPhoneNumber(result.data.phone_number || '')
      }
    } catch (err) {
      setError(t('failedToLoadProfile'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName || null,
          country_of_origin: countryOfOrigin || null,
          preferred_language: preferredLanguage,
          // phone_number: phoneNumber || null,  // Commented out - column not in database yet
        }),
      })

      if (response.status === 401) {
        router.push('/login')
        return
      }

      const result = await response.json()
      if (result.success) {
        setSuccess(true)
        setProfile(result.data)
        // Update UI language if changed
        setLanguage(preferredLanguage as 'en' | 'es' | 'pt')
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || t('error'))
      }
    } catch (err) {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingProfile')}</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/student-portal"
            className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center mb-4"
          >
            ← {t('backToPortal')}
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('profileSettings')}
          </h1>
          <p className="text-gray-600">
            {t('updatePersonalInfo')}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">{t('profileUpdated')}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Country Info Banner */}
        {countryOfOrigin && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>{t('notes')}:</strong> {t('countryNote')}
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('emailAddress')}
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">{t('emailCannotChange')}</p>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                {t('fullName')}
              </label>
              <input
                type="text"
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={t('enterFullName')}
              />
            </div>

            {/* Country of Origin */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                {t('countryOfOrigin')} <span className="text-red-500">*</span>
              </label>
              <select
                id="country"
                value={countryOfOrigin}
                onChange={(e) => setCountryOfOrigin(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">{t('selectCountry')}</option>
                {supportedCountries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {t('customizeVisaRequirements')}
              </p>
            </div>

            {/* Preferred Language */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                {t('preferredLanguage')}
              </label>
              <select
                id="language"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="pt">Português</option>
              </select>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                {t('phoneNumber')}
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-lg'
                }`}
              >
                {saving ? t('saving') : t('saveChanges')}
              </button>
              <Link
                href="/student-portal"
                className="flex-1 py-3 px-6 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition text-center"
              >
                {t('cancel')}
              </Link>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-semibold text-purple-900 mb-2">{t('whyWeNeedInfo')}</h3>
          <ul className="text-sm text-purple-800 space-y-2">
            <li>• <strong>{t('countryOfOrigin')}:</strong> {t('countryInfoReason')}</li>
            <li>• <strong>{t('fullName')}:</strong> {t('fullNameReason')}</li>
            <li>• <strong>{t('phoneNumber')}:</strong> {t('phoneNumberReason')}</li>
            <li>• <strong>{t('preferredLanguage')}:</strong> {t('languageReason')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
