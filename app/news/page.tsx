'use client'

import { useIntl } from '@/components/IntlProvider'
import enMessages from '@/messages/en.json'

export default function NewsPage() {
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

  // Placeholder news articles - replace with real data later
  const newsArticles = [
    {
      id: 1,
      title: 'Welcome to Study With Pride News',
      university: 'Study With Pride',
      date: '2024-01-15',
      excerpt: 'Stay updated with the latest news from our partner universities and important announcements for LGBTQ+ students studying in Spain.',
      imageUrl: '/placeholder-news.jpg',
      category: 'Announcement'
    },
    // Add more articles here as needed
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            University News & Updates
          </h1>
          <p className="text-xl text-gray-600">
            Latest news from our partner universities and important updates for students
          </p>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              {/* Article Image Placeholder */}
              <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                <span className="text-white text-6xl">📰</span>
              </div>

              {/* Article Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    {article.category}
                  </span>
                  <span className="text-sm text-gray-500">{article.date}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {article.title}
                </h3>

                <p className="text-sm text-purple-600 font-medium mb-3">
                  {article.university}
                </p>

                <p className="text-gray-600 text-sm mb-4">
                  {article.excerpt}
                </p>

                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center">
                  Read More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Placeholder for more news */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-dashed border-gray-300 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="text-gray-400 text-5xl mb-4">➕</div>
              <p className="text-gray-500 font-medium">More news coming soon</p>
              <p className="text-gray-400 text-sm mt-2">Check back for updates from our partner universities</p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Stay Informed</h3>
              <p className="text-blue-800 text-sm">
                This page will be regularly updated with news, announcements, and important information from our partner universities.
                Be sure to check back often for the latest updates on programs, events, and opportunities for LGBTQ+ students in Spain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
