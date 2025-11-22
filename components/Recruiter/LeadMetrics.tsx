/**
 * Story 5.1-B: Lead Metrics Component
 * Displays aggregate metrics for recruitment leads
 */

"use client"

import { useLanguage } from '@/components/LanguageContext'
import { UsersIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface Lead {
  id: string
  country: string
  contact_status: string
  last_contact_date: string | null
  notes: string | null
  created_at: string
}

interface LeadMetricsProps {
  leads: Lead[]
}

export default function LeadMetrics({ leads }: LeadMetricsProps) {
  const { t } = useLanguage()
  // Calculate total leads
  const totalLeads = leads.length

  // Calculate leads by country
  const leadsByCountry = leads.reduce((acc, lead) => {
    acc[lead.country] = (acc[lead.country] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate total contacted (any status other than 'not_contacted')
  const totalContacted = leads.filter(
    lead => lead.contact_status !== 'not_contacted'
  ).length

  return (
    <div className="mb-8 space-y-4">
      {/* Top Row: Total Leads and Total Contacted - Smaller and Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Leads Card */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('recruiter.metrics.totalLeads')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalLeads}</p>
            </div>
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 text-blue-600 dark:text-blue-400">
              <UsersIcon className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Total Contacted Card */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('recruiter.metrics.totalContacted')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalContacted}</p>
            </div>
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 text-green-600 dark:text-green-400">
              <CheckCircleIcon className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {totalLeads > 0 ? Math.round((totalContacted / totalLeads) * 100) : 0}% {t('recruiter.metrics.percentOfTotal')}
          </p>
        </div>
      </div>

      {/* Bottom Row: Leads by Country - Full Width */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-4">
          {t('recruiter.metrics.leadsByCountry')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Object.entries(leadsByCountry)
            .sort(([, a], [, b]) => b - a)
            .map(([country, count]) => (
              <div key={country} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded px-3 py-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {country}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white ml-2">
                  {count}
                </span>
              </div>
            ))}
          {Object.keys(leadsByCountry).length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 col-span-full">{t('recruiter.metrics.noData')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
