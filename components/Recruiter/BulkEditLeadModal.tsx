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
  const [updateStatus, setUpdateStatus] = useState(false)
  const [updateReferral, setUpdateReferral] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!updateStatus && !updateReferral) {
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
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bulk Edit Leads</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-600">
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
              <label htmlFor="updateStatus" className="font-medium">
                Update Contact Status
              </label>
            </div>
            {updateStatus && (
              <select
                value={contactStatus}
                onChange={(e) => setContactStatus(e.target.value)}
                required={updateStatus}
                className="w-full p-2 border rounded"
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
              <label htmlFor="updateReferral" className="font-medium">
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
                className="w-full p-2 border rounded"
              />
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
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
