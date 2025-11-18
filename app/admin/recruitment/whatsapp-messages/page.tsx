/**
 * Recent WhatsApp Messages Page
 * Shows all incoming WhatsApp messages across all leads
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface WhatsAppMessage {
  id: string
  lead_id: string
  direction: 'inbound' | 'outbound'
  content: string
  message_type: string
  status: string
  sent_at: string
  lead: {
    prospect_name: string | null
    phone: string | null
    country: string | null
  }
}

export default function WhatsAppMessagesPage() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [filter, setFilter] = useState<'all' | 'inbound' | 'outbound'>('inbound')
  const router = useRouter()

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

      setMessages(data as any || [])
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Recent WhatsApp Messages
            </h1>
            <p className="text-gray-600">
              View all WhatsApp conversations in one place
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
              Back to Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilter('inbound')}
            className={`px-6 py-2 font-semibold rounded-lg transition ${
              filter === 'inbound'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Received Messages
          </button>
          <button
            onClick={() => setFilter('outbound')}
            className={`px-6 py-2 font-semibold rounded-lg transition ${
              filter === 'outbound'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Sent Messages
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 font-semibold rounded-lg transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Messages
          </button>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No messages found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/admin/recruitment/dashboard?leadId=${message.lead_id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          message.direction === 'inbound' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <span className="font-semibold text-gray-900">
                          {message.lead?.prospect_name || 'Unknown'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {message.lead?.phone}
                        </span>
                        {message.lead?.country && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {message.lead.country}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-700 mb-1 line-clamp-2">
                        {message.content}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={message.direction === 'inbound' ? 'text-green-600' : 'text-blue-600'}>
                          {message.direction === 'inbound' ? '← Received' : '→ Sent'}
                        </span>
                        <span>•</span>
                        <span>{formatTimestamp(message.sent_at)}</span>
                        {message.status && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{message.status}</span>
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
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {messages.length} most recent messages
          </div>
        )}
      </div>
    </div>
  )
}
