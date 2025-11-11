"use client"

import Link from 'next/link'
import { useLanguage } from '@/components/LanguageContext'
import { useAuth } from '@/components/AuthContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useState, useEffect } from 'react'

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useLanguage()
  const { user, signOut, loading: authLoading } = useAuth()

  // Check if user is recruiter or admin
  const userRole = user?.user_metadata?.role
  const isRecruiterOrAdmin = userRole === 'recruiter' || userRole === 'admin'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.user-menu-container')) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [userMenuOpen])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 transition-colors">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🏳️‍🌈</span>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Study With Pride
            </span>
          </Link>

          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/safety" className="text-gray-700 hover:text-purple-600 transition">
              {t('nav.safety')}
            </Link>
            <Link href="/visa" className="text-gray-700 hover:text-purple-600 transition">
              {t('nav.visa')}
            </Link>
            <Link href="/cost-calculator" className="text-gray-700 hover:text-purple-600 transition">
              {t('nav.costCalculator')}
            </Link>
            <Link href="/partners" className="text-gray-700 hover:text-purple-600 transition">
              {t('nav.partners')}
            </Link>
            <Link href="/news" className="text-gray-700 hover:text-purple-600 transition">
              News
            </Link>

            {mounted && !authLoading && (
              <>
                {user ? (
                  <div className="relative user-menu-container">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="max-w-[150px] truncate">{user.email}</span>
                      <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm text-gray-500">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                          {userRole && (
                            <p className="text-xs text-purple-600 mt-1 capitalize">{userRole}</p>
                          )}
                        </div>

                        {/* Recruitment Dashboard link - only for recruiters/admins */}
                        {isRecruiterOrAdmin && (
                          <Link
                            href="/admin/recruitment/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>Recruitment Dashboard</span>
                            </div>
                          </Link>
                        )}

                        <Link
                          href="/student-portal"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>{t('nav.studentPortal')}</span>
                          </div>
                        </Link>
                        <Link
                          href="/student-portal"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>My Applications</span>
                          </div>
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            signOut()
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="text-purple-600 hover:text-purple-700 font-medium transition"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}

            {mounted && (
              <LanguageSwitcher />
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            {mounted && (
              <LanguageSwitcher />
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-purple-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              <Link
                href="/safety"
                className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.safety')}
              </Link>
              <Link
                href="/visa"
                className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.visa')}
              </Link>
              <Link
                href="/cost-calculator"
                className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.costCalculator')}
              </Link>
              <Link
                href="/partners"
                className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.partners')}
              </Link>
              <Link
                href="/news"
                className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                News
              </Link>

              {mounted && !authLoading && (
                <>
                  <div className="border-t border-gray-200 pt-3">
                    {user ? (
                      <>
                        <div className="px-3 py-2 mb-2">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                          {userRole && (
                            <p className="text-xs text-purple-600 mt-1 capitalize">{userRole}</p>
                          )}
                        </div>

                        {/* Recruitment Dashboard link - only for recruiters/admins (Mobile) */}
                        {isRecruiterOrAdmin && (
                          <Link
                            href="/admin/recruitment/dashboard"
                            className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Recruitment Dashboard
                          </Link>
                        )}

                        <Link
                          href="/student-portal"
                          className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {t('nav.studentPortal')}
                        </Link>
                        <Link
                          href="/student-portal"
                          className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Applications
                        </Link>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false)
                            signOut()
                          }}
                          className="w-full text-left text-red-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          href="/login"
                          className="block text-center text-purple-600 hover:text-purple-700 px-3 py-2 rounded transition font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          href="/register"
                          className="block text-center bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
