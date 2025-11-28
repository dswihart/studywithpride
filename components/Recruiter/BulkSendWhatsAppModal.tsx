/**
 * BulkSendWhatsAppModal Component
 * Modal for sending WhatsApp template messages to multiple selected leads
 */

"use client"

import { useState } from "react"
import { WHATSAPP_TEMPLATES } from "@/lib/whatsapp/templates"

interface Lead {
  id: string
  prospect_name: string | null
  phone: string | null
  country: string
  phone_valid: boolean | null
}

interface SendResult {
  leadId: string
  leadName: string | null
  success: boolean
  messageId?: string
  error?: string
}

interface BulkSendWhatsAppModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  selectedLeads: Lead[]
}

export default function BulkSendWhatsAppModal({
  isOpen,
  onClose,
  onSuccess,
  selectedLeads
}: BulkSendWhatsAppModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string>("")
  const [results, setResults] = useState<SendResult[] | null>(null)
  const [progress, setProgress] = useState({ sent: 0, total: 0 })

  if (!isOpen) return null

  const validLeads = selectedLeads.filter(lead => lead.phone && lead.phone_valid)
  const invalidLeads = selectedLeads.filter(lead => !lead.phone || !lead.phone_valid)

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    setError("")
    setResults(null)
  }

  const getPreviewMessage = () => {
    const template = WHATSAPP_TEMPLATES.find(t => t.id === selectedTemplate)
    if (!template) return ""
    let preview = template.body
    preview = preview.replace("{{1}}", "[Lead Name]")
    if (template.params >= 2) preview = preview.replace("{{2}}", "[Country]")
    if (template.params >= 3) preview = preview.replace("{{3}}", "[Param 3]")
    return preview
  }

  const handleSend = async () => {
    if (!selectedTemplate) {
      setError("Please select a message template")
      return
    }
    if (validLeads.length === 0) {
      setError("No leads with valid phone numbers selected")
      return
    }

    setSending(true)
    setError("")
    setResults(null)
    setProgress({ sent: 0, total: validLeads.length })

    try {
      const response = await fetch("/api/recruiter/bulk-send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: validLeads.map(l => l.id),
          templateId: selectedTemplate
        })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || "Failed to send messages")
        setSending(false)
        return
      }

      setResults(result.data.results)
      setProgress({ sent: result.data.totalSent, total: result.data.totalRequested })
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setSelectedTemplate("")
    setError("")
    setResults(null)
    setProgress({ sent: 0, total: 0 })
    setSending(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Bulk Send WhatsApp
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Send template message to {selectedLeads.length} selected lead{selectedLeads.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={handleClose} disabled={sending} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-green-50 dark:bg-green-900/30 p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold text-green-700 dark:text-green-400">{validLeads.length} Valid</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-500 mt-1">Ready to receive messages</p>
          </div>
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/30 p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-semibold text-yellow-700 dark:text-yellow-400">{invalidLeads.length} Skipped</span>
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">Missing or invalid phone</p>
          </div>
        </div>

        {!results && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Template</label>
              <select value={selectedTemplate} onChange={(e) => handleTemplateChange(e.target.value)} disabled={sending} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:border-blue-500 focus:outline-none disabled:opacity-50">
                <option value="">-- Choose a template --</option>
                {WHATSAPP_TEMPLATES.map(template => (
                  <option key={template.id} value={template.id}>{template.name} - {template.description}</option>
                ))}
              </select>
            </div>
            {selectedTemplate && (
              <div className="mb-4 rounded-lg bg-gray-50 dark:bg-gray-700 p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Preview</label>
                <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{getPreviewMessage()}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">[Lead Name] and [Country] will be replaced with actual lead data</p>
              </div>
            )}
          </>
        )}

        {sending && (
          <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 p-4">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-blue-700 dark:text-blue-400 font-medium">Sending messages...</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">Please wait, this may take a moment...</p>
          </div>
        )}

        {results && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Results</h3>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">{results.filter(r => r.success).length} Sent</span>
                <span className="text-red-600">{results.filter(r => !r.success).length} Failed</span>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Lead</th>
                    <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {results.map((result, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-2 text-gray-900 dark:text-white">{result.leadName || "Unknown"}</td>
                      <td className="px-4 py-2">
                        {result.success ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600" title={result.error}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                            {result.error || "Failed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-400">{error}</div>}

        <div className="flex justify-end gap-3">
          <button onClick={handleClose} disabled={sending} className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            {results ? "Close" : "Cancel"}
          </button>
          {!results && (
            <button onClick={handleSend} disabled={sending || !selectedTemplate || validLeads.length === 0} className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {sending ? "Sending..." : `Send to ${validLeads.length} Lead${validLeads.length !== 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
