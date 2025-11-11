'use client'

import { useIntl } from '@/components/IntlProvider'
import enMessages from '@/messages/en.json'

export default function SafetyPage() {
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

  const testimonials = [
    {
      name: t('safety.testimonial1Name'),
      country: t('safety.testimonial1Country'),
      program: t('safety.testimonial1Program'),
      quote: t('safety.testimonial1Quote'),
      photo: "👨"
    },
    {
      name: t('safety.testimonial2Name'),
      country: t('safety.testimonial2Country'),
      program: t('safety.testimonial2Program'),
      quote: t('safety.testimonial2Quote'),
      photo: "🧑"
    }
  ]

  return (
    <main className="min-h-screen">
      <section className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">{t('safety.title')}</h1>
            <p className="text-xl">{t('safety.subtitle')}</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">{t('safety.studentStoriesTitle')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">{t.photo}</div>
                  <div>
                    <h3 className="font-semibold">{t.name}</h3>
                    <p className="text-sm text-gray-500">{t.country}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">{t.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
