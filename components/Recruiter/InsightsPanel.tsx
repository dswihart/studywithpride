/**
 * InsightsPanel Component
 * Displays recruitment insights by country, contact method, outcomes, and readiness
 */

"use client"

import { useState, useEffect } from 'react'

interface CountryInsight {
  country: string
  total_leads: number
  contacted: number
  interested: number
  qualified: number
  converted: number
  contact_rate: number
  interest_rate: number
  conversion_rate: number
  avg_lead_score: number
}

interface ContactMethodInsight {
  method: string
  total_contacts: number
  leads_interested: number
  leads_converted: number
  success_rate: number
  conversion_rate: number
}

interface OutcomeInsight {
  outcome: string
  count: number
  led_to_interested: number
  led_to_converted: number
  success_rate: number
}

interface ReadinessInsight {
  field: string
  label: string
  total_assessed: number
  positive_count: number
  positive_rate: number
  converted_with_positive: number
  conversion_rate_with_positive: number
  converted_with_negative: number
  conversion_rate_with_negative: number
}

interface IntakeInsight {
  intake: string
  total_leads: number
  interested: number
  qualified: number
  converted: number
  conversion_rate: number
  ready_to_proceed: number
}

interface ReadinessSummary {
  total_assessed: number
  ready_to_proceed: number
  ready_rate: number
  avg_readiness_score: number
  common_blockers: string[]
}

interface InsightsData {
  period: string
  summary: {
    total_leads: number
    total_contacted: number
    total_interested: number
    total_converted: number
    overall_contact_rate: number
    overall_conversion_rate: number
  }
  readiness_summary: ReadinessSummary
  country_insights: CountryInsight[]
  contact_method_insights: ContactMethodInsight[]
  outcome_insights: OutcomeInsight[]
  readiness_insights: ReadinessInsight[]
  intake_insights: IntakeInsight[]
  key_insights: string[]
}

type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'all'
type SectionType = 'country' | 'method' | 'outcome' | 'readiness' | 'intake'

interface InsightsPanelProps {
  className?: string
}

