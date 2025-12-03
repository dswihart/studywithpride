/**
 * TrendsChart Component
 * Time-series visualization for leads, conversions, and messages over time
 * Uses custom SVG line chart to match existing codebase patterns
 */

"use client"

import { useState, useEffect, useMemo } from 'react'

interface DailyData {
  date: string
  contacts: number
  conversions: number
  messages: number
}

interface TrendsData {
  daily_activity: Record<string, { contacts: number; conversions: number; messages: number }>
  period: string
}

type MetricType = 'contacts' | 'conversions' | 'messages' | 'all'
type PeriodType = 'week' | 'month' | 'quarter'

const COLORS = {
  contacts: '#3B82F6',
  conversions: '#10B981',
  messages: '#8B5CF6',
}

interface TrendsChartProps {
  className?: string
}

export default function TrendsChart({ className = '' }: TrendsChartProps) {
  const [data, setData] = useState<TrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<PeriodType>('month')
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('all')
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; x: number; y: number; data: DailyData } | null>(null)

  useEffect(() => {
    fetchData()
  }, [period])

  async function fetchData() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/recruiter/recruiter-stats?period=${period}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError(json.error || 'Failed to load data')
      }
    } catch (err) {
      setError('Failed to fetch trends data')
    } finally {
      setLoading(false)
    }
  }

  const chartData = useMemo(() => {
    if (!data?.daily_activity) return []

    return Object.entries(data.daily_activity)
      .map(([date, values]) => ({
        date,
        contacts: values.contacts || 0,
        conversions: values.conversions || 0,
        messages: values.messages || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [data])

  const chartConfig = useMemo(() => {
    if (chartData.length === 0) return null

    const width = 800
    const height = 300
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const innerWidth = width - padding.left - padding.right
    const innerHeight = height - padding.top - padding.bottom

    const maxContacts = Math.max(...chartData.map(d => d.contacts), 1)
    const maxConversions = Math.max(...chartData.map(d => d.conversions), 1)
    const maxMessages = Math.max(...chartData.map(d => d.messages), 1)

    const maxValue = selectedMetric === 'all'
      ? Math.max(maxContacts, maxConversions, maxMessages)
      : selectedMetric === 'contacts' ? maxContacts
      : selectedMetric === 'conversions' ? maxConversions
      : maxMessages

    const xScale = (index: number) => padding.left + (index / Math.max(1, chartData.length - 1)) * innerWidth
    const yScale = (value: number) => padding.top + innerHeight - (value / maxValue) * innerHeight

    return { width, height, padding, innerWidth, innerHeight, maxValue, xScale, yScale }
  }, [chartData, selectedMetric])

  const generatePath = (metric: 'contacts' | 'conversions' | 'messages') => {
    if (!chartConfig || chartData.length === 0) return ''

    const { xScale, yScale } = chartConfig

    return chartData
      .map((d, i) => {
        const x = xScale(i)
        const y = yScale(d[metric])
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
      })
      .join(' ')
  }

  const generateAreaPath = (metric: 'contacts' | 'conversions' | 'messages') => {
    if (!chartConfig || chartData.length === 0) return ''

    const { xScale, yScale, innerHeight, padding } = chartConfig
    const baseline = padding.top + innerHeight

    const linePath = chartData
      .map((d, i) => {
        const x = xScale(i)
        const y = yScale(d[metric])
        return i === 0 ? `M ${x} ${baseline} L ${x} ${y}` : `L ${x} ${y}`
      })
      .join(' ')

    const lastX = xScale(chartData.length - 1)
    return `${linePath} L ${lastX} ${baseline} Z`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const yAxisTicks = useMemo(() => {
    if (!chartConfig) return []
    const { maxValue, yScale } = chartConfig
    const tickCount = 5
    const ticks = []
    for (let i = 0; i <= tickCount; i++) {
      const value = Math.round((maxValue / tickCount) * i)
      ticks.push({ value, y: yScale(value) })
    }
    return ticks
  }, [chartConfig])

  const xAxisLabels = useMemo(() => {
    if (!chartConfig || chartData.length === 0) return []
    const { xScale } = chartConfig

    const maxLabels = 10
    const step = Math.ceil(chartData.length / maxLabels)

    return chartData
      .filter((_, i) => i % step === 0 || i === chartData.length - 1)
      .map((d) => {
        const actualIndex = chartData.findIndex(cd => cd.date === d.date)
        return {
          date: d.date,
          x: xScale(actualIndex),
          label: formatDate(d.date)
        }
      })
  }, [chartConfig, chartData])

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartConfig || chartData.length === 0) return

    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left

    const { xScale, padding, innerWidth } = chartConfig

    const relativeX = x - padding.left
    const index = Math.round((relativeX / innerWidth) * (chartData.length - 1))
    const clampedIndex = Math.max(0, Math.min(chartData.length - 1, index))

    const dataPoint = chartData[clampedIndex]
    if (dataPoint) {
      setHoveredPoint({
        date: dataPoint.date,
        x: xScale(clampedIndex),
        y: e.clientY - rect.top,
        data: dataPoint
      })
    }
  }

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
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

  if (!chartConfig || chartData.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400 text-center py-12">
          No trend data available for this period
        </p>
      </div>
    )
  }

  const { width, height, padding } = chartConfig

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Trends</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track leads, conversions, and messages over time
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['week', 'month', 'quarter'] as PeriodType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-sm rounded-md transition ${
                  period === p
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => setSelectedMetric('all')}
          className={`px-3 py-1.5 text-sm rounded-full transition ${
            selectedMetric === 'all'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All Metrics
        </button>
        <button
          onClick={() => setSelectedMetric('contacts')}
          className={`px-3 py-1.5 text-sm rounded-full transition flex items-center gap-2 ${
            selectedMetric === 'contacts'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Contacts
        </button>
        <button
          onClick={() => setSelectedMetric('conversions')}
          className={`px-3 py-1.5 text-sm rounded-full transition flex items-center gap-2 ${
            selectedMetric === 'conversions'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Conversions
        </button>
        <button
          onClick={() => setSelectedMetric('messages')}
          className={`px-3 py-1.5 text-sm rounded-full transition flex items-center gap-2 ${
            selectedMetric === 'messages'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          Messages
        </button>
      </div>

      <div className="relative overflow-x-auto">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {yAxisTicks.map((tick, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={tick.y}
              x2={width - padding.right}
              y2={tick.y}
              stroke="currentColor"
              strokeOpacity={0.1}
              className="text-gray-400 dark:text-gray-600"
            />
          ))}

          {yAxisTicks.map((tick, i) => (
            <text
              key={`label-${i}`}
              x={padding.left - 10}
              y={tick.y}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-xs fill-gray-500 dark:fill-gray-400"
            >
              {tick.value}
            </text>
          ))}

          {xAxisLabels.map((label, i) => (
            <text
              key={i}
              x={label.x}
              y={height - 10}
              textAnchor="middle"
              className="text-xs fill-gray-500 dark:fill-gray-400"
            >
              {label.label}
            </text>
          ))}

          {(selectedMetric === 'all' || selectedMetric === 'contacts') && (
            <path
              d={generateAreaPath('contacts')}
              fill={COLORS.contacts}
              fillOpacity={0.1}
            />
          )}
          {(selectedMetric === 'all' || selectedMetric === 'conversions') && (
            <path
              d={generateAreaPath('conversions')}
              fill={COLORS.conversions}
              fillOpacity={0.1}
            />
          )}
          {(selectedMetric === 'all' || selectedMetric === 'messages') && (
            <path
              d={generateAreaPath('messages')}
              fill={COLORS.messages}
              fillOpacity={0.1}
            />
          )}

          {(selectedMetric === 'all' || selectedMetric === 'contacts') && (
            <path
              d={generatePath('contacts')}
              fill="none"
              stroke={COLORS.contacts}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {(selectedMetric === 'all' || selectedMetric === 'conversions') && (
            <path
              d={generatePath('conversions')}
              fill="none"
              stroke={COLORS.conversions}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {(selectedMetric === 'all' || selectedMetric === 'messages') && (
            <path
              d={generatePath('messages')}
              fill="none"
              stroke={COLORS.messages}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {chartData.map((d, i) => {
            const x = chartConfig.xScale(i)
            return (
              <g key={d.date}>
                {(selectedMetric === 'all' || selectedMetric === 'contacts') && (
                  <circle
                    cx={x}
                    cy={chartConfig.yScale(d.contacts)}
                    r={3}
                    fill={COLORS.contacts}
                    className="transition-all"
                    style={{ opacity: hoveredPoint?.date === d.date ? 1 : 0.7 }}
                  />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'conversions') && (
                  <circle
                    cx={x}
                    cy={chartConfig.yScale(d.conversions)}
                    r={3}
                    fill={COLORS.conversions}
                    className="transition-all"
                    style={{ opacity: hoveredPoint?.date === d.date ? 1 : 0.7 }}
                  />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'messages') && (
                  <circle
                    cx={x}
                    cy={chartConfig.yScale(d.messages)}
                    r={3}
                    fill={COLORS.messages}
                    className="transition-all"
                    style={{ opacity: hoveredPoint?.date === d.date ? 1 : 0.7 }}
                  />
                )}
              </g>
            )
          })}

          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={padding.top}
              x2={hoveredPoint.x}
              y2={height - padding.bottom}
              stroke="currentColor"
              strokeOpacity={0.3}
              strokeDasharray="4,4"
              className="text-gray-400"
            />
          )}
        </svg>

        {hoveredPoint && (
          <div
            className="absolute pointer-events-none bg-gray-900 dark:bg-gray-700 text-white px-4 py-3 rounded-lg shadow-xl text-sm z-10 min-w-[140px]"
            style={{
              left: Math.min(hoveredPoint.x, width - 160),
              top: 20,
            }}
          >
            <div className="font-semibold mb-2 border-b border-gray-700 dark:border-gray-600 pb-2">
              {formatDate(hoveredPoint.date)}
            </div>
            {(selectedMetric === 'all' || selectedMetric === 'contacts') && (
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.contacts }}></span>
                  Contacts
                </span>
                <span className="font-medium">{hoveredPoint.data.contacts}</span>
              </div>
            )}
            {(selectedMetric === 'all' || selectedMetric === 'conversions') && (
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.conversions }}></span>
                  Conversions
                </span>
                <span className="font-medium">{hoveredPoint.data.conversions}</span>
              </div>
            )}
            {(selectedMetric === 'all' || selectedMetric === 'messages') && (
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.messages }}></span>
                  Messages
                </span>
                <span className="font-medium">{hoveredPoint.data.messages}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.contacts }}></span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Contacts</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {chartData.reduce((sum, d) => sum + d.contacts, 0)}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.conversions }}></span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Conversions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {chartData.reduce((sum, d) => sum + d.conversions, 0)}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.messages }}></span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Messages</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {chartData.reduce((sum, d) => sum + d.messages, 0)}
          </p>
        </div>
      </div>
    </div>
  )
}
