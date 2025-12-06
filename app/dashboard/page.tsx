'use client'

import Link from 'next/link'
import { useIntl } from '@/components/IntlProvider'
import { useState, useEffect } from 'react'
import enMessages from '@/messages/en.json'

export default function StudentPortalPage() {
  const [mounted, setMounted] = useState(false)
  
  // Default SSR fallback using English translations
  let t = (key: string): string => {
    const keys = key.split('.')
    let value: any = enMessages
    
    for (const k of keys) {
      if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, k)) {
        value = value[k]
      } else {
        return key
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  try {
    const intlContext = useIntl()
    t = intlContext.t
  } catch (error) {
    // During SSR, use English fallback defined above
  }

  useEffect(() => {
    setMounted(true)
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-purple-950">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('dashboard.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/application" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition group">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6 group-hover:scale-110 transition">
              <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('dashboard.applicationStatus')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('dashboard.applicationDesc')}
            </p>
          </Link>

          <Link href="/visa" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition group">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6 group-hover:scale-110 transition">
              <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('dashboard.visaGuidance')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('dashboard.visaDesc')}
            </p>
          </Link>

          <Link href="/cost-calculator" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition group">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6 group-hover:scale-110 transition">
              <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('dashboard.budgetCalculator')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('dashboard.budgetDesc')}
            </p>
          </Link>

          <Link href="/financial-requirements" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition group">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-pink-100 dark:bg-pink-900/30 mb-6 group-hover:scale-110 transition">
              <svg className="h-8 w-8 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('dashboard.financialReqs')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('dashboard.financialDesc')}
            </p>
          </Link>

          <Link href="/partners" className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition group">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-6 group-hover:scale-110 transition">
              <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('dashboard.partnerSchools')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('dashboard.partnersDesc')}
            </p>
          </Link>
        </div>

        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">{t('dashboard.needHelp')}</h3>
              <p className="text-lg mb-4">
                {t('dashboard.helpDesc')}
              </p>
              <Link 
                href="/contact" 
                className="inline-block px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                {t('dashboard.contactSupport')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
