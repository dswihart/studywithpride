"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/Toast"

interface TrackingLink {
  id: string
  lead_id: string
  token: string
  destination_url: string
  label: string | null
  created_at: string
  expires_at: string | null
  is_active: boolean
  visit_count: number
  last_visited: string | null
  tracking_url?: string
}

interface TrackingLinksPanelProps {
  leadId: string
  leadName: string
}

const QUICK_LINKS = [
  { label: "Partners Page", url: "https://studywithpride.com/partners" },
  { label: "Programs", url: "https://studywithpride.com/programs" },
  { label: "About Us", url: "https://studywithpride.com/about" },
  { label: "Contact", url: "https://studywithpride.com/contact" },
]

export default function TrackingLinksPanel({ leadId, leadName }: TrackingLinksPanelProps) {
  const { showToast } = useToast()
  const [links, setLinks] = useState<TrackingLink[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    destination_url: "",
    label: "",
    expires_in_days: 0
  })

  useEffect(() => {
    fetchLinks()
  }, [leadId])

  const fetchLinks = async () => {
    try {
      const response = await fetch(`/api/recruiter/tracking-links?lead_id=${leadId}`)
      const result = await response.json()
      if (result.success) {
        setLinks(result.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch tracking links:", error)
    } finally {
      setLoading(false)
    }
  }

  const createLink = async (url: string, label: string) => {
    setCreating(true)
    try {
      const response = await fetch("/api/recruiter/tracking-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          destination_url: url,
          label: label,
          expires_in_days: formData.expires_in_days || null
        })
      })
      const result = await response.json()
      if (result.success) {
        showToast("Link created and copied to clipboard", "success")
        await navigator.clipboard.writeText(result.data.tracking_url)
        fetchLinks()
        setShowCreateForm(false)
        setFormData({ destination_url: "", label: "", expires_in_days: 0 })
      } else {
        showToast(result.error || "Failed to create tracking link", "error")
      }
    } catch (error) {
      showToast("Failed to create tracking link", "error")
    } finally {
      setCreating(false)
    }
  }

  const copyLink = async (link: TrackingLink) => {
    const baseUrl = window.location.origin
    const trackingUrl = `${baseUrl}/track/${link.token}`
    await navigator.clipboard.writeText(trackingUrl)
    showToast("Tracking link copied to clipboard", "success")
  }

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Tracking Links
        </h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Link
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create a trackable link for <strong>{leadName}</strong>. You will know when they click it.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Select
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_LINKS.map((quickLink) => (
                <button
                  key={quickLink.url}
                  onClick={() => createLink(quickLink.url, quickLink.label)}
                  disabled={creating}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  {quickLink.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Or enter custom URL
            </label>
            <input
              type="url"
              value={formData.destination_url}
              onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Label (optional)
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Partners Page"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => createLink(formData.destination_url, formData.label)}
              disabled={creating || !formData.destination_url}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Link"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading links...</p>
      ) : links.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No tracking links yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Create a link to track when this lead visits your pages
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 ${
                link.visit_count > 0 ? "border-green-500" : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {link.label || "Untitled Link"}
                  </span>
                  {link.visit_count > 0 && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full font-medium">
                      {link.visit_count} visit{link.visit_count !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {link.destination_url}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-1">
                  <span>Created {formatRelativeTime(link.created_at)}</span>
                  {link.last_visited && (
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Last visit: {formatRelativeTime(link.last_visited)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => copyLink(link)}
                className="ml-3 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                title="Copy tracking link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
