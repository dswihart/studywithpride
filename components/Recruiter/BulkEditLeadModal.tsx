/**
 * BulkEditLeadModal Component
 * Allows updating multiple leads at once (status and referral destination)
 */

'use client'

import { useState } from 'react'

interface BulkEditLeadModalProps {
  isOpen: boolean
  onClose: () => void
  selectedLeadIds: string[]
  onSuccess: () => void
}

const CONTACT_STATUSES = [
  { value: 'not_contacted', label: 'Not Contacted' },
  { value: 'referral', label: 'Referral' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'unqualified', label: 'Unqualified' }
]

export default function BulkEditLeadModal({ isOpen, onClose, selectedLeadIds, onSuccess }: BulkEditLeadModalProps) {
  const [contactStatus, setContactStatus] = useState('')
  const [referralSource, setReferralSource] = useState('')
  const [campaign, setCampaign] = useState('')
  const [barcelonaTimeline, setBarcelonaTimeline] = useState('')
  const [updateStatus, setUpdateStatus] = useState(false)
  const [updateReferral, setUpdateReferral] = useState(false)
  const [updateCampaign, setUpdateCampaign] = useState(false)
  const [updateBarcelonaTimeline, setUpdateBarcelonaTimeline] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!updateStatus && !updateReferral && !updateCampaign && !updateBarcelonaTimeline) {
      setError('Please select at least one field to update')
      return
    }

    if (updateStatus && !contactStatus) {
      setError('Please select a contact status')
      return
    }

    if (updateReferral && !referralSource.trim()) {
      setError('Please enter a referral destination')
      return
    }

    setLoading(true)
    setError('')

    try {
      const updates: any = {}
      if (updateStatus && contactStatus) {
        updates.contact_status = contactStatus
      }
      if (updateReferral && referralSource.trim()) {
        if (updateCampaign && campaign.trim()) {
          updates.campaign = campaign.trim()
        }
        if (updateBarcelonaTimeline && barcelonaTimeline) {
          updates.barcelona_timeline = parseInt(barcelonaTimeline)
        }
        updates.referral_source = referralSource.trim()
      }

      console.log('Sending bulk update:', { leadIds: selectedLeadIds, updates })

      const response = await fetch('/api/recruiter/leads-bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          leadIds: selectedLeadIds,
          updates
        })
      })

      const result = await response.json()
      console.log('Bulk update result:', result)

      if (!result.success) {
        setError(result.error || 'Failed to update leads')
        return
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Bulk update error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setContactStatus('')
    setReferralSource('')
    setUpdateStatus(false)
    setUpdateReferral(false)
    setUpdateCampaign(false)
    setCampaign('')
    setBarcelonaTimeline('')
    setUpdateBarcelonaTimeline(false)
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bulk Edit Leads</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Updating {selectedLeadIds.length} lead{selectedLeadIds.length !== 1 ? 's' : ''}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact Status */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="updateStatus"
                checked={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="updateStatus" className="font-medium text-gray-700 dark:text-gray-300">
                Update Contact Status
              </label>
            </div>
            {updateStatus && (
              <select
                value={contactStatus}
                onChange={(e) => setContactStatus(e.target.value)}
                required={updateStatus}
                className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Status</option>
                {CONTACT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Referral Source - Changed to text input */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="updateReferral"
                checked={updateReferral}
                onChange={(e) => setUpdateReferral(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="updateReferral" className="font-medium text-gray-700 dark:text-gray-300">
                Update Referral Destination
              </label>
            </div>
            {updateReferral && (
              <input
                type="text"
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                placeholder="Enter referral destination"
                required={updateReferral}
                className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            )}
          </div>
          {/* Campaign */}          <div>            <div className="flex items-center gap-2 mb-2">              <input type="checkbox" id="updateCampaign" checked={updateCampaign} onChange={(e) => setUpdateCampaign(e.target.checked)} className="w-4 h-4" />              <label htmlFor="updateCampaign" className="font-medium text-gray-700 dark:text-gray-300">                Update Campaign              </label>            </div>            {updateCampaign && (<input type="text" value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="Enter campaign name" required={updateCampaign} className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />)}          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Leads'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
