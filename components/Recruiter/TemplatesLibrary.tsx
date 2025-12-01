"use client"

import { useState, useEffect } from "react"
import {
  DocumentTextIcon,
  CreditCardIcon,
  GlobeAltIcon,
  HomeIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  MapIcon,
  HeartIcon,
  PaperAirplaneIcon,
  ClipboardDocumentIcon,
  LinkIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  PhotoIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline"

interface Category {
  id: string
  name: string
  description: string
  icon: string
  display_order: number
}

interface Template {
  id: string
  category_id: string
  name: string
  description: string
  file_type: string
  file_url: string
  file_size: number
  content: string
  version: string
  visibility: string
  created_at: string
  updated_at: string
  template_categories?: { name: string; icon: string }
}

interface QuickMessage {
  id: string
  category_id: string
  title: string
  content: string
  created_at: string
  template_categories?: { name: string; icon: string }
}

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
}

interface TemplatesLibraryProps {
  isAdmin?: boolean
  selectedLead?: Lead | null
  onSendComplete?: () => void
}

const iconMap: Record<string, React.ElementType> = {
  FileText: DocumentTextIcon,
  CreditCard: CreditCardIcon,
  Globe: GlobeAltIcon,
  Home: HomeIcon,
  Briefcase: BriefcaseIcon,
  Calendar: CalendarIcon,
  CheckSquare: CheckIcon,
  Map: MapIcon,
  Heart: HeartIcon,
}

