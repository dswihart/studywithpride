'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'
import { useLanguage } from '@/components/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { createClient } from '@/lib/supabase/client'

interface Document {
  id: string
  name: string
  file_url: string
  file_size: number
  uploaded_at: string
  document_type: string
}

interface ApplicationData {
  id?: string
  university_name: string
  program_name: string
  intake_term: string
  application_status: string
  documents_uploaded: Document[]
  notes: string
}

const REQUIRED_DOCUMENTS = [
  { id: 'transcript', name: 'Academic Transcript', description: 'Official transcript from your current/previous institution' },
  { id: 'passport', name: 'Passport Copy', description: 'Clear copy of your passport photo page' },
  { id: 'cv', name: 'Curriculum Vitae (CV)', description: 'Your academic and professional CV' },
  { id: 'motivation', name: 'Motivation Letter', description: 'Letter explaining why you want to study this program' },
  { id: 'recommendation', name: 'Letter of Recommendation', description: 'Academic or professional reference letter' },
]

export default function UniversityApplicationPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const supabase = createClient()

  const universityId = params?.universityId as string || 'upf'

  const [application, setApplication] = useState<ApplicationData>({
    university_name: 'Universitat Pompeu Fabra',
    program_name: 'Master in International Studies',
    intake_term: 'Fall 2025',
    application_status: 'draft',
    documents_uploaded: [],
    notes: ''
  })

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchApplicationData()
    }
  }, [user])

  const fetchApplicationData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/portal/get-visa-status')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data && result.data.length > 0) {
          const appData = result.data[0]
          setApplication({
            ...application,
            ...appData,
            documents_uploaded: appData.documents_uploaded || []
          })
        }
      }
    } catch (err) {
      console.error('Error fetching application:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (documentType: string, file: File) => {
    if (!user) return

    setUploading(documentType)
    setError(null)
    setSuccess(null)

    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(t('fileSizeError'))
        return
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${universityId}/${documentType}-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('application-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('application-documents')
        .getPublicUrl(fileName)

      // Create document record
      const newDocument: Document = {
        id: Date.now().toString(),
        name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
        document_type: documentType
      }

      // Update application with new document
      const updatedDocuments = [...application.documents_uploaded, newDocument]

      const response = await fetch('/api/portal/update-visa-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...application,
          documents_uploaded: updatedDocuments
        })
      })

      if (response.ok) {
        setApplication({
          ...application,
          documents_uploaded: updatedDocuments
        })
        setSuccess(`${file.name} ${t('uploadSuccess')}`)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        throw new Error(t('uploadFailed'))
      }
    } catch (err: any) {
      setError(err.message || t('uploadFailed'))
    } finally {
      setUploading(null)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm(t('deleteConfirm'))) return

    try {
      const updatedDocuments = application.documents_uploaded.filter(d => d.id !== documentId)

      const response = await fetch('/api/portal/update-visa-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...application,
          documents_uploaded: updatedDocuments
        })
      })

      if (response.ok) {
        setApplication({
          ...application,
          documents_uploaded: updatedDocuments
        })
        setSuccess(t('documentDeleted'))
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(t('deleteFailed'))
    }
  }

  const getUploadedDocument = (docType: string) => {
    return application.documents_uploaded.find(d => d.document_type === docType)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>{t('loadingApplication')}</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-gray-950 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/student-portal"
            className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center mb-4"
          >
            ← {t('backToPortal')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {application.university_name}
          </h1>
          <p className="text-gray-600">
            {application.program_name} • {application.intake_term}
          </p>
        </div>

        {/* Status Badge */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('applicationStatus')}</p>
              <p className="text-lg font-semibold capitalize">{application.application_status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('documentsUploaded')}</p>
              <p className="text-lg font-semibold">{application.documents_uploaded.length} / {REQUIRED_DOCUMENTS.length}</p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Document Upload Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">{t('requiredDocuments')}</h2>

            <div className="space-y-4">
              {REQUIRED_DOCUMENTS.map((doc) => {
                const uploaded = getUploadedDocument(doc.id)
                const isUploading = uploading === doc.id

                return (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{doc.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{doc.description}</p>

                        {uploaded ? (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center text-green-600">
                              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm font-medium">{t('uploaded')}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {uploaded.name} ({formatFileSize(uploaded.file_size)})
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={uploaded.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                {t('view')}
                              </a>
                              <button
                                onClick={() => handleDeleteDocument(uploaded.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                {t('delete')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              id={`file-${doc.id}`}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  handleFileUpload(doc.id, file)
                                }
                              }}
                              disabled={isUploading}
                            />
                            <label
                              htmlFor={`file-${doc.id}`}
                              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium cursor-pointer transition ${
                                isUploading
                                  ? 'bg-gray-300 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {isUploading ? (
                                <>
                                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  {t('uploading')}
                                </>
                              ) : (
                                <>
                                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  {t('uploadDocument')}
                                </>
                              )}
                            </label>
                            <p className="text-xs text-gray-500 mt-2">
                              {t('acceptedFormats')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-3">{t('applicationNotes')}</h3>
          <textarea
            value={application.notes}
            onChange={(e) => setApplication({ ...application, notes: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={4}
            placeholder={t('addApplicationNotes')}
          />
          <button
            onClick={async () => {
              const response = await fetch('/api/portal/update-visa-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(application)
              })
              if (response.ok) {
                setSuccess(t('notesSaved'))
                setTimeout(() => setSuccess(null), 3000)
              }
            }}
            className="mt-3 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            {t('saveNotes')}
          </button>
        </div>
      </div>
    </div>
  )
}
