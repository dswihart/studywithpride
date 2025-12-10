/**
 * BulkEditLeadModal Component
 * Allows updating multiple leads at once with confirmation dialog
 */

'use client'

import { useState } from 'react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

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
  { value: 'unqualified', label: 'Unqualified' },
  { value: 'archived', label: 'Archived' }
]

export default function BulkEditLeadModal({ isOpen, onClose, selectedLeadIds, onSuccess }: BulkEditLeadModalProps) {
  const [contactStatus, setContactStatus] = useState('')
  const [referralSource, setReferralSource] = useState('')
  const [campaign, setCampaign] = useState('')
  const [barcelonaTimeline, setBarcelonaTimeline] = useState('')
  const [lastContactDate, setLastContactDate] = useState('')
  const [updateStatus, setUpdateStatus] = useState(false)
  const [updateReferral, setUpdateReferral] = useState(false)
  const [updateCampaign, setUpdateCampaign] = useState(false)
  const [updateBarcelonaTimeline, setUpdateBarcelonaTimeline] = useState(false)
  const [updateLastContactDate, setUpdateLastContactDate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const getUpdateSummary = () => {
    const changes: string[] = []
    if (updateStatus && contactStatus) {
      const statusLabel = CONTACT_STATUSES.find(s => s.value === contactStatus)?.label || contactStatus
      changes.push('Status: ' + statusLabel)
    }
    if (updateReferral && referralSource.trim()) changes.push('Referral: ' + referralSource.trim())
    if (updateCampaign && campaign.trim()) changes.push('Campaign: ' + campaign.trim())
    if (updateBarcelonaTimeline && barcelonaTimeline) changes.push('Timeline: ' + barcelonaTimeline + ' months')
    if (updateLastContactDate && lastContactDate) changes.push('Contact Date: ' + lastContactDate)
    return changes
  }

  const validateForm = (): boolean => {
    if (!updateStatus && !updateReferral && !updateCampaign && !updateBarcelonaTimeline && !updateLastContactDate) {
      setError('Please select at least one field to update')
      return false
    }
    if (updateStatus && !contactStatus) {
      setError('Please select a contact status')
      return false
    }
    if (updateReferral && !referralSource.trim()) {
      setError('Please enter a referral destination')
      return false
    }
    if (updateCampaign && !campaign.trim()) {
      setError('Please enter a campaign name')
      return false
    }
    if (updateBarcelonaTimeline && !barcelonaTimeline) {
      setError('Please select a Barcelona timeline')
      return false
    }
    if (updateLastContactDate && !lastContactDate) {
      setError('Please select a date contacted')
      return false
    }
    return true
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (validateForm()) {
      setShowConfirm(true)
    }
  }

  const executeUpdate = async () => {
    setLoading(true)
    setError('')

    try {
      const updates: Record<string, string | number> = {}
      if (updateStatus && contactStatus) updates.contact_status = contactStatus
      if (updateReferral && referralSource.trim()) updates.referral_source = referralSource.trim()
      if (updateCampaign && campaign.trim()) updates.campaign = campaign.trim()
      if (updateBarcelonaTimeline && barcelonaTimeline) updates.barcelona_timeline = parseInt(barcelonaTimeline)
      if (updateLastContactDate && lastContactDate) updates.last_contact_date = new Date(lastContactDate).toISOString()

      const response = await fetch('/api/recruiter/leads-bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ leadIds: selectedLeadIds, updates })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to update leads')
        setShowConfirm(false)
        return
      }

      onSuccess()
      handleClose()
    } catch (err) {
      console.error('Bulk update error:', err)
      setError('An error occurred while updating leads')
      setShowConfirm(false)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setContactStatus('')
    setReferralSource('')
    setCampaign('')
    setBarcelonaTimeline('')
    setLastContactDate('')
    setUpdateStatus(false)
    setUpdateReferral(false)
    setUpdateCampaign(false)
    setUpdateBarcelonaTimeline(false)
    setUpdateLastContactDate(false)
    setError('')
    setShowConfirm(false)
    onClose()
  }

  const updateSummary = getUpdateSummary()
  const confirmMessage = 'You are about to update ' + selectedLeadIds.length + ' lead' + (selectedLeadIds.length !== 1 ? 's' : '') + ' with: ' + updateSummary.join(', ') + '. This action cannot be undone.'

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bulk Edit Leads</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl" aria-label="Close modal">
              ×
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-semibold">{selectedLeadIds.length}</span> lead{selectedLeadIds.length !== 1 ? 's' : ''} selected for update
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" id="updateStatus" checked={updateStatus} onChange={(e) => setUpdateStatus(e.target.checked)} className="w-4 h-4 rounded" />
                <label htmlFor="updateStatus" className="font-medium text-gray-700 dark:text-gray-300">Update Contact Status</label>
              </div>
              {updateStatus && (
                <select value={contactStatus} onChange={(e) => setContactStatus(e.target.value)} className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Select Status</option>
                  {CONTACT_STATUSES.map(status => (<option key={status.value} value={status.value}>{status.label}</option>))}
                </select>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" id="updateReferral" checked={updateReferral} onChange={(e) => setUpdateReferral(e.target.checked)} className="w-4 h-4 rounded" />
                <label htmlFor="updateReferral" className="font-medium text-gray-700 dark:text-gray-300">Update Referral Destination</label>
              </div>
              {updateReferral && (
                <input type="text" value={referralSource} onChange={(e) => setReferralSource(e.target.value)} placeholder="Enter referral destination" className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" id="updateCampaign" checked={updateCampaign} onChange={(e) => setUpdateCampaign(e.target.checked)} className="w-4 h-4 rounded" />
                <label htmlFor="updateCampaign" className="font-medium text-gray-700 dark:text-gray-300">Update Campaign</label>
              </div>
              {updateCampaign && (
                <input type="text" value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="Enter campaign name" className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" id="updateBarcelonaTimeline" checked={updateBarcelonaTimeline} onChange={(e) => setUpdateBarcelonaTimeline(e.target.checked)} className="w-4 h-4 rounded" />
                <label htmlFor="updateBarcelonaTimeline" className="font-medium text-gray-700 dark:text-gray-300">Update Barcelona Timeline</label>
              </div>
              {updateBarcelonaTimeline && (
                <select value={barcelonaTimeline} onChange={(e) => setBarcelonaTimeline(e.target.value)} className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Select Timeline</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                </select>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" id="updateLastContactDate" checked={updateLastContactDate} onChange={(e) => setUpdateLastContactDate(e.target.checked)} className="w-4 h-4 rounded" />
                <label htmlFor="updateLastContactDate" className="font-medium text-gray-700 dark:text-gray-300">Update Date Contacted</label>
              </div>
              {updateLastContactDate && (
                <input type="date" value={lastContactDate} onChange={(e) => setLastContactDate(e.target.value)} className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium" disabled={loading}>
                Review Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Bulk Update"
        message={confirmMessage}
        confirmLabel="Update Leads"
        cancelLabel="Go Back"
        variant="warning"
        onConfirm={executeUpdate}
        onCancel={() => setShowConfirm(false)}
        loading={loading}
      />
    </>
  )
}