export default function InsightsPanel({ className = '' }: InsightsPanelProps) {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<PeriodType>('month')
  const [activeSection, setActiveSection] = useState<SectionType>('readiness')

  useEffect(() => {
    fetchData()
  }, [period])

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/recruiter/recruitment-insights?period=${period}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError(json.error || 'Failed to load insights')
      }
    } catch (err) {
      setError('Failed to fetch insights data')
    } finally {
      setLoading(false)
    }
  }

  const getConversionColor = (rate: number) => {
    if (rate >= 15) return 'text-green-600 dark:text-green-400'
    if (rate >= 8) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getSuccessColor = (rate: number) => {
    if (rate >= 40) return 'text-green-600 dark:text-green-400'
    if (rate >= 20) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getReadinessColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600 dark:text-green-400'
    if (rate >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getBarWidth = (value: number, max: number) => {
    return max > 0 ? Math.max(5, (value / max) * 100) : 0
  }

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No insights data available</p>
      </div>
    )
  }

  const maxCountryLeads = Math.max(...data.country_insights.map(c => c.total_leads), 1)
  const maxMethodContacts = Math.max(...data.contact_method_insights.map(m => m.total_contacts), 1)
  const maxOutcomeCount = Math.max(...data.outcome_insights.map(o => o.count), 1)
  

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recruitment Insights</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Analyze success rates, readiness, and conversion patterns
          </p>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['day', 'week', 'month', 'quarter', 'all'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-sm rounded-md transition ${
                period === p
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Readiness Summary Cards */}
      {data.readiness_summary && data.readiness_summary.total_assessed > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Lead Readiness Overview
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{data.readiness_summary.total_assessed}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Leads Assessed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{data.readiness_summary.ready_to_proceed}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Ready to Proceed</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${getReadinessColor(data.readiness_summary.ready_rate)}`}>
                {data.readiness_summary.ready_rate}%
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Ready Rate</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${getReadinessColor(data.readiness_summary.avg_readiness_score)}`}>
                {data.readiness_summary.avg_readiness_score}%
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Avg Readiness</p>
            </div>
          </div>
          {data.readiness_summary.common_blockers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                <span className="font-semibold">Common Blockers:</span> {data.readiness_summary.common_blockers.join(", ")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Key Insights Banner */}
      {data.key_insights.length > 0 && (
        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Insights
          </h4>
          <ul className="space-y-1">
            {data.key_insights.map((insight, i) => (
              <li key={i} className="text-sm text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                <span className="text-indigo-500 mt-1">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.summary.total_leads}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Leads</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{data.summary.overall_contact_rate}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Contact Rate</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{data.summary.total_interested}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Interested</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{data.summary.overall_conversion_rate}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Conversion Rate</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        <button
          onClick={() => setActiveSection('readiness')}
          className={`px-4 py-2 text-sm rounded-lg transition ${
            activeSection === 'readiness'
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Readiness Checklist
        </button>
        <button
          onClick={() => setActiveSection('intake')}
          className={`px-4 py-2 text-sm rounded-lg transition ${
            activeSection === 'intake'
              ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          By Intake
        </button>
        <button
          onClick={() => setActiveSection('country')}
          className={`px-4 py-2 text-sm rounded-lg transition ${
            activeSection === 'country'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          By Country
        </button>
        <button
          onClick={() => setActiveSection('method')}
          className={`px-4 py-2 text-sm rounded-lg transition ${
            activeSection === 'method'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          By Contact Method
        </button>
        <button
          onClick={() => setActiveSection('outcome')}
          className={`px-4 py-2 text-sm rounded-lg transition ${
            activeSection === 'outcome'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          By Outcome
        </button>
        
      </div>

      {/* Readiness Checklist Insights */}
      {activeSection === 'readiness' && (
        <div className="space-y-3">
          {data.readiness_insights && data.readiness_insights.length > 0 ? (
            <>
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
                <div className="col-span-4">Checklist Item</div>
                <div className="col-span-2 text-center">Assessed</div>
                <div className="col-span-2 text-center">Yes %</div>
                <div className="col-span-2 text-center">Conv (Yes)</div>
                <div className="col-span-2 text-center">Conv (No)</div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.readiness_insights.map((item) => (
                  <div
                    key={item.field}
                    className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                  >
                    <div className="col-span-4">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</span>
                      <div className="mt-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.positive_rate >= 70 ? 'bg-green-500' :
                            item.positive_rate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.positive_rate}%` }}
                        />
                      </div>
                    </div>
                    <div className="col-span-2 text-center text-sm text-gray-700 dark:text-gray-300">
                      {item.total_assessed}
                    </div>
                    <div className={`col-span-2 text-center text-sm font-semibold ${getReadinessColor(item.positive_rate)}`}>
                      {item.positive_rate}%
                      <span className="text-xs text-gray-400 ml-1">({item.positive_count})</span>
                    </div>
                    <div className={`col-span-2 text-center text-sm font-medium ${getConversionColor(item.conversion_rate_with_positive)}`}>
                      {item.conversion_rate_with_positive}%
                    </div>
                    <div className={`col-span-2 text-center text-sm font-medium ${getConversionColor(item.conversion_rate_with_negative)}`}>
                      {item.conversion_rate_with_negative}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                <p><strong>Conv (Yes):</strong> Conversion rate when item is checked YES</p>
                <p><strong>Conv (No):</strong> Conversion rate when item is checked NO</p>
                <p className="mt-1">Higher conversion with "Yes" indicates this factor positively correlates with success.</p>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No readiness data available yet. Complete readiness checklists during contact logging to see insights.
            </p>
          )}
        </div>
      )}

      {/* Intake Insights */}
      {activeSection === 'intake' && (
        <div className="space-y-3">
          {data.intake_insights && data.intake_insights.length > 0 ? (
            <>
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
                <div className="col-span-3">Intake Period</div>
                <div className="col-span-2 text-center">Leads</div>
                <div className="col-span-2 text-center">Interested</div>
                <div className="col-span-2 text-center">Converted</div>
                <div className="col-span-3 text-center">Ready to Go</div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.intake_insights.map((intake) => (
                  <div
                    key={intake.intake}
                    className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                  >
                    <div className="col-span-3">
                      <span className="font-medium text-gray-900 dark:text-white">{intake.intake}</span>
                    </div>
                    <div className="col-span-2 text-center text-sm text-gray-700 dark:text-gray-300">
                      {intake.total_leads}
                    </div>
                    <div className="col-span-2 text-center text-sm text-purple-600">
                      {intake.interested + intake.qualified}
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`text-sm font-bold ${getConversionColor(intake.conversion_rate)}`}>
                        {intake.converted}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">({intake.conversion_rate}%)</span>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {intake.ready_to_proceed}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No intake data available yet
            </p>
          )}
        </div>
      )}

      {/* Country Insights */}
      {activeSection === 'country' && (
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
            <div className="col-span-4">Country</div>
            <div className="col-span-2 text-center">Leads</div>
            <div className="col-span-2 text-center">Contacted</div>
            <div className="col-span-2 text-center">Interest %</div>
            <div className="col-span-2 text-center">Conv %</div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.country_insights.map((country, i) => (
              <div
                key={country.country}
                className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
              >
                <div className="col-span-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-400 w-5">{i + 1}</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate">{country.country}</span>
                  </div>
                  <div className="ml-7 mt-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${getBarWidth(country.total_leads, maxCountryLeads)}%` }}
                    />
                  </div>
                </div>
                <div className="col-span-2 text-center text-sm text-gray-700 dark:text-gray-300">
                  {country.total_leads}
                </div>
                <div className="col-span-2 text-center text-sm text-gray-700 dark:text-gray-300">
                  {country.contacted} <span className="text-gray-400">({country.contact_rate}%)</span>
                </div>
                <div className={`col-span-2 text-center text-sm font-medium ${getSuccessColor(country.interest_rate)}`}>
                  {country.interest_rate}%
                </div>
                <div className={`col-span-2 text-center text-sm font-bold ${getConversionColor(country.conversion_rate)}`}>
                  {country.conversion_rate}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Method Insights */}
      {activeSection === 'method' && (
        <div className="space-y-4">
          {data.contact_method_insights.map((method) => (
            <div
              key={method.method}
              className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {method.method === 'Phone Call' ? '📞' :
                     method.method === 'WhatsApp' ? '💬' :
                     method.method === 'Email' ? '📧' : '📱'}
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{method.method}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {method.total_contacts} contacts made
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getSuccessColor(method.success_rate)}`}>
                    {method.success_rate}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">success rate</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{method.leads_interested}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Led to Interest</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-green-600">{method.leads_converted}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Converted</p>
                </div>
                <div>
                  <p className={`text-lg font-semibold ${getConversionColor(method.conversion_rate)}`}>
                    {method.conversion_rate}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Conv. Rate</p>
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                  style={{ width: `${method.success_rate}%` }}
                />
              </div>
            </div>
          ))}
          {data.contact_method_insights.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No contact method data available yet
            </p>
          )}
        </div>
      )}

      {/* Outcome Insights */}
      {activeSection === 'outcome' && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.outcome_insights.map((outcome) => (
            <div
              key={outcome.outcome}
              className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{outcome.outcome}</p>
                <div className="mt-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${getBarWidth(outcome.count, maxOutcomeCount)}%` }}
                  />
                </div>
              </div>
              <div className="text-right flex-shrink-0 w-20">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{outcome.count}x</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">occurrences</p>
              </div>
              <div className="text-right flex-shrink-0 w-24">
                <p className={`text-sm font-bold ${getSuccessColor(outcome.success_rate)}`}>
                  {outcome.success_rate}% success
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {outcome.led_to_interested} interested
                </p>
              </div>
            </div>
          ))}
          {data.outcome_insights.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No outcome data available yet
            </p>
          )}
        </div>
      )}
    </div>
  )
}
