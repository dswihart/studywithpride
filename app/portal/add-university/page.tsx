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

  // Modal state for intake selection
  const [showIntakeModal, setShowIntakeModal] = useState(false)
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  const [selectedIntake, setSelectedIntake] = useState('')

  const locations = ['all', 'Barcelona', 'Madrid', 'Valencia']

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uni.shortName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = selectedLocation === 'all' || uni.location === selectedLocation
    return matchesSearch && matchesLocation
  })

  // Get available intakes for a university
  const getAvailableIntakes = (university: University): string[] => {
    const intakeMonths = new Set<string>()

    // Get intake months from program details
    if (university.programDetails) {
      university.programDetails.forEach(program => {
        if (program.intakes) {
          program.intakes.forEach(intake => intakeMonths.add(intake))
        }
      })
    }

    // Default intake months if none specified (common university intakes)
    if (intakeMonths.size === 0) {
      intakeMonths.add('January')
      intakeMonths.add('September')
    }

    // Month name to number mapping
    const monthMap: Record<string, number> = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3,
      'May': 4, 'June': 5, 'July': 6, 'August': 7,
      'September': 8, 'October': 9, 'November': 10, 'December': 11
    }

    const now = new Date()
    const currentYear = now.getFullYear()

    // Minimum 1 month lead time
    const minDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Generate future intakes only
    const futureIntakes: { label: string; date: Date }[] = []

    intakeMonths.forEach(monthName => {
      const monthNum = monthMap[monthName]
      if (monthNum === undefined) return

      // Check current year
      const thisYearDate = new Date(currentYear, monthNum, 1)
      if (thisYearDate > minDate) {
        futureIntakes.push({
          label: `${monthName} ${currentYear}`,
          date: thisYearDate
        })
      }

      // Next year
      const nextYearDate = new Date(currentYear + 1, monthNum, 1)
      if (nextYearDate > minDate) {
        futureIntakes.push({
          label: `${monthName} ${currentYear + 1}`,
          date: nextYearDate
        })
      }

      // Year after
      const yearAfterDate = new Date(currentYear + 2, monthNum, 1)
      futureIntakes.push({
        label: `${monthName} ${currentYear + 2}`,
        date: yearAfterDate
      })
    })

    // Sort by date and return labels
    futureIntakes.sort((a, b) => a.date.getTime() - b.date.getTime())

    return futureIntakes.map(i => i.label)
  }

  const handleSelectUniversity = (university: University) => {
    setSelectedUniversity(university)
    setSelectedIntake('')
    setShowIntakeModal(true)
  }

  const handleAddUniversity = async () => {
    if (!selectedUniversity || !selectedIntake) return

    setAdding(selectedUniversity.id)

    try {
      const response = await fetch('/api/portal/add-university', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university_id: selectedUniversity.id,
          university_name: selectedUniversity.name,
          program_name: '',
          intake_term: selectedIntake,
          application_status: 'draft',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/portal/university/${result.data.id}`)
      } else {
        alert('Failed to add university. Please try again.')
      }
    } catch (error) {
      console.error('Error adding university:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setAdding(null)
      setShowIntakeModal(false)
      setSelectedUniversity(null)
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
                  onClick={() => handleSelectUniversity(university)}
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

      {/* Intake Selection Modal */}
      {showIntakeModal && selectedUniversity && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowIntakeModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <button
                onClick={() => setShowIntakeModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Select Your Start Date
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  When would you like to start at <strong>{selectedUniversity.shortName}</strong>?
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {getAvailableIntakes(selectedUniversity).map((intake) => (
                  <button
                    key={intake}
                    onClick={() => setSelectedIntake(intake)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${
                      selectedIntake === intake
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${selectedIntake === intake ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {intake}
                      </span>
                      {selectedIntake === intake && (
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowIntakeModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUniversity}
                  disabled={!selectedIntake || adding === selectedUniversity.id}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding === selectedUniversity.id ? 'Adding...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
