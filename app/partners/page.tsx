'use client'

import { useIntl } from '@/components/IntlProvider'
import enMessages from '@/messages/en.json'

export default function PartnersPage() {
  let t: (key: string) => string

  try {
    const intl = useIntl()
    t = intl.t
  } catch (error) {
    // SSR fallback: use English messages directly
    t = (key: string) => {
      const keys = key.split('.')
      let value: any = enMessages
      for (const k of keys) {
        value = value?.[k]
      }
      return value || key
    }
  }

  const mainPartner = {
    name: "C3S Business School",
    logo: "🎓",
    location: "Barcelona, Spain",
    description: "International business school with over a decade of experience, ranked #1 for student satisfaction with 97% employment rate within 6 months of graduation.",
    lgbtqFriendly: true,
    featured: true,
    programs: [
      "Global MBA",
      "MBA with Project Management",
      "Bachelor in Business Management",
      "Bachelor in Business Computing & Information Systems",
      "Bachelor in Business Tourism",
      "Doctorate of Business Administration (DBA)"
    ],
    highlights: [
      "97% employment rate within 6 months",
      "LGBTQ+-friendly campus environment",
      "International student community",
      "Located in Barcelona city center",
      "Over 10 years of experience"
    ],
    website: "https://csss.es",
    applicationLink: "/student-portal"
  }

  const otherPartners = []

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('partners.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('partners.subtitle')}
          </p>
        </div>

        {/* Featured Partner - C3S Business School */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-white/10 backdrop-blur-sm p-8 md:p-12">
              <div className="flex items-center mb-6">
                <span className="text-6xl mr-4">{mainPartner.logo}</span>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      {mainPartner.name}
                    </h2>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-white">
                      {t('partners.featuredPartner')}
                    </span>
                  </div>
                  <p className="text-purple-100 text-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {mainPartner.location}
                  </p>
                </div>
              </div>

              <p className="text-white text-lg mb-8 leading-relaxed">
                {mainPartner.description}
              </p>

              {/* Programs */}
              <div className="bg-white rounded-2xl p-6 mb-8">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">📚</span>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Programs Offered
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {mainPartner.programs.map((program, idx) => (
                    <div key={idx} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{program}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Why Choose C3S Business School</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {mainPartner.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center text-white">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <a
                  href={mainPartner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {t('partners.visitWebsite')}
                </a>
                <a
                  href={mainPartner.applicationLink}
                  className="inline-flex items-center px-6 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('partners.applyNow')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Application Process Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold mb-6">{t('partners.readyToApply')}</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-bold mb-2">{t('partners.step1Title')}</h3>
              <p className="text-purple-100">
                {t('partners.step1Description')}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-xl font-bold mb-2">{t('partners.step2Title')}</h3>
              <p className="text-purple-100">
                {t('partners.step2Description')}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl mb-3">✈️</div>
              <h3 className="text-xl font-bold mb-2">{t('partners.step3Title')}</h3>
              <p className="text-purple-100">
                {t('partners.step3Description')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href="/visa"
              className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('partners.visaGuide')}
            </a>
            <a
              href="/cost-calculator"
              className="inline-flex items-center px-6 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('partners.costCalculator')}
            </a>
            <a
              href="/student-portal"
              className="inline-flex items-center px-6 py-3 bg-purple-800 text-white font-semibold rounded-lg hover:bg-purple-900 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t('partners.studentPortal')}
            </a>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-12 bg-blue-50 border-2 border-blue-400 rounded-2xl p-8">
          <div className="flex items-start">
            <svg className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                {t('partners.needHelp')}
              </h3>
              <p className="text-blue-800 mb-4">
                {t('partners.helpDescription')}
              </p>
              <a
                href="/student-portal"
                className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition"
              >
                {t('partners.getGuidance')}
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}