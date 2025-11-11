'use client'

import { useState } from 'react'

export default function DataEditorPage() {
  const [selectedType, setSelectedType] = useState<'visa' | 'financial'>('visa')
  const [jsonData, setJsonData] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    try {
      const data = JSON.parse(jsonData)

      const response = await fetch('/api/admin/write-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, data })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMessage(result.message || 'Data saved successfully!')
        setJsonData('')
      } else {
        setError(result.error || 'Failed to save data')
      }
    } catch (err) {
      setError('Invalid JSON format or network error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-300 mb-1">Development Environment Only</h3>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">This admin interface only works in development mode. It will return 403 Forbidden in production.</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Admin Data Editor
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Data Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'visa' | 'financial')}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="visa">Visa Requirements</option>
                <option value="financial">Financial Proof Data</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                JSON Data
              </label>
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder="{example: data}"
                rows={15}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {message && (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200">{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg transition"
            >
              Save Data
            </button>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">Usage Instructions</h3>
          <ul className="list-disc ml-6 space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li>Select the data type you want to edit (Visa Requirements or Financial Proof)</li>
            <li>Enter valid JSON data in the text area</li>
            <li>Click Save Data to update the local JSON files</li>
            <li>This endpoint is protected and will only work in development environment</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
