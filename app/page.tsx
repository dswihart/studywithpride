"use client"

import Link from 'next/link'
import { useIntl } from '@/components/IntlProvider'
import enMessages from '@/messages/en.json'

export default function Home() {
  // Default SSR fallback using English translations
  let t = (key: string): string => {
    const keys = key.split('.')
    let value: any = enMessages
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
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

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {t('home.heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/safety"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                {t('home.learnSafety')}
              </Link>
              <Link
                href="/visa"
                className="bg-transparent border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition"
              >
                {t('home.startApplication')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Barcelona Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">{t('home.whyBarcelona')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🏳️‍🌈</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('home.lgbtqFriendly')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.lgbtqDesc')}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('home.worldClass')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.worldClassDesc')}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('home.affordable')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.affordableDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">{t('home.planJourney')}</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Link href="/visa" className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <h3 className="text-xl font-semibold mb-3 text-purple-600 dark:text-purple-400">📋 {t('home.visaGuide')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.visaDesc')}
              </p>
            </Link>
            <Link href="/cost-calculator" className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <h3 className="text-xl font-semibold mb-3 text-purple-600 dark:text-purple-400">💵 {t('home.costCalc')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.costCalcDesc')}
              </p>
            </Link>
            <Link href="/courses" className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <h3 className="text-xl font-semibold mb-3 text-purple-600 dark:text-purple-400">📚 {t('home.courses')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.coursesDesc')}
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">{t('home.readyTitle')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t('home.readyDesc')}
          </p>
          <Link
            href="/student-portal"
            className="bg-white text-purple-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition inline-block"
          >
            {t('home.createAccount')}
          </Link>
        </div>
      </section>
    </main>
  )
}