export default function TemplatesLibrary({
  isAdmin = false,
  selectedLead,
  onSendComplete,
}: TemplatesLibraryProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"templates" | "messages">("templates")

  const [previewItem, setPreviewItem] = useState<Template | null>(null)
  const [sendItem, setSendItem] = useState<Template | QuickMessage | null>(null)
  const [sendType, setSendType] = useState<"template" | "message">("template")
  const [sending, setSending] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState<"template" | "message">("template")
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    content: "",
    category_id: "",
    file_type: "pdf",
    file_url: "",
    version: "1.0",
    visibility: "all",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/recruiter/templates")
      const data = await res.json()
      if (data.success) {
        setCategories(data.data.categories)
        setTemplates(data.data.templates)
        setQuickMessages(data.data.quickMessages)
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = !selectedCategory || t.category_id === selectedCategory
    const matchesSearch =
      !searchTerm ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredMessages = quickMessages.filter((m) => {
    const matchesCategory = !selectedCategory || m.category_id === selectedCategory
    const matchesSearch =
      !searchTerm ||
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleSend = async (method: string) => {
    if (!sendItem) return
    setSending(true)

    try {
      const payload: Record<string, unknown> = {
        send_method: method,
      }

      if (sendType === "template") {
        payload.template_id = sendItem.id
      } else {
        payload.quick_message_id = sendItem.id
      }

      if (selectedLead) {
        payload.lead_id = selectedLead.id
        payload.recipient_email = selectedLead.prospect_email
        payload.recipient_phone = selectedLead.phone
      }

      const res = await fetch("/api/recruiter/templates/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        if (method === "link_copied") {
          const url = sendType === "template" ? (sendItem as Template).file_url : ""
          if (url) {
            await navigator.clipboard.writeText(url)
            alert("Link copied to clipboard!")
          }
        } else if (method === "email" && selectedLead?.prospect_email) {
          const subject = encodeURIComponent(
            sendType === "template" ? (sendItem as Template).name : (sendItem as QuickMessage).title
          )
          const body = encodeURIComponent(
            sendType === "template"
              ? `Please find the attached document: ${(sendItem as Template).file_url}`
              : (sendItem as QuickMessage).content
          )
          window.open(`mailto:${selectedLead.prospect_email}?subject=${subject}&body=${body}`)
        } else if (method === "whatsapp" && selectedLead?.phone) {
          const text = encodeURIComponent(
            sendType === "template"
              ? `${(sendItem as Template).name}: ${(sendItem as Template).file_url}`
              : (sendItem as QuickMessage).content
          )
          const phone = selectedLead.phone.replace(/\D/g, "")
          window.open(`https://wa.me/${phone}?text=${text}`)
        }
        setSendItem(null)
        onSendComplete?.()
      }
    } catch (error) {
      console.error("Error sending:", error)
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const res = await fetch("/api/recruiter/templates/upload", {
        method: "POST",
        body: formDataUpload,
      })

      const data = await res.json()
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          file_url: data.data.file_url,
          file_type: data.data.file_type,
        }))
      } else {
        alert(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const payload: Record<string, unknown> = {
        type: addType === "message" ? "quick_message" : "template",
        category_id: formData.category_id || null,
      }

      if (addType === "message") {
        payload.title = formData.title
        payload.content = formData.content
      } else {
        payload.name = formData.name
        payload.description = formData.description
        payload.file_type = formData.file_type
        payload.file_url = formData.file_url
        payload.version = formData.version
        payload.visibility = formData.visibility
      }

      const res = await fetch("/api/recruiter/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        setShowAddModal(false)
        setFormData({
          name: "",
          title: "",
          description: "",
          content: "",
          category_id: "",
          file_type: "pdf",
          file_url: "",
          version: "1.0",
          visibility: "all",
        })
        fetchData()
      } else {
        alert(data.error || "Failed to create")
      }
    } catch (error) {
      console.error("Submit error:", error)
    }
  }

  const handleDelete = async (id: string, type: "template" | "message") => {
    if (!confirm("Are you sure you want to delete this?")) return

    try {
      const res = await fetch(
        `/api/recruiter/templates/manage?id=${id}&type=${type === "message" ? "quick_message" : "template"}`,
        { method: "DELETE" }
      )

      const data = await res.json()
      if (data.success) {
        fetchData()
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return ""
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <DocumentTextIcon className="w-5 h-5 text-red-500" />
      case "docx":
        return <DocumentIcon className="w-5 h-5 text-blue-500" />
      case "image":
        return <PhotoIcon className="w-5 h-5 text-green-500" />
      case "url":
        return <ArrowTopRightOnSquareIcon className="w-5 h-5 text-purple-500" />
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getCategoryIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || DocumentTextIcon
    return <Icon className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Templates & Library</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedLead
              ? `Sending to: ${selectedLead.prospect_name || 'Unknown'}`
              : "Select documents to send to leads"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4" />
            Add Template
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "templates"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "messages"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Quick Messages
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedCategory
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {getCategoryIcon(cat.icon)}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "templates" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              No templates found. {isAdmin && "Click 'Add Template' to create one."}
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(template.file_type)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {template.template_categories?.name} • v{template.version}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(template.id, "template")}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {template.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {template.description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {formatFileSize(template.file_size)}
                  </span>
                  <div className="flex gap-2">
                    {(template.file_type === "pdf" || template.file_type === "image") && (
                      <button
                        onClick={() => setPreviewItem(template)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                        title="Preview"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSendItem(template)
                        setSendType("template")
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      <PaperAirplaneIcon className="w-3.5 h-3.5" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMessages.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              No quick messages found. {isAdmin && "Click 'Add Template' to create one."}
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{msg.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{msg.template_categories?.name}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(msg.id, "message")}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{msg.content}</p>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => copyToClipboard(msg.content)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                    title="Copy"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSendItem(msg)
                      setSendType("message")
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    <PaperAirplaneIcon className="w-3.5 h-3.5" />
                    Send
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">{previewItem.name}</h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 h-[70vh] overflow-auto">
              {previewItem.file_type === "pdf" ? (
                <iframe
                  src={previewItem.file_url}
                  className="w-full h-full"
                  title={previewItem.name}
                />
              ) : previewItem.file_type === "image" ? (
                <img
                  src={previewItem.file_url}
                  alt={previewItem.name}
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <p>Preview not available for this file type</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {sendItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Send {sendType === "template" ? "Document" : "Message"}
              </h3>
              <button
                onClick={() => setSendItem(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {sendType === "template"
                  ? (sendItem as Template).name
                  : (sendItem as QuickMessage).title}
              </p>
              {selectedLead && (
                <p className="text-sm text-gray-500 mb-4">
                  To: {selectedLead.prospect_name || 'Unknown'} ({selectedLead.prospect_email || 'No email'})
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSend("email")}
                  disabled={sending}
                  className="flex items-center justify-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900 dark:text-white">Email</span>
                </button>
                <button
                  onClick={() => handleSend("whatsapp")}
                  disabled={sending}
                  className="flex items-center justify-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5 text-green-600" />
                  <span className="text-gray-900 dark:text-white">WhatsApp</span>
                </button>
                {sendType === "template" && (
                  <>
                    <button
                      onClick={() => handleSend("link_copied")}
                      disabled={sending}
                      className="flex items-center justify-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <LinkIcon className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-900 dark:text-white">Copy Link</span>
                    </button>
                    <button
                      onClick={() => {
                        window.open((sendItem as Template).file_url, "_blank")
                        handleSend("attached")
                      }}
                      disabled={sending}
                      className="flex items-center justify-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900 dark:text-white">Open File</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Add New Template</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setAddType("template")}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    addType === "template"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Document
                </button>
                <button
                  onClick={() => setAddType("message")}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    addType === "message"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Quick Message
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category_id: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {addType === "template" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Program Brochure 2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={2}
                      placeholder="Brief description of this document"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.gif"
                        onChange={handleFileUpload}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={uploading}
                      />
                      {uploading && (
                        <p className="text-sm text-blue-600">Uploading...</p>
                      )}
                      {formData.file_url && (
                        <p className="text-sm text-green-600">File uploaded successfully</p>
                      )}
                      <p className="text-xs text-gray-500">Or enter URL:</p>
                      <input
                        type="url"
                        value={formData.file_url}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, file_url: e.target.value }))
                        }
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, version: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="1.0"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Visa Process Introduction"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, content: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={4}
                      placeholder="Enter the message text..."
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    addType === "template"
                      ? !formData.name || !formData.file_url
                      : !formData.title || !formData.content
                  }
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
