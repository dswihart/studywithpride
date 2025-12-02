/**
 * Enhanced Lead Metrics Component
 * Displays comprehensive recruitment analytics with pie chart visualization
 */

"use client"

import { useState } from 'react'
import { useLanguage } from '@/components/LanguageContext'
import { UsersIcon, ArrowTrendingUpIcon, ClockIcon } from '@heroicons/react/24/outline'

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

// Color palette for pie chart
const PIE_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#A855F7', // violet
]

interface PieSlice {
  country: string
  count: number
  percentage: number
  startAngle: number
  endAngle: number
  color: string
}

function CountryPieChart({ data }: { data: Record<string, number> }) {
  const [hoveredSlice, setHoveredSlice] = useState<PieSlice | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const total = Object.values(data).reduce((sum, count) => sum + count, 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No data available
      </div>
    )
  }

  // Sort by count descending and prepare slices
  const sortedEntries = Object.entries(data).sort(([, a], [, b]) => b - a)

  let currentAngle = -90 // Start from top
  const slices: PieSlice[] = sortedEntries.map(([country, count], index) => {
    const percentage = (count / total) * 100
    const angle = (count / total) * 360
    const slice: PieSlice = {
      country,
      count,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }
    currentAngle += angle
    return slice
  })

  const size = 280
  const center = size / 2
  const radius = 100
  const innerRadius = 50 // Donut hole

  const polarToCartesian = (angle: number, r: number) => {
    const radians = (angle * Math.PI) / 180
    return {
      x: center + r * Math.cos(radians),
      y: center + r * Math.sin(radians),
    }
  }

  const createArcPath = (slice: PieSlice) => {
    const startOuter = polarToCartesian(slice.startAngle, radius)
    const endOuter = polarToCartesian(slice.endAngle, radius)
    const startInner = polarToCartesian(slice.endAngle, innerRadius)
    const endInner = polarToCartesian(slice.startAngle, innerRadius)

    const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${startInner.x} ${startInner.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInner.x} ${endInner.y}`,
      'Z',
    ].join(' ')
  }

  const handleMouseMove = (e: React.MouseEvent, slice: PieSlice) => {
    const rect = e.currentTarget.closest('svg')?.getBoundingClientRect()
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 10,
      })
    }
    setHoveredSlice(slice)
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      {/* Pie Chart */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="transform -rotate-0"
        >
          {slices.map((slice, index) => (
            <path
              key={slice.country}
              d={createArcPath(slice)}
              fill={slice.color}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-200 cursor-pointer"
              style={{
                transform: hoveredSlice?.country === slice.country ? 'scale(1.05)' : 'scale(1)',
                transformOrigin: `${center}px ${center}px`,
                opacity: hoveredSlice && hoveredSlice.country !== slice.country ? 0.6 : 1,
              }}
              onMouseMove={(e) => handleMouseMove(e, slice)}
              onMouseLeave={() => setHoveredSlice(null)}
            />
          ))}
          {/* Center text */}
          <text
            x={center}
            y={center - 8}
            textAnchor="middle"
            className="fill-gray-900 dark:fill-white font-bold text-2xl"
          >
            {total}
          </text>
          <text
            x={center}
            y={center + 12}
            textAnchor="middle"
            className="fill-gray-500 dark:fill-gray-400 text-xs"
          >
            Total Leads
          </text>
        </svg>

        {/* Tooltip */}
        {hoveredSlice && (
          <div
            className="absolute pointer-events-none bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-10 whitespace-nowrap"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-semibold">{hoveredSlice.country}</div>
            <div>{hoveredSlice.count} leads ({hoveredSlice.percentage.toFixed(1)}%)</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {slices.map((slice) => (
          <div
            key={slice.country}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
              hoveredSlice?.country === slice.country
                ? 'bg-gray-100 dark:bg-gray-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            onMouseEnter={() => setHoveredSlice(slice)}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
              {slice.country}
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {slice.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LeadMetrics({ leads }: LeadMetricsProps) {
  const { t } = useLanguage()

  // Basic metrics
  const totalLeads = leads.length

  // Lead quality distribution (case-insensitive)
  const qualityDist = {
    high: leads.filter(l => l.lead_quality?.toLowerCase() === 'high').length,
    medium: leads.filter(l => l.lead_quality?.toLowerCase() === 'medium').length,
    low: leads.filter(l => l.lead_quality?.toLowerCase() === 'low').length,
  }

  // Leads by country
  const leadsByCountry = leads.reduce((acc, lead) => {
    acc[lead.country] = (acc[lead.country] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Recent activity (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const recentLeads = leads.filter(l => new Date(l.created_at) > weekAgo).length
  const recentContacted = leads.filter(l => l.last_contact_date && new Date(l.last_contact_date) > weekAgo).length

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

      {/* Quality & Countries Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Quality Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-4">
            Lead Quality Distribution
          </h3>
          <div className="flex flex-col gap-3">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{qualityDist.high}</div>
              <div className="text-sm text-green-700 dark:text-green-400">High (85+)</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">{qualityDist.medium}</div>
              <div className="text-sm text-yellow-700 dark:text-yellow-400">Medium (55-84)</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{qualityDist.low}</div>
              <div className="text-sm text-red-700 dark:text-red-400">Low (&lt;55)</div>
            </div>
          </div>
        </div>

        {/* Countries Pie Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-4">
            {t('recruiter.metrics.leadsByCountry')}
          </h3>
          <CountryPieChart data={leadsByCountry} />
        </div>
      </div>
    </div>
  )
}

