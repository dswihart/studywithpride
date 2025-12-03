'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/components/LanguageContext'
import { universities, University } from '@/lib/data/universities'

export default function AddUniversityPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [adding, setAdding] = useState<string | null>(null)

  const locations = ['all', 'Barcelona', 'Madrid', 'Valencia']

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uni.shortName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = selectedLocation === 'all' || uni.location === selectedLocation
    return matchesSearch && matchesLocation
  })

  const handleAddUniversity = async (university: University) => {
    setAdding(university.id)

    try {
      const response = await fetch('/api/portal/add-university', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university_id: university.id,
          university_name: university.name,
          program_name: '', // Will be set later
          intake_term: 'Fall 2025',
          application_status: 'draft',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Navigate to the application detail page using the generated application ID
        router.push(`/portal/university/${result.data.id}`)
      } else {
        alert('Failed to add university. Please try again.')
      }
    } catch (error) {
      console.error('Error adding university:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setAdding(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/student-portal"
            className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center mb-4"
          >
            ← {t('backToPortal')}
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('addUniversity')}
          </h1>
          <p className="text-gray-600">
            Select a university to start your application
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Universities
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Location Filter */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Location
              </label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>
                    {loc === 'all' ? 'All Locations' : loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Universities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((university) => (
            <div
              key={university.id}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="p-6">
                {/* University Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {university.shortName}
                    </h3>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                      {university.location}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{university.name}</p>
                  <p className="text-sm text-gray-500">{university.description}</p>
                </div>

                {/* Programs */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Sample Programs:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {university.programs.slice(0, 3).map((program, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-purple-600 mr-1">•</span>
                        <span>{program}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => handleAddUniversity(university)}
                  disabled={adding === university.id}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                    adding === university.id
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {adding === university.id ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    'Add to My Applications'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredUniversities.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No universities found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
