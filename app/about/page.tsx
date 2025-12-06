"use client"

import { useIntl } from '@/components/IntlProvider'
import enMessages from '@/messages/en.json'

export default function AboutPage() {
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          {t('about.title')}
        </h1>

        {/* Mission Statement */}
        <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <span className="text-6xl">🏳️‍🌈</span>
          </div>
          <h2 className="text-2xl font-semibold text-purple-600 mb-4 text-center">
            {t('about.missionTitle')}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t('about.missionText1')}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {t('about.missionText2')}
          </p>
        </section>

        {/* Why Barcelona */}
        <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-purple-600 mb-4">
            {t('about.whyBarcelona')}
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🌍</span>
              <div>
                <h3 className="font-semibold text-gray-900">{t('about.diversity')}</h3>
                <p className="text-gray-700">{t('about.diversityText')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎓</span>
              <div>
                <h3 className="font-semibold text-gray-900">{t('about.education')}</h3>
                <p className="text-gray-700">{t('about.educationText')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">❤️</span>
              <div>
                <h3 className="font-semibold text-gray-900">{t('about.community')}</h3>
                <p className="text-gray-700">{t('about.communityText')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-purple-600 mb-6">
            {t('about.ourValues')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">{t('about.safety')}</h3>
              <p className="text-gray-700 text-sm">{t('about.safetyText')}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">{t('about.inclusion')}</h3>
              <p className="text-gray-700 text-sm">{t('about.inclusionText')}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">{t('about.support')}</h3>
              <p className="text-gray-700 text-sm">{t('about.supportText')}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">{t('about.excellence')}</h3>
              <p className="text-gray-700 text-sm">{t('about.excellenceText')}</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">{t('about.joinUs')}</h2>
          <p className="mb-6">{t('about.joinUsText')}</p>
          <a href="/register" className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition">
            {t('about.startJourney')}
          </a>
        </section>
      </div>
    </main>
  )
}
