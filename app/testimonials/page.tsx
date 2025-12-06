'use client'

import Footer from '@/components/layout/Footer'
import enMessages from '@/messages/en.json'
import { useIntl } from '@/components/IntlProvider'
import { useState } from 'react'

export default function TestimonialsPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>('all')

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

  const testimonials = [
    {
      id: 1,
      name: 'Maria Rodriguez',
      country: 'Mexico',
      flag: '🇲🇽',
      program: 'Master in Digital Marketing',
      university: 'UPF Barcelona',
      year: '2023',
      quote: 'Barcelona has been incredibly welcoming. The LGBTQ+ community here is vibrant and supportive. I feel safe being myself every day.',
      image: '👩‍🎓'
    },
    {
      id: 2,
      name: 'Carlos Silva',
      country: 'Brazil',
      flag: '🇧🇷',
      program: 'MBA International Business',
      university: 'ESADE',
      year: '2024',
      quote: 'Coming from Brazil, I was worried about acceptance. But Barcelona exceeded all my expectations. The city celebrates diversity!',
      image: '👨‍💼'
    },
    {
      id: 3,
      name: 'Ana Lucia Martinez',
      country: 'Colombia',
      flag: '🇨🇴',
      program: 'Bachelor in Design',
      university: 'IED Barcelona',
      year: '2023',
      quote: 'The support from Study With Pride made my transition seamless. They understood my concerns as a trans student and addressed each one.',
      image: '👩‍🎨'
    },
    {
      id: 4,
      name: 'Diego Fernandez',
      country: 'Argentina',
      flag: '🇦🇷',
      program: 'Computer Science',
      university: 'UAB',
      year: '2022',
      quote: 'Barcelona tech scene is amazing and inclusive. I found my community both in university and in the startup ecosystem.',
      image: '👨‍💻'
    },
    {
      id: 5,
      name: 'Isabella Costa',
      country: 'Chile',
      flag: '🇨🇱',
      program: 'Architecture',
      university: 'UPC',
      year: '2024',
      quote: 'The city architecture inspired me daily, but what truly made the difference was finding a community that accepts me completely.',
      image: '👩‍🏫'
    },
    {
      id: 6,
      name: 'Juan Pablo',
      country: 'Peru',
      flag: '🇵🇪',
      program: 'Culinary Arts',
      university: 'Hofmann Barcelona',
      year: '2023',
      quote: 'Barcelona food scene is incredible, but the real feast is the freedom to be yourself. I have never felt more at home.',
      image: '👨‍🍳'
    }
  ]

  const countries = ['all', 'Mexico', 'Brazil', 'Colombia', 'Argentina', 'Chile', 'Peru']

  const filteredTestimonials = selectedCountry === 'all'
    ? testimonials
    : testimonials.filter(t => t.country === selectedCountry)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('testimonials.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('testimonials.subtitle')}
            </p>
          </div>

          {/* Country Filter */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-lg shadow-sm bg-white dark:bg-gray-900 p-1" role="group">
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                    selectedCountry === country
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-purple-900/40'
                  }`}
                >
                  {country === 'all' ? t('testimonials.allCountries') : country}
                </button>
              ))}
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start mb-4">
                  <div className="text-4xl mr-4">{testimonial.image}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {testimonial.flag} {testimonial.country}
                    </p>
                    <p className="text-xs text-purple-600 font-medium mt-1">
                      {testimonial.program}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.university}</p>
                  </div>
                </div>

                <blockquote className="text-gray-700 dark:text-gray-300 italic mb-4">
                  "{testimonial.quote}"
                </blockquote>

                <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  Class of {testimonial.year}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <section className="mt-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg p-12 text-white">
            <h2 className="text-3xl font-bold text-center mb-8">
              {t('testimonials.ourImpact')}
            </h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold">500+</div>
                <div className="text-sm opacity-90">{t('testimonials.studentsHelped')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold">15</div>
                <div className="text-sm opacity-90">{t('testimonials.countriesServed')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold">98%</div>
                <div className="text-sm opacity-90">{t('testimonials.satisfaction')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold">25+</div>
                <div className="text-sm opacity-90">{t('testimonials.partnerUniversities')}</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('testimonials.readyToJoin')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {t('testimonials.startYourJourney')}
            </p>
            <a
              href="/register"
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              {t('testimonials.applyNow')}
            </a>
          </section>
      </div>
    </div>
  )
}
