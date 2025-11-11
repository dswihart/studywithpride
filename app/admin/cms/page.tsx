'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Testimonial {
  id: string
  name: string
  country: string
  program: string
  university: string
  content: string
  approved: boolean
  createdAt: string
}

export default function CMSAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/cms/testimonials', {
        credentials: 'include'
      })

      if (response.status === 401) {
        router.push('/admin/login')
        return
      }

      const result = await response.json()
      if (result.success) {
        setTestimonials(result.data)
      } else {
        setError(result.error || 'Failed to fetch testimonials')
      }
    } catch (err) {
      setError('An error occurred while fetching testimonials')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-blue-950">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            CMS Admin
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {testimonial.country} • {testimonial.program} at {testimonial.university}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {testimonial.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Status: {testimonial.approved ? 'Approved' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {testimonials.length === 0 && (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              No testimonials found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
