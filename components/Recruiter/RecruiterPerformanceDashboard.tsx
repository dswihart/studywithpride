"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/LanguageContext"

interface PerformanceData {
  period: string
  summary: {
    total_leads: number
    contacted: number
    converted: number
    qualified: number
    interested: number
    messages_sent: number
  }
  funnel: {
    new_to_contacted: number
    contacted_to_interested: number
    interested_to_qualified: number
    qualified_to_converted: number
    overall_conversion: number
    referral_count: number
    referral_to_contacted: number
  }
  performance: {
    contact_rate: { value: number; target: number; status: string }
    conversion_rate: { value: number; target: number; status: string }
    activity: { value: number; target: number; status: string }
  }
  trends: {
    leads: { this_week: number; last_week: number; change: number; direction: string }
    conversions: { this_week: number; last_week: number; change: number; direction: string }
  }
  top_sources: { source: string; count: number; converted: number; conversion_rate: number }[]
  action_items: string[]
}

export default function RecruiterPerformanceDashboard() {
  const { t } = useLanguage()
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [period, setPeriod] = useState<"day" | "week" | "month" | "quarter">("month")

  useEffect(() => {
    fetchData()
  }, [period])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/recruiter/recruiter-stats?period=${period}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError(json.error || "Failed to load data")
      }
    } catch (err) {
      setError("Failed to fetch performance data")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_target":
        return "text-green-500 dark:text-green-400"
      case "near_target":
        return "text-yellow-500 dark:text-yellow-400"
      case "below_target":
        return "text-red-500 dark:text-red-400"
      default:
        return "text-gray-500"
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case "on_target":
        return "bg-green-100 dark:bg-green-900/30"
      case "near_target":
        return "bg-yellow-100 dark:bg-yellow-900/30"
      case "below_target":
        return "bg-red-100 dark:bg-red-900/30"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  const getTrendIcon = (direction: string) => {
    if (direction === "up") return "↑"
    if (direction === "down") return "↓"
    return "→"
  }

  const getTrendColor = (direction: string, isPositive: boolean = true) => {
    if (direction === "up") return isPositive ? "text-green-500" : "text-red-500"
    if (direction === "down") return isPositive ? "text-red-500" : "text-green-500"
    return "text-gray-500"
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-red-500">{error || "No data available"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h2>
          <div className="flex gap-2">
            {(["day", "week", "month", "quarter"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-sm rounded ${
                  period === p
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.summary.total_leads}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Leads</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.summary.contacted}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Contacted</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.summary.interested}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Interested</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{data.summary.qualified}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Qualified</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.summary.converted}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Converted</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{data.summary.messages_sent}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Messages</p>
          </div>
        </div>
      </div>

      {/* Performance vs Targets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact Rate */}
        <div className={`rounded-lg shadow p-6 ${getStatusBg(data.performance.contact_rate.status)}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Contact Rate</h3>
            <span className={`text-sm font-medium ${getStatusColor(data.performance.contact_rate.status)}`}>
              {data.performance.contact_rate.status === "on_target" ? "On Target" :
               data.performance.contact_rate.status === "near_target" ? "Near Target" : "Below Target"}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {data.performance.contact_rate.value}%
          </p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                data.performance.contact_rate.status === "on_target"
                  ? "bg-green-500"
                  : data.performance.contact_rate.status === "near_target"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, (data.performance.contact_rate.value / data.performance.contact_rate.target) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Target: {data.performance.contact_rate.target}%
          </p>
        </div>

        {/* Conversion Rate */}
        <div className={`rounded-lg shadow p-6 ${getStatusBg(data.performance.conversion_rate.status)}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</h3>
            <span className={`text-sm font-medium ${getStatusColor(data.performance.conversion_rate.status)}`}>
              {data.performance.conversion_rate.status === "on_target" ? "On Target" :
               data.performance.conversion_rate.status === "near_target" ? "Near Target" : "Below Target"}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {data.performance.conversion_rate.value}%
          </p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                data.performance.conversion_rate.status === "on_target"
                  ? "bg-green-500"
                  : data.performance.conversion_rate.status === "near_target"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, (data.performance.conversion_rate.value / data.performance.conversion_rate.target) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Target: {data.performance.conversion_rate.target}%
          </p>
        </div>

        {/* Activity */}
        <div className={`rounded-lg shadow p-6 ${getStatusBg(data.performance.activity.status)}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Activity</h3>
            <span className={`text-sm font-medium ${getStatusColor(data.performance.activity.status)}`}>
              {data.performance.activity.status === "on_target" ? "On Target" :
               data.performance.activity.status === "near_target" ? "Near Target" : "Below Target"}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {data.performance.activity.value}
          </p>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                data.performance.activity.status === "on_target"
                  ? "bg-green-500"
                  : data.performance.activity.status === "near_target"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, (data.performance.activity.value / data.performance.activity.target) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Target: {data.performance.activity.target} msgs/day
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Visualization */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recruitment Funnel</h3>
          <div className="space-y-3">
            {[
              { label: "Referrals", value: data.funnel.referral_count, color: "bg-pink-500", isCount: true },
              { label: "Referral → Contacted", value: data.funnel.referral_to_contacted, color: "bg-pink-400" },
              { label: "New → Contacted", value: data.funnel.new_to_contacted, color: "bg-blue-500" },
              { label: "Contacted → Interested", value: data.funnel.contacted_to_interested, color: "bg-purple-500" },
              { label: "Interested → Qualified", value: data.funnel.interested_to_qualified, color: "bg-amber-500" },
              { label: "Qualified → Converted", value: data.funnel.qualified_to_converted, color: "bg-green-500" },
            ].map((stage) => (
              <div key={stage.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{stage.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stage.isCount ? stage.value : stage.value + "%"}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${stage.color}`}
                    style={{ width: stage.isCount ? '100%' : `${Math.min(stage.value, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Overall Conversion</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {data.funnel.overall_conversion}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Week over Week</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Leads Trend */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">New Leads</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.trends.leads.this_week}
                </span>
                <span className={`text-sm font-medium ${getTrendColor(data.trends.leads.direction)}`}>
                  {getTrendIcon(data.trends.leads.direction)} {Math.abs(data.trends.leads.change)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                vs {data.trends.leads.last_week} last week
              </p>
            </div>

            {/* Conversions Trend */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Conversions</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.trends.conversions.this_week}
                </span>
                <span className={`text-sm font-medium ${getTrendColor(data.trends.conversions.direction)}`}>
                  {getTrendIcon(data.trends.conversions.direction)} {Math.abs(data.trends.conversions.change)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                vs {data.trends.conversions.last_week} last week
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Sources & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sources */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Lead Sources</h3>
          <div className="space-y-3">
            {data.top_sources.slice(0, 15).map((source, index) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-400 w-5">{index + 1}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{source.source}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{source.count} leads</span>
                  <span className={`text-sm font-medium ${
                    source.conversion_rate >= 15 ? "text-green-500" :
                    source.conversion_rate >= 10 ? "text-yellow-500" : "text-red-500"
                  }`}>
                    {source.conversion_rate}% conv
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Action Items</h3>
          {data.action_items.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <span className="text-4xl">✓</span>
                <p className="text-gray-500 dark:text-gray-400 mt-2">All caught up!</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.action_items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                >
                  <span className="text-amber-500 mt-0.5">!</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
