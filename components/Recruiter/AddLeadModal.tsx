/**
 * AddLeadModal Component - Enhanced with Robust CSV Import
 * Modal form for adding/editing leads individually or via CSV import
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'

interface Lead {
  id: string
  country: string
  contact_status: string
  last_contact_date: string | null
  notes: string | null
  created_at: string
  prospect_email: string | null
  prospect_name: string | null
  created_time: string | null
  referral_source: string | null
  phone: string | null
  campaign: string | null
  date_imported: string | null
  name_score: number | null
  email_score: number | null
  phone_valid: boolean | null
  recency_score: number | null
  lead_score: number | null
  lead_quality: string | null
  barcelona_timeline: number | null
}

interface AddLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editLead?: Lead | null
}

type TabType = 'single' | 'import'

interface CsvRow {
  data: {
    name: string
    email: string
    phone: string
    campaign: string
    campaign_name: string
    country: string
    status: string
    referral_destination: string
    notes: string
    name_score: string | null
    email_score: string | null
    phone_valid: string | boolean | null
    recency_score: string | null
    lead_score: string | null
    lead_quality: string | null
  }
  errors: string[]
  warnings: string[]
  isDuplicate: boolean
}

export default function AddLeadModal({ isOpen, onClose, onSuccess, editLead }: AddLeadModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('single')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    campaign: '',
    phone: '',
    country: '',
    contact_status: 'not_contacted',
    referral_source: '',
    notes: '',
    lead_quality: '',
    last_contact_date: '',
    created_time: '',
    barcelona_timeline: '',
  })
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<CsvRow[]>([])
  const [validRows, setValidRows] = useState(0)
  const [invalidRows, setInvalidRows] = useState(0)

  const baseCountries = [
    'USA', 'Canada', 'Mexico', 'Brazil', 'Spain', 'UK',
    'Germany', 'France', 'Italy', 'Portugal', 'Netherlands', 'Other'
  ]

  // Add current lead's country if editing and not in list
  const countries = useMemo(() => {
    if (editLead && editLead.country && !baseCountries.includes(editLead.country)) {
      return [...baseCountries.slice(0, -1), editLead.country, 'Other']
    }
    return baseCountries
  }, [editLead])

  const statuses = [
    { value: 'not_contacted', label: 'Not Contacted' },
    { value: 'referral', label: 'Referral' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'interested', label: 'Interested' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'converted', label: 'Converted' },
    { value: 'unqualified', label: 'Unqualified' }
  ]

  const validStatusValues = statuses.map(s => s.value)

  // Pre-populate form when editing
  useEffect(() => {
    if (editLead) {
      setFormData({
        id: editLead.id,
        name: editLead.prospect_name || '',
        email: editLead.prospect_email || '',
        phone: editLead.phone || '',
        campaign: editLead.campaign || '',
        country: editLead.country,
        contact_status: editLead.contact_status,
        referral_source: editLead.referral_source || '',
        notes: editLead.notes || '',
        lead_quality: editLead.lead_quality || '',
        last_contact_date: editLead.last_contact_date ? editLead.last_contact_date.split('T')[0] : '',
        created_time: editLead.created_time ? editLead.created_time.split('T')[0] : '',
        barcelona_timeline: editLead.barcelona_timeline ? editLead.barcelona_timeline.toString() : '',
      })
      setActiveTab('single')
    } else {
      setFormData({
        id: '',
        name: '',
        email: '',
        campaign: '',
        phone: '',
        country: '',
        contact_status: 'not_contacted',
        referral_source: '',
        notes: '',
        lead_quality: '',
        last_contact_date: '',
        created_time: '',
        barcelona_timeline: '',
      })
    }
  }, [editLead, isOpen])

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/recruiter/leads-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          ...(formData.id && { id: formData.id }),
          country: formData.country,
          contact_status: formData.contact_status,
          prospect_email: formData.email,
          prospect_name: formData.name,
          referral_source: formData.referral_source || null,
          phone: formData.phone || null,
          campaign: formData.campaign || null,
          notes: formData.notes,
          lead_quality: formData.lead_quality || null,
          last_contact_date: formData.last_contact_date || null,
          created_time: formData.created_time || null,
          barcelona_timeline: formData.barcelona_timeline ? parseInt(formData.barcelona_timeline) : null,
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${editLead ? 'update' : 'create'} lead`)
      }

      setSuccess(`Lead ${editLead ? 'updated' : 'added'} successfully!`)
      setFormData({
        id: '',
        name: '',
        email: '',
        campaign: '',
        phone: '',
        country: '',
        contact_status: 'not_contacted',
        referral_source: '',
        notes: '',
        lead_quality: '',
        last_contact_date: '',
        created_time: '',
        barcelona_timeline: ''
      })
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)
    } catch (err: any) {
      setError(err.message || `Failed to ${editLead ? 'update' : 'add'} lead`)
    } finally {
      setLoading(false)
    }
  }

  const parseCSVLine = (line: string): string[] => {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const normalizeHeader = (header: string): string => {
    return header.toLowerCase().trim().replace(/[_\s]+/g, '_')
  }

  const mapHeader = (header: string): string | null => {
    const normalized = normalizeHeader(header)

    const headerMap: { [key: string]: string } = {
      'name': 'name',
      'student_name': 'name',
      'prospect_name': 'name',
      'full_name': 'name',
      'email': 'email',
      'student_email': 'email',
      'prospect_email': 'email',
      'email_address': 'email',
      'phone': 'phone',
      'campaign': 'campaign',
      'campaign_name': 'campaign_name',
      'phone_number': 'phone',
      'mobile': 'phone',
      'telephone': 'phone',
      'contact_number': 'phone',
      'country': 'country',
      'location': 'country',
      'status': 'status',
      'contact_status': 'status',
      'lead_status': 'status',
      'referral_destination': 'referral_destination',
      'referral_source': 'referral_destination',
      'referral': 'referral_destination',
      'notes': 'notes',
      'note': 'notes',
      'comments': 'notes',
      'comment': 'notes',
      'name_score': 'name_score',
      'namescore': 'name_score',
      'email_score': 'email_score',
      'emailscore': 'email_score',
      'phone_valid': 'phone_valid',
      'phonevalid': 'phone_valid',
      'recency_score': 'recency_score',
      'recencyscore': 'recency_score',
      'lead_score': 'lead_score',
      'leadscore': 'lead_score',
      'lead_quality': 'lead_quality',
      'created_time': 'created_time',
      'createdtime': 'created_time',
      'date_acquired': 'created_time',
      'dateacquired': 'created_time',
      'acquisition_date': 'created_time',
      'acquisitiondate': 'created_time',
      'leadquality': 'lead_quality'
    }

    return headerMap[normalized] || null
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const normalizeStatus = (status: string): string => {
    const normalized = status.toLowerCase().trim().replace(/[_\s-]+/g, '_')

    // Direct match
    if (validStatusValues.includes(normalized)) {
      return normalized
    }

    // Fuzzy matching
    const statusMap: { [key: string]: string } = {
      'not_contacted': 'not_contacted',
      'notcontacted': 'not_contacted',
      'new': 'not_contacted',
      'referral': 'referral',
      'referred': 'referral',
      'contacted': 'contacted',
      'reached': 'contacted',
      'interested': 'interested',
      'warm': 'interested',
      'qualified': 'qualified',
      'hot': 'qualified',
      'converted': 'converted',
      'won': 'converted',
      'enrolled': 'converted',
      'unqualified': 'unqualified',
      'lost': 'unqualified',
      'rejected': 'unqualified'
    }

    return statusMap[normalized] || 'not_contacted'
  }

  const normalizeCountry = (country: string): string => {
    const trimmed = country.trim()

    // Check if it matches one of our predefined countries
    const match = countries.find(c =>
      c.toLowerCase() === trimmed.toLowerCase()
    )

    if (match) return match

    // Common aliases
    const countryMap: { [key: string]: string } = {
      'united states': 'USA',
      'us': 'USA',
      'united states of america': 'USA',
      'united kingdom': 'UK',
      'great britain': 'UK',
      'gb': 'UK',
      'brasil': 'Brazil',
      'espana': 'Spain',
      'deutschland': 'Germany',
      'france': 'France'
    }

    return countryMap[trimmed.toLowerCase()] || trimmed || 'Other'
  }

  const parseXLSX = (arrayBuffer: ArrayBuffer): string => {
    // Read the workbook
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]

    // Convert to CSV format
    const csv = XLSX.utils.sheet_to_csv(worksheet)

    return csv
  }

  const parseCSV = async (text: string): Promise<CsvRow[]> => {
    const lines = text.split(/\r?\n/).filter(line => line.trim())
    if (lines.length === 0) return []

    const headerLine = parseCSVLine(lines[0])
    const mappedHeaders = headerLine.map(h => mapHeader(h))

    const rows: CsvRow[] = []

    // Get existing leads to check for duplicates
    const supabase = createClient()
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('prospect_email')

    const existingEmails = new Set(
      existingLeads?.map(l => l.prospect_email?.toLowerCase()).filter(Boolean) || []
    )

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const rowData: any = {
        name: '',
        email: '',
        phone: '',
        campaign: '',
        campaign_name: '',
        country: '',
        status: 'not_contacted',
        referral_destination: '',
        notes: '',
        name_score: null,
        email_score: null,
        phone_valid: null,
        recency_score: null,
        lead_score: null,
        lead_quality: null
      }

      // Map values to fields
      mappedHeaders.forEach((header, index) => {
        if (header && values[index]) {
          rowData[header] = values[index]
        }
      })

      const errors: string[] = []
      const warnings: string[] = []

      // Validate name
      if (!rowData.name || rowData.name.trim().length === 0) {
        errors.push('Name is required')
      }

      // Validate email
      if (!rowData.email || rowData.email.trim().length === 0) {
        errors.push('Email is required')
      } else if (!validateEmail(rowData.email)) {
        errors.push('Invalid email format')
      }

      // Check for duplicate
      const isDuplicate = existingEmails.has(rowData.email.toLowerCase())
      if (isDuplicate) {
        warnings.push('Email already exists in database')
      }

      // Validate country
      if (!rowData.country || rowData.country.trim().length === 0) {
        warnings.push('Country is empty, will default to "Other"')
        rowData.country = 'Other'
      } else {
        rowData.country = normalizeCountry(rowData.country)
      }

      // Normalize status
      if (rowData.status) {
        rowData.status = normalizeStatus(rowData.status)
      }

      rows.push({
        data: rowData,
        errors,
        warnings,
        isDuplicate
      })
    }

    return rows
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    setLoading(true)
    setError('')

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()

      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Handle XLSX/XLS files
        const reader = new FileReader()

        reader.onload = async (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer
          const csvText = parseXLSX(arrayBuffer)
          const parsed = await parseCSV(csvText)
          setParsedRows(parsed)

          const valid = parsed.filter(r => r.errors.length === 0 && !r.isDuplicate).length
          const invalid = parsed.filter(r => r.errors.length > 0 || r.isDuplicate).length

          setValidRows(valid)
          setInvalidRows(invalid)
          setLoading(false)
        }

        reader.readAsArrayBuffer(file)
      } else {
        // Handle CSV files
        const reader = new FileReader()

        reader.onload = async (event) => {
          const text = event.target?.result as string
          const parsed = await parseCSV(text)
          setParsedRows(parsed)

          const valid = parsed.filter(r => r.errors.length === 0 && !r.isDuplicate).length
          const invalid = parsed.filter(r => r.errors.length > 0 || r.isDuplicate).length

          setValidRows(valid)
          setInvalidRows(invalid)
          setLoading(false)
        }

        reader.readAsText(file)
      }
    } catch (err: any) {
      setError('Failed to parse file: ' + err.message)
      setLoading(false)
    }
  }

  const handleCSVImport = async () => {
    if (parsedRows.length === 0) return

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        throw new Error('Not authenticated')
      }

      // Import all valid rows
      const rowsToImport = parsedRows.filter(row =>
        row.errors.length === 0 && !row.isDuplicate
      )

      console.log(`Preparing to import ${rowsToImport.length} leads`)

      if (rowsToImport.length === 0) {
        setError('No valid rows to import. Please check your file format.')
        setLoading(false)
        return
      }

      // Prepare data for bulk insert
      const leadsToInsert = rowsToImport.map(row => ({
        user_id: currentUser.id,
        country: row.data.country || 'Other',
        contact_status: row.data.status || 'not_contacted',
        prospect_email: row.data.email,
        prospect_name: row.data.name,
        referral_source: row.data.referral_destination || null,
        phone: row.data.phone || null,
        campaign_name: row.data.campaign_name || row.data.campaign || null,
        name_score: row.data.name_score ? parseInt(row.data.name_score) : null,
        email_score: row.data.email_score ? parseInt(row.data.email_score) : null,
        phone_valid: row.data.phone_valid === "TRUE" || row.data.phone_valid === true || row.data.phone_valid === "1",
        recency_score: row.data.recency_score ? parseInt(row.data.recency_score) : null,
        lead_score: row.data.lead_score ? parseInt(row.data.lead_score) : null,
        lead_quality: row.data.lead_quality || null,
        notes: row.data.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      // Process in batches of 100 to avoid Supabase limits
      const BATCH_SIZE = 100
      let totalInserted = 0
      const batches = []

      for (let i = 0; i < leadsToInsert.length; i += BATCH_SIZE) {
        batches.push(leadsToInsert.slice(i, i + BATCH_SIZE))
      }

      console.log(`Processing ${batches.length} batches of up to ${BATCH_SIZE} leads each`)

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        console.log(`Inserting batch ${i + 1}/${batches.length} (${batch.length} leads)`)

        const { data, error: insertError } = await supabase
          .from('leads')
          .insert(batch)
          .select()

        if (insertError) {
          console.error(`Batch ${i + 1} error:`, insertError)
          throw new Error(`Failed to import batch ${i + 1}: ${insertError.message}`)
        }

        totalInserted += data?.length || batch.length
        console.log(`Successfully inserted batch ${i + 1}. Total so far: ${totalInserted}`)
      }

      console.log(`Import complete! Total inserted: ${totalInserted} leads`)
      setSuccess(`Successfully imported ${totalInserted} leads!`)

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    } catch (err: any) {
      console.error('Import error:', err)
      setError(err.message || 'Failed to import CSV')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editLead ? 'Edit Lead' : 'Add Leads'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs - Only show when not editing */}
          {!editLead && (
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                onClick={() => setActiveTab('single')}
                className={`px-4 py-2 font-medium ${activeTab === 'single'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                  }`}
              >
                Single Lead
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`px-4 py-2 font-medium ${activeTab === 'import'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                  }`}
              >
                Import CSV
              </button>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-300 rounded">
              {success}
            </div>
          )}

          {/* Single Lead Tab (or Edit Form) */}
          {(activeTab === 'single' || editLead) && (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+1-555-123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign (Optional)</label>
                <input
                  type="text"
                  value={formData.campaign}
                  onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Spring 2025, Facebook Ads"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Status</label>
                <select
                  value={formData.contact_status}
                  onChange={(e) => setFormData({ ...formData, contact_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Referral Destination</label>
                <input
                  type="text"
                  value={formData.referral_source}
                  onChange={(e) => setFormData({ ...formData, referral_source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., University Name, Program, Partner Organization"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add any notes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lead Quality</label>
                  <select
                    value={formData.lead_quality}
                    onChange={(e) => setFormData({ ...formData, lead_quality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Not Scored</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Very Low">Very Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Acquired</label>
                  <input
                    type="date"
                    value={formData.created_time}
                    onChange={(e) => setFormData({ ...formData, created_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Contact Date</label>
                <input
                  type="date"
                  value={formData.last_contact_date}
                  onChange={(e) => setFormData({ ...formData, last_contact_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">When do you want to come to Barcelona?</label>
                <select
                  value={formData.barcelona_timeline}
                  onChange={(e) => setFormData({ ...formData, barcelona_timeline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select timeline</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (editLead ? 'Updating...' : 'Adding...') : (editLead ? 'Update Lead' : 'Add Lead')}
                </button>
              </div>
            </form>
          )}

          {/* CSV Import Tab */}
          {activeTab === 'import' && !editLead && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">CSV Format (Flexible)</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Your CSV file should have columns for name, email, phone, country, status, and notes. Header names are flexible:
                </p>
                <ul className="text-xs text-blue-600 space-y-1 mb-2">
                  <li>• <strong>Name:</strong> name, student_name, prospect_name, full_name</li>
                  <li>• <strong>Email:</strong> email, student_email, prospect_email, email_address</li>
                  <li>• <strong>Phone:</strong> phone, phone_number, mobile, telephone, contact_number</li>
                  <li>• <strong>Country:</strong> country, location</li>
                  <li>• <strong>Status:</strong> status, contact_status, lead_status</li>
                  <li>• <strong>Referral:</strong> referral_destination, referral_source, referral</li>
                  <li>• <strong>Notes:</strong> notes, note, comments, comment</li>
                </ul>
                <p className="text-xs text-blue-600">
                  ✓ Supports quoted fields with commas<br />
                  ✓ Case-insensitive headers<br />
                  ✓ Email validation<br />
                  ✓ Duplicate detection<br />
                  ✓ Auto-normalizes country and status values
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV or Excel File
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepts CSV (.csv) and Excel (.xlsx, .xls) files
                </p>
              </div>

              {parsedRows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Preview ({parsedRows.length} rows)
                    </h4>
                    <div className="flex gap-3 text-xs">
                      <span className="text-green-600 font-medium">✓ {validRows} valid</span>
                      {invalidRows > 0 && (
                        <span className="text-red-600 font-medium">✗ {invalidRows} invalid/duplicate</span>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-lg">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Email</th>
                          <th className="px-3 py-2 text-left">Phone</th>
                          <th className="px-3 py-2 text-left">Country</th>
                          <th className="px-3 py-2 text-left">Contact Status</th>
                          <th className="px-3 py-2 text-left">Issues</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.slice(0, 50).map((row, i) => (
                          <tr key={i} className={`border-t ${row.errors.length > 0 ? 'bg-red-50' :
                              row.isDuplicate ? 'bg-yellow-50' :
                                'bg-white'
                            }`}>
                            <td className="px-3 py-2">
                              {row.errors.length > 0 ? (
                                <span className="text-red-600 font-bold">✗</span>
                              ) : row.isDuplicate ? (
                                <span className="text-yellow-600 font-bold">⚠</span>
                              ) : (
                                <span className="text-green-600 font-bold">✓</span>
                              )}
                            </td>
                            <td className="px-3 py-2">{row.data.name}</td>
                            <td className="px-3 py-2">{row.data.email}</td>
                            <td className="px-3 py-2">{row.data.phone || 'N/A'}</td>
                            <td className="px-3 py-2">{row.data.country}</td>
                            <td className="px-3 py-2">
                              <span className="px-2 py-1 rounded text-xs bg-gray-100">
                                {row.data.status}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              {row.errors.length > 0 && (
                                <span className="text-red-600 text-xs">
                                  {row.errors.join(', ')}
                                </span>
                              )}
                              {row.warnings.length > 0 && (
                                <span className="text-yellow-600 text-xs">
                                  {row.warnings.join(', ')}
                                </span>
                              )}
                              {row.isDuplicate && (
                                <span className="text-yellow-600 text-xs">
                                  Duplicate email
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedRows.length > 50 && (
                      <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
                        Showing first 50 of {parsedRows.length} rows
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCSVImport}
                  disabled={!csvFile || validRows === 0 || loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Importing...' : `Import ${validRows} Valid Lead${validRows !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
