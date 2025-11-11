/**
 * Story 5.1-B: Lead Metrics Component
 * Displays aggregate metrics for recruitment leads
 */

'use client'

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Leads Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          Total Leads
        </h3>
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">
          {totalLeads}
        </p>
      </div>

      {/* Total Contacted Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          Total Contacted
        </h3>
        <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">
          {totalContacted}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {totalLeads > 0 ? Math.round((totalContacted / totalLeads) * 100) : 0}% of total
        </p>
      </div>

      {/* Leads by Country Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
          Leads by Country
        </h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {Object.entries(leadsByCountry)
            .sort(([, a], [, b]) => b - a)
            .map(([country, count]) => (
              <div key={country} className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {country}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {count}
                </span>
              </div>
            ))}
          {Object.keys(leadsByCountry).length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No data</p>
          )}
        </div>
      </div>
    </div>
  )
}
