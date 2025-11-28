/**
 * Recent WhatsApp Messages Page with Read Receipt Dashboard
 * Shows all incoming WhatsApp messages across all leads with delivery stats
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/ThemeProvider'

interface WhatsAppMessage {
  id: string
  lead_id: string
  direction: 'inbound' | 'outbound'
  content: string
  message_type: string
  status: string
  sent_at: string
  delivered_at: string | null
  read_at: string | null
  lead: {
    prospect_name: string | null
    phone: string | null
    country: string | null
  }
}

interface MessageStats {
  total: number
  sent: number
  delivered: number
  read: number
  failed: number
}

export default function WhatsAppMessagesPage() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [filter, setFilter] = useState<'all' | 'inbound' | 'outbound'>('inbound')
  const [stats, setStats] = useState<MessageStats>({ total: 0, sent: 0, delivered: 0, read: 0, failed: 0 })
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    checkAuthorization()
  }, [])

  useEffect(() => {
    if (authorized) {
      fetchMessages()
    }
  }, [authorized, filter])

  const checkAuthorization = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/login')
        return
      }

      const userRole = user.user_metadata?.role
      if (userRole !== 'recruiter' && userRole !== 'admin') {
        router.push('/dashboard')
        return
      }

      setAuthorized(true)
    } catch (err) {
      console.error('Authorization check failed:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('whatsapp_messages')
        .select(`
          id,
          lead_id,
          direction,
          content,
          message_type,
          status,
          sent_at,
          delivered_at,
          read_at,
          lead:leads!inner (
            prospect_name,
            phone,
            country
          )
        `)
        .order('sent_at', { ascending: false })
        .limit(100)

      if (filter === 'inbound') {
        query = query.eq('direction', 'inbound')
      } else if (filter === 'outbound') {
        query = query.eq('direction', 'outbound')
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching messages:', error)
        return
      }

      const fetchedMessages = data as any || []
      setMessages(fetchedMessages)

      // Calculate stats for outbound messages
      const outboundMessages = fetchedMessages.filter((m: WhatsAppMessage) => m.direction === 'outbound')
      const newStats: MessageStats = {
        total: outboundMessages.length,
        sent: outboundMessages.filter((m: WhatsAppMessage) => m.status === 'sent').length,
        delivered: outboundMessages.filter((m: WhatsAppMessage) => m.status === 'delivered').length,
        read: outboundMessages.filter((m: WhatsAppMessage) => m.status === 'read').length,
        failed: outboundMessages.filter((m: WhatsAppMessage) => m.status === 'failed').length,
      }
      setStats(newStats)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return <span className="text-blue-500">✓✓</span>
      case 'delivered':
        return <span className="text-gray-500">✓✓</span>
      case 'sent':
        return <span className="text-gray-400">✓</span>
      case 'failed':
        return <span className="text-red-500">✗</span>
      default:
        return <span className="text-gray-300">⏱</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              WhatsApp Messages
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View conversations and delivery status
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/recruitment/dashboard"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Read Receipt Stats Dashboard */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Sent</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-gray-600 dark:text-gray-300">{stats.sent}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span className="text-gray-400">✓</span> Sent
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-200">{stats.delivered}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span className="text-gray-500">✓✓</span> Delivered
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-blue-600">{stats.read}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span className="text-blue-500">✓✓</span> Read
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span className="text-red-500">✗</span> Failed
            </div>
          </div>
        </div>

        {/* Delivery Rate Bar */}
        {stats.total > 0 && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Performance</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round((stats.read / stats.total) * 100)}% read rate
              </span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${(stats.read / stats.total) * 100}%` }}
                title={`Read: ${stats.read}`}
              />
              <div
                className="bg-gray-400 h-full transition-all"
                style={{ width: `${(stats.delivered / stats.total) * 100}%` }}
                title={`Delivered: ${stats.delivered}`}
              />
              <div
                className="bg-gray-300 h-full transition-all"
                style={{ width: `${(stats.sent / stats.total) * 100}%` }}
                title={`Sent: ${stats.sent}`}
              />
              <div
                className="bg-red-400 h-full transition-all"
                style={{ width: `${(stats.failed / stats.total) * 100}%` }}
                title={`Failed: ${stats.failed}`}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Read: {Math.round((stats.read / stats.total) * 100)}%</span>
              <span>Delivered: {Math.round((stats.delivered / stats.total) * 100)}%</span>
              <span>Pending: {Math.round((stats.sent / stats.total) * 100)}%</span>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilter('inbound')}
            className={`px-6 py-2 font-semibold rounded-lg transition ${
              filter === 'inbound'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Received
          </button>
          <button
            onClick={() => setFilter('outbound')}
            className={`px-6 py-2 font-semibold rounded-lg transition ${
              filter === 'outbound'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Sent
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 font-semibold rounded-lg transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={fetchMessages}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Messages List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No messages found
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
                  onClick={() => window.location.href = `/admin/recruitment/dashboard?leadId=${message.lead_id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          message.direction === 'inbound' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {message.lead?.prospect_name || 'Unknown'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {message.lead?.phone}
                        </span>
                        {message.lead?.country && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {message.lead.country}
                          </span>
                        )}
                        {message.direction === 'outbound' && (
                          <span className="ml-auto text-lg">
                            {getStatusIcon(message.status)}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 mb-1 line-clamp-2">
                        {message.content}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className={message.direction === 'inbound' ? 'text-green-600' : 'text-blue-600'}>
                          {message.direction === 'inbound' ? '← Received' : '→ Sent'}
                        </span>
                        <span>•</span>
                        <span>{formatTimestamp(message.sent_at)}</span>
                        {message.status && (
                          <>
                            <span>•</span>
                            <span className={`capitalize ${
                              message.status === 'read' ? 'text-blue-600' :
                              message.status === 'failed' ? 'text-red-600' : ''
                            }`}>
                              {message.status}
                            </span>
                          </>
                        )}
                        {message.read_at && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">
                              Read {formatTimestamp(message.read_at)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Showing {messages.length} most recent messages
          </div>
        )}
      </div>
    </div>
  )
}
