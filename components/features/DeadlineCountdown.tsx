/**
 * Deadline Countdown Widget
 * Shows upcoming deadlines with countdown timers for visa/enrollment deadlines
 */

"use client"

import { useState, useEffect } from "react"

interface Deadline {
  id: string
  title: string
  date: Date
  type: 'visa' | 'enrollment' | 'payment' | 'document' | 'other'
  description?: string
}

interface DeadlineCountdownProps {
  deadlines?: Deadline[]
}

const DEFAULT_DEADLINES: Deadline[] = [
  {
    id: '1',
    title: 'February Intake Application',
    date: new Date('2025-01-15'),
    type: 'enrollment',
    description: 'Last day to submit applications for February 2025 intake'
  },
  {
    id: '2',
    title: 'May Intake Application',
    date: new Date('2025-04-01'),
    type: 'enrollment',
    description: 'Last day to submit applications for May 2025 intake'
  },
  {
    id: '3',
    title: 'October Intake Application',
    date: new Date('2025-08-15'),
    type: 'enrollment',
    description: 'Last day to submit applications for October 2025 intake'
  },
]

const TYPE_COLORS = {
  visa: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  enrollment: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  payment: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  document: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  other: { bg: 'bg-gray-50 dark:bg-gray-900/20', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-800' },
}

const TYPE_ICONS = {
  visa: '🛂',
  enrollment: '🎓',
  payment: '💳',
  document: '📄',
  other: '📅',
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date()
  const difference = targetDate.getTime() - now.getTime()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  }
}

function getUrgencyClass(days: number): string {
  if (days <= 3) return 'animate-pulse bg-red-500'
  if (days <= 7) return 'bg-orange-500'
  if (days <= 14) return 'bg-yellow-500'
  return 'bg-green-500'
}

export default function DeadlineCountdown({ deadlines = DEFAULT_DEADLINES }: DeadlineCountdownProps) {
  const [timeLeftMap, setTimeLeftMap] = useState<Record<string, TimeLeft>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Initial calculation
    const initialMap: Record<string, TimeLeft> = {}
    deadlines.forEach(deadline => {
      initialMap[deadline.id] = calculateTimeLeft(deadline.date)
    })
    setTimeLeftMap(initialMap)

    // Update every second
    const timer = setInterval(() => {
      const newMap: Record<string, TimeLeft> = {}
      deadlines.forEach(deadline => {
        newMap[deadline.id] = calculateTimeLeft(deadline.date)
      })
      setTimeLeftMap(newMap)
    }, 1000)

    return () => clearInterval(timer)
  }, [deadlines])

  // Sort deadlines by date (closest first)
  const sortedDeadlines = [...deadlines]
    .filter(d => calculateTimeLeft(d.date).total > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>⏰</span> Upcoming Deadlines
        </h2>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (sortedDeadlines.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>⏰</span> Upcoming Deadlines
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No upcoming deadlines! Check back later for new dates.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>⏰</span> Upcoming Deadlines
      </h2>

      <div className="space-y-4">
        {sortedDeadlines.map((deadline) => {
          const timeLeft = timeLeftMap[deadline.id] || { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
          const colors = TYPE_COLORS[deadline.type]
          const icon = TYPE_ICONS[deadline.type]
          const urgencyClass = getUrgencyClass(timeLeft.days)

          return (
            <div
              key={deadline.id}
              className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{icon}</span>
                    <h3 className={`font-semibold ${colors.text}`}>
                      {deadline.title}
                    </h3>
                  </div>
                  {deadline.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {deadline.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {deadline.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Countdown Timer */}
                <div className="flex-shrink-0 text-right">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium mb-2 ${urgencyClass}`}>
                    {timeLeft.days <= 3 ? '🔥 Urgent' : timeLeft.days <= 7 ? '⚠️ Soon' : '📅 Upcoming'}
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{timeLeft.days}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">days</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{timeLeft.hours}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">hrs</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{timeLeft.minutes}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">min</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{timeLeft.seconds}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">sec</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-center">
        <a
          href="/visa"
          className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          View all visa deadlines →
        </a>
      </div>
    </div>
  )
}
