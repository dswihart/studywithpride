"use client"

import { useState, useEffect } from "react"

interface VisaSetting {
  weeks: number
  notes: string
}

interface VisaSettingsData {
  settings: Record<string, VisaSetting>
  defaultWeeks: number
  urgentThresholdWeeks: number
}

export default function VisaSettings() {
  const [settings, setSettings] = useState<VisaSettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editingCountry, setEditingCountry] = useState<string | null>(null)
  const [newCountry, setNewCountry] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/recruiter/visa-settings")
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
      } else {
        setError(data.error || "Failed to load settings")
      }
    } catch (err) {
      setError("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const updateCountry = async (country: string, weeks: number, notes: string) => {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/recruiter/visa-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, weeks, notes })
      })
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
        setSuccess(`Updated ${country}`)
        setTimeout(() => setSuccess(""), 2000)
        setEditingCountry(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const addCountry = async () => {
    if (!newCountry.trim()) return
    await updateCountry(newCountry.trim(), settings?.defaultWeeks || 5, "")
    setNewCountry("")
  }

  const updateGlobalSetting = async (key: "defaultWeeks" | "urgentThresholdWeeks", value: number) => {
    setSaving(true)
    try {
      const res = await fetch("/api/recruiter/visa-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value })
      })
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
      }
    } catch (err) {
      setError("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!settings) {
    return <div className="p-6 text-red-500">{error || "Failed to load settings"}</div>
  }

  const sortedCountries = Object.entries(settings.settings).sort((a, b) =>
    a[0].localeCompare(b[0])
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🛂</span> Visa Processing Times
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Set estimated visa processing weeks per country to prioritize leads
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Global Settings */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Global Settings</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Default (new countries)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="20"
                value={settings.defaultWeeks}
                onChange={(e) => updateGlobalSetting("defaultWeeks", parseInt(e.target.value) || 5)}
                className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-sm text-gray-500">weeks</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Urgent threshold</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="20"
                value={settings.urgentThresholdWeeks}
                onChange={(e) => updateGlobalSetting("urgentThresholdWeeks", parseInt(e.target.value) || 8)}
                className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-sm text-gray-500">weeks (flag as urgent)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Country List */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Countries</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add country..."
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCountry()}
              className="w-32 sm:w-40 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={addCountry}
              disabled={!newCountry.trim()}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>

        {/* Mobile-friendly card layout */}
        <div className="space-y-2">
          {sortedCountries.map(([country, data]) => (
            <div
              key={country}
              className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg border transition-colors ${
                editingCountry === country
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              {/* Country name */}
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-900 dark:text-white">{country}</span>
                {data.notes && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({data.notes})</span>
                )}
              </div>

              {/* Weeks input */}
              <div className="flex items-center gap-2">
                {editingCountry === country ? (
                  <>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      defaultValue={data.weeks}
                      id={`weeks-${country}`}
                      className="w-16 px-2 py-1 text-center rounded border border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Notes..."
                      defaultValue={data.notes}
                      id={`notes-${country}`}
                      className="flex-1 sm:w-32 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => {
                        const weeksEl = document.getElementById(`weeks-${country}`) as HTMLInputElement
                        const notesEl = document.getElementById(`notes-${country}`) as HTMLInputElement
                        updateCountry(country, parseInt(weeksEl.value) || data.weeks, notesEl.value)
                      }}
                      disabled={saving}
                      className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCountry(null)}
                      className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      data.weeks >= settings.urgentThresholdWeeks
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : data.weeks >= 6
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    }`}>
                      {data.weeks} weeks
                    </span>
                    <button
                      onClick={() => setEditingCountry(country)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Color Legend:</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Quick (1-5 weeks)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              Moderate (6-7 weeks)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              Slow (8+ weeks)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
