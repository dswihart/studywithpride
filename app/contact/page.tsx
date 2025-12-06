'use client'

import { useIntl } from '@/components/IntlProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import enMessages from '@/messages/en.json'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    subject: 'general',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would normally send the form data to your API
    // For now, we'll just simulate a submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('contact.thankYou')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('contact.messageReceived')}
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setFormData({
                  name: '',
                  email: '',
                  country: '',
                  subject: 'general',
                  message: ''
                })
              }}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {t('contact.sendAnother')}
            </button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  {t('contact.getInTouch')}
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-purple-600 text-2xl">📧</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t('contact.email')}</h3>
                      <p className="text-gray-600 dark:text-gray-300">info@studywithpride.com</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('contact.emailResponse')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="text-purple-600 text-2xl">📱</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t('contact.whatsapp')}</h3>
                      <p className="text-gray-600 dark:text-gray-300">+34 600 123 456</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('contact.whatsappHours')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="text-purple-600 text-2xl">📍</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t('contact.office')}</h3>
                      <p className="text-gray-600 dark:text-gray-300">Barcelona, Spain</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('contact.virtualMeetings')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="text-purple-600 text-2xl">🌐</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t('contact.socialMedia')}</h3>
                      <div className="flex space-x-4 mt-2">
                        <a href="#" className="text-purple-600 hover:text-purple-500">Facebook</a>
                        <a href="#" className="text-purple-600 hover:text-purple-500">Instagram</a>
                        <a href="#" className="text-purple-600 hover:text-purple-500">LinkedIn</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-100 dark:bg-purple-950/40 rounded-lg p-8">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-4">
                  {t('contact.faq')}
                </h3>
                <ul className="space-y-3 text-purple-800 dark:text-purple-100">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('contact.faqVisa')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('contact.faqCost')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('contact.faqHousing')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('contact.faqSafety')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('contact.sendMessage')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('contact.yourName')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('contact.yourEmail')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('contact.yourCountry')} *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('contact.subject')} *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="general">{t('contact.subjectGeneral')}</option>
                    <option value="visa">{t('contact.subjectVisa')}</option>
                    <option value="academic">{t('contact.subjectAcademic')}</option>
                    <option value="housing">{t('contact.subjectHousing')}</option>
                    <option value="safety">{t('contact.subjectSafety')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('contact.yourMessage')} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  {t('contact.sendButton')}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {t('contact.privacy')}
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
