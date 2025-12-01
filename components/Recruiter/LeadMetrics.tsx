/**
 * Enhanced Lead Metrics Component
 * Displays comprehensive recruitment analytics with funnel visualization
 */

"use client"

import { useLanguage } from '@/components/LanguageContext'
import { UsersIcon, CheckCircleIcon, PhoneIcon, StarIcon, ArrowTrendingUpIcon, ClockIcon } from '@heroicons/react/24/outline'

interface Lead {
  id: string
  country: string
  contact_status: string
  last_contact_date: string | null
  notes: string | null
  created_at: string
  lead_quality?: string | null
  recruit_priority?: number | null
  lead_score?: number | null
  phone_valid?: boolean | null
  referral_source?: string | null
}

interface LeadMetricsProps {
  leads: Lead[]
}

export default function LeadMetrics({ leads }: LeadMetricsProps) {
  const { t } = useLanguage()

  // Basic metrics
  const totalLeads = leads.length
  const totalContacted = leads.filter(lead => lead.contact_status !== 'not_contacted' || lead.referral_source).length
  // Funnel stages
  const funnel = {
    not_contacted: leads.filter(l => l.contact_status === 'not_contacted' && !l.referral_source).length,
    contacted: leads.filter(l => l.contact_status === 'contacted' || (l.contact_status === 'not_contacted' && l.referral_source)).length,
    interested: leads.filter(l => l.contact_status === 'interested').length,
    qualified: leads.filter(l => l.contact_status === 'qualified').length,
    unqualified: leads.filter(l => l.contact_status === 'unqualified').length,
  }

  // Lead quality distribution (case-insensitive)
  const qualityDist = {
    high: leads.filter(l => l.lead_quality?.toLowerCase() === 'high').length,
    medium: leads.filter(l => l.lead_quality?.toLowerCase() === 'medium').length,
    low: leads.filter(l => l.lead_quality?.toLowerCase() === 'low' || l.lead_quality?.toLowerCase() === 'very low').length,
  }

  // Leads by country
  const leadsByCountry = leads.reduce((acc, lead) => {
    acc[lead.country] = (acc[lead.country] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Leads by referral source
  const leadsBySource = leads.reduce((acc, lead) => {
    const source = lead.referral_source || 'Unknown'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Recent activity (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const recentLeads = leads.filter(l => new Date(l.created_at) > weekAgo).length
  const recentContacted = leads.filter(l => l.last_contact_date && new Date(l.last_contact_date) > weekAgo).length

  // Conversion rate
  // Average lead score
  const leadsWithScore = leads.filter(l => l.lead_score !== null && l.lead_score !== undefined)
  const avgLeadScore = leadsWithScore.length > 0
    ? Math.round(leadsWithScore.reduce((sum, l) => sum + (l.lead_score || 0), 0) / leadsWithScore.length)
    : 0

  return (
    <div className="mb-8 space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('recruiter.metrics.totalLeads')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLeads}</p>
            </div>
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 text-blue-600 dark:text-blue-400">
              <UsersIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('recruiter.metrics.totalContacted')}</p>
              <p className="text-2xl font-bold text-green-600">{totalContacted}</p>
            </div>
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2 text-green-600 dark:text-green-400">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {totalLeads > 0 ? Math.round((totalContacted / totalLeads) * 100) : 0}% reached
          </p>
        </div>

        

        

        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">This Week</p>
              <p className="text-2xl font-bold text-orange-600">{recentLeads}</p>
            </div>
            <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-2 text-orange-600 dark:text-orange-400">
              <ClockIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {recentContacted} contacted
          </p>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Avg Score</p>
              <p className="text-2xl font-bold text-indigo-600">{avgLeadScore}</p>
            </div>
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-2 text-indigo-600 dark:text-indigo-400">
              <ArrowTrendingUpIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {leadsWithScore.length} scored
          </p>
        </div>
      </div>

      {/* Funnel & Quality Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruitment Funnel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-4">
            Recruitment Funnel
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Not Contacted', value: funnel.not_contacted, color: 'bg-gray-400' },
              { label: 'Contacted', value: funnel.contacted, color: 'bg-blue-500' },
              { label: 'Interested', value: funnel.interested, color: 'bg-yellow-500' },
              { label: 'Qualified', value: funnel.qualified, color: 'bg-purple-500' },
              { label: 'Unqualified', value: funnel.unqualified, color: 'bg-red-400' },
            ].map(stage => (
              <div key={stage.label} className="flex items-center gap-3">
                <div className="w-28 text-sm text-gray-600 dark:text-gray-400">{stage.label}</div>
                <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} transition-all duration-500`}
                    style={{ width: `${totalLeads > 0 ? (stage.value / totalLeads) * 100 : 0}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  {stage.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Quality Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-4">
            Lead Quality Distribution
          </h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{qualityDist.high}</div>
              <div className="text-xs text-green-700 dark:text-green-400">High Quality</div>
            </div>
            <div className="flex-1 text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{qualityDist.medium}</div>
              <div className="text-xs text-yellow-700 dark:text-yellow-400">Medium</div>
            </div>
            <div className="flex-1 text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{qualityDist.low}</div>
              <div className="text-xs text-red-700 dark:text-red-400">Low Quality</div>
            </div>
          </div>


        </div>
      </div>

      {/* Countries Row */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-4">
          {t('recruiter.metrics.leadsByCountry')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Object.entries(leadsByCountry)
            .sort(([, a], [, b]) => b - a)
            .map(([country, count]) => (
              <div key={country} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
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
