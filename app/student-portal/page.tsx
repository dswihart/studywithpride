"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/AuthContext"
import { useLanguage } from "@/components/LanguageContext"
import DeadlineCountdown from "@/components/features/DeadlineCountdown"

interface UniversityApplication {
  id?: string
  university_name: string
  program_name: string
  intake_term: string
  application_status: string
  documents_uploaded: any[]
}

export default function StudentPortalPage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const { t } = useLanguage()
  const [applications, setApplications] = useState<UniversityApplication[]>([])
  const [loadingApplications, setLoadingApplications] = useState(true)
  const [checkingPassword, setCheckingPassword] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingApp, setDeletingApp] = useState<UniversityApplication | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Check if user must change password on first login
  useEffect(() => {
    const checkPasswordRequired = async () => {
      if (!user) {
        setCheckingPassword(false)
        return
      }

      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const result = await response.json()
          if (result.data?.must_change_password) {
            // Redirect to change password page
            router.push('/change-password')
            return
          }
        }
      } catch (err) {
        console.error('Error checking password requirement:', err)
      }

      setCheckingPassword(false)
    }

    if (!loading && user) {
      checkPasswordRequired()
    } else if (!loading) {
      setCheckingPassword(false)
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !checkingPassword) {
      fetchApplications()
    }
  }, [user, checkingPassword])

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true)
      const response = await fetch('/api/portal/get-visa-status')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setApplications(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoadingApplications(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleDeleteClick = (app: UniversityApplication) => {
    setDeletingApp(app)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingApp?.id) return

    setDeleting(true)
    try {
      const response = await fetch('/api/portal/delete-university', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: deletingApp.id }),
      })

      if (response.ok) {
        setApplications(prev => prev.filter(a => a.id !== deletingApp.id))
        setDeleteModalOpen(false)
        setDeletingApp(null)
      } else {
        alert('Failed to delete application. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting application:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading || checkingPassword) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>{t('loadingPortal')}</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">{t('welcomeToPortal')}</h1>
          <p className="text-gray-600">
            {t('loggedInAs')} <span className="font-medium">{user.email}</span>
          </p>
        </div>

        {/* Floating WhatsApp Button - Fixed position, always visible */}
        <a
          href="https://wa.me/34694293321"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-full shadow-2xl transition-all transform hover:scale-110 font-bold text-lg"
          style={{
            boxShadow: '0 0 15px rgba(34, 197, 94, 0.5)',
          }}
        >
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Need Help? Chat Now!</span>
          </div>
        </a>

        {/* Top banner WhatsApp CTA */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl mb-6 shadow-lg hover:shadow-xl transition-shadow">
          <a
            href="https://wa.me/34694293321"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 hover:opacity-90"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="font-bold text-lg">Questions? Message us on WhatsApp - We reply fast!</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* Deadline Countdown Widget */}
        <div className="mb-8">
          <DeadlineCountdown />
        </div>

        {/* University Applications Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{t('myUniversities')}</h2>
            <Link
              href="/portal/add-university"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium inline-flex items-center text-sm"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t('addUniversity')}
            </Link>
          </div>

          {loadingApplications ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('loading')}</p>
            </div>
          ) : applications.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {applications.map((app, index) => (
                <div
                  key={app.id || index}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    {/* University Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {app.university_name}
                        </h3>
                        <p className="text-gray-600 text-sm">{app.program_name}</p>
                        <p className="text-gray-500 text-sm">{app.intake_term}</p>
                      </div>
                      <div className="ml-4">
                        <svg
                          className="h-12 w-12 text-purple-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(app.application_status)}`}>
                        {app.application_status}
                      </span>
                    </div>

                    {/* Document Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">{t('documentsUploaded')}</span>
                        <span className="font-medium text-gray-900">
                          {app.documents_uploaded?.length || 0} / 5
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${((app.documents_uploaded?.length || 0) / 5) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/portal/university/${app.id || 'upf'}`}
                        className="flex-1 text-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                      >
                        {t('viewApplication')}
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(app)}
                        className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium"
                        title="Delete Application"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                className="h-16 w-16 text-gray-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('noUniversityYet')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('getStarted')}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('quickActions')}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/profile"
              className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold mb-2">{t('profileSettings')}</h2>
                  <p className="text-gray-600 text-sm">
                    {t('manageProfile')}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/portal/visa-tracker"
              className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold mb-2">{t('visaTracker')}</h2>
                  <p className="text-gray-600 text-sm">
                    {t('trackVisaProgress')}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="mt-8">
          <button
            onClick={handleSignOut}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            {t('signOut')}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setDeleteModalOpen(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete Application?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Are you sure you want to delete your application for:
                </p>
                <p className="font-semibold text-gray-900 dark:text-white mb-4">
                  {deletingApp?.university_name}
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <strong>Warning:</strong> This will permanently delete all application data including uploaded documents. This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDeleteModalOpen(false)
                      setDeletingApp(null)
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete Application'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
