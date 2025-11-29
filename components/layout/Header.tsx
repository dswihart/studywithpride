"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/LanguageContext'
import { useAuth } from '@/components/AuthContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTheme } from '@/components/ThemeProvider'
import { useState, useEffect, MouseEvent as ReactMouseEvent } from 'react'

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const { user, signOut, loading: authLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'

  // Check if user is recruiter or admin
  const userRole = user?.user_metadata?.role
  const isRecruiterOrAdmin = userRole === 'recruiter' || userRole === 'admin'

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleNavigate = (event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) {
      return
    }
    event.preventDefault()
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
    router.push(href)
  }

  const desktopNavLinks = [
    { href: '/safety', label: 'Community' },
    { href: '/visa', label: t('nav.visa') },
    { href: '/cost-calculator', label: t('nav.costCalculator') },
    { href: '/partners', label: t('nav.partners') }
  ]

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
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🏳️‍🌈</span>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Study With Pride
            </span>
          </Link>

          <div className="hidden md:flex space-x-6 items-center">
            {desktopNavLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleNavigate(event, link.href)}
                className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition"
              >
                {link.label}
              </a>
            ))}

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
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-200 dark:border-gray-700">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                          {userRole && (
                            <p className="text-xs text-purple-600 mt-1 capitalize">{userRole}</p>
                          )}
                        </div>

                        {/* Recruitment Dashboard link - only for recruiters/admins */}
                        {isRecruiterOrAdmin && (
                          <a
                            href="/admin/recruitment/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            onClick={(event) => handleNavigate(event, '/admin/recruitment/dashboard')}
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>Recruitment Dashboard</span>
                            </div>
                          </a>
                        )}

                        <a
                          href="/student-portal"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          onClick={(event) => handleNavigate(event, '/student-portal')}
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>{t('nav.studentPortal')}</span>
                          </div>
                        </a>
                        <a
                          href="/student-portal"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          onClick={(event) => handleNavigate(event, '/student-portal')}
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>My Applications</span>
                          </div>
                        </a>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            signOut()
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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
                    <a
                      href="/login"
                      onClick={(event) => handleNavigate(event, '/login')}
                      className="text-purple-600 hover:text-purple-700 font-medium transition"
                    >
                      Login
                    </a>
                    <a
                      href="/register"
                      onClick={(event) => handleNavigate(event, '/register')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                      Sign Up
                    </a>
                  </div>
                )}
              </>
            )}

            <div className="flex items-center space-x-3">
              {mounted && (
                <LanguageSwitcher />
              )}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition dark:bg-gray-800 dark:text-gray-200"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2M12 19v2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M3 12h2M19 12h2M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            {mounted && (
              <LanguageSwitcher />
            )}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition dark:bg-gray-800 dark:text-gray-200"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2M12 19v2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M3 12h2M19 12h2M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {desktopNavLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                  onClick={(event) => handleNavigate(event, link.href)}
                >
                  {link.label}
                </a>
              ))}

              {mounted && !authLoading && (
                <>
                  <div className="border-t border-gray-200 pt-3">
                    {user ? (
                      <>
                        <div className="px-3 py-2 mb-2">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                          {userRole && (
                            <p className="text-xs text-purple-600 mt-1 capitalize">{userRole}</p>
                          )}
                        </div>

                        {/* Recruitment Dashboard link - only for recruiters/admins (Mobile) */}
                        {isRecruiterOrAdmin && (
                          <a
                            href="/admin/recruitment/dashboard"
                            className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                            onClick={(event) => handleNavigate(event, '/admin/recruitment/dashboard')}
                          >
                            Recruitment Dashboard
                          </a>
                        )}

                        <a
                          href="/student-portal"
                          className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                          onClick={(event) => handleNavigate(event, '/student-portal')}
                        >
                          {t('nav.studentPortal')}
                        </a>
                        <a
                          href="/student-portal"
                          className="block text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                          onClick={(event) => handleNavigate(event, '/student-portal')}
                        >
                          My Applications
                        </a>
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
                        <a
                          href="/login"
                          className="block text-center text-purple-600 hover:text-purple-700 px-3 py-2 rounded transition font-medium"
                          onClick={(event) => handleNavigate(event, '/login')}
                        >
                          Login
                        </a>
                        <a
                          href="/register"
                          className="block text-center bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition"
                          onClick={(event) => handleNavigate(event, '/register')}
                        >
                          Sign Up
                        </a>
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
