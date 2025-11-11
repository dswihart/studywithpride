'use client'

import { useState } from 'react'
import { useIntl } from '@/components/IntlProvider'
import enMessages from '@/messages/en.json'
import { CostEstimate, LifestyleType } from '@/lib/types/cost'
import { cities } from '@/lib/data/cost-by-city'

export default function CostCalculatorPage() {
  // SSR fallback pattern
  let t: (key: string) => string
  try {
    const intl = useIntl()
    t = intl.t
  } catch {
    t = (key: string) => {
      const keys = key.split('.')
      let value: any = enMessages
      for (const k of keys) {
        value = value?.[k]
      }
      return value || key
    }
  }

  const [selectedLifestyle, setSelectedLifestyle] = useState<LifestyleType>('moderate')
  const [selectedCity, setSelectedCity] = useState('barcelona')
  const [estimate, setEstimate] = useState<CostEstimate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCalculate = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/cost-estimate?lifestyle=${selectedLifestyle}&city=${selectedCity}`)
      const result = await response.json()

      if (response.ok && result.success) {
        setEstimate(result.data)
      } else {
        setError(result.error || t('costCalc.errorFailed'))
      }
    } catch (err) {
      setError(t('costCalc.errorNetwork'))
    } finally {
      setLoading(false)
    }
  }

  const lifestyleOptions = [
    { value: 'saver' as LifestyleType, label: t('costCalc.lifestyleSaverLabel'), emoji: '💰', desc: t('costCalc.lifestyleSaverDesc') },
    { value: 'moderate' as LifestyleType, label: t('costCalc.lifestyleModerateLabel'), emoji: '🎯', desc: t('costCalc.lifestyleModerateDesc') },
    { value: 'spender' as LifestyleType, label: t('costCalc.lifestyleSpenderLabel'), emoji: '✨', desc: t('costCalc.lifestyleSpenderDesc') }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('costCalc.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('costCalc.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Select Your City
          </h2>

          <div className="mb-8">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            >
              {cities.map((city) => (
                <option key={city.code} value={city.code}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('costCalc.selectLifestyle')}
          </h2>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {lifestyleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedLifestyle(option.value)}
                className={`p-6 rounded-xl border-2 transition ${
                  selectedLifestyle === option.value
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                <div className="text-4xl mb-2">{option.emoji}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {option.label}
                </div>
                <div className="text-sm text-gray-600">
                  {option.desc}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold text-lg rounded-lg shadow-lg transition"
          >
            {loading ? t('costCalc.calculating') : t('costCalc.calculateButton')}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6 mb-8">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {estimate && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white">
                <h3 className="text-lg font-semibold mb-2 opacity-90">{t('costCalc.monthlyTotal')}</h3>
                <p className="text-5xl font-bold">€{estimate.totalMonthly.toLocaleString()}</p>
                <p className="mt-2 opacity-90">{t('costCalc.perMonth')}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-xl p-8 text-white">
                <h3 className="text-lg font-semibold mb-2 opacity-90">{t('costCalc.yearlyTotal')}</h3>
                <p className="text-5xl font-bold">€{estimate.totalYearly.toLocaleString()}</p>
                <p className="mt-2 opacity-90">{t('costCalc.perYear')}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t('costCalc.monthlyBreakdown')}
              </h3>

              <div className="space-y-4">
                {estimate.categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {category.category}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-purple-600">
                        €{category[estimate.lifestyle]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">{t('costCalc.importantNotes')}</h3>
                  <ul className="list-disc ml-6 space-y-1 text-blue-800 text-sm">
                    <li>{t('costCalc.note1')}</li>
                    <li>{t('costCalc.note2')}</li>
                    <li>{t('costCalc.note3')}</li>
                    <li>{t('costCalc.note4')}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <a
                href="/financial-requirements"
                className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg rounded-lg shadow-lg transition"
              >
                {t('costCalc.viewFinancialRequirements')}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
