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
  UserGroupIcon,
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

interface PortalStudent {
  id: string
  email: string
  full_name: string | null
  country_of_origin: string | null
  phone_number: string | null
  crm_lead_id: string | null
  role: string
}

interface TemplatesLibraryProps {
  isAdmin?: boolean
  selectedLead?: Lead | null
  onSendComplete?: () => void
  fullWidth?: boolean
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
  fullWidth = false,
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

  // Portal student selection state
  const [showStudentSelectModal, setShowStudentSelectModal] = useState(false)
  const [portalStudents, setPortalStudents] = useState<PortalStudent[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<PortalStudent | null>(null)
  const [sendingToStudent, setSendingToStudent] = useState(false)
  const [studentSendItem, setStudentSendItem] = useState<Template | QuickMessage | null>(null)
  const [studentSendType, setStudentSendType] = useState<"template" | "message">("template")
  const [customSubject, setCustomSubject] = useState("")
  const [customMessage, setCustomMessage] = useState("")

  // Lead selection state (for sending to CRM leads)
  const [showLeadSelectModal, setShowLeadSelectModal] = useState(false)
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [leadSearchTerm, setLeadSearchTerm] = useState("")
  const [selectedLeadForSend, setSelectedLeadForSend] = useState<Lead | null>(null)
  const [sendingToLead, setSendingToLead] = useState(false)
  const [leadSendItem, setLeadSendItem] = useState<Template | QuickMessage | null>(null)
  const [leadSendType, setLeadSendType] = useState<"template" | "message">("template")
  const [leadCustomSubject, setLeadCustomSubject] = useState("")
  const [leadCustomMessage, setLeadCustomMessage] = useState("")

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

  const fetchPortalStudents = async () => {
    setLoadingStudents(true)
    try {
      const res = await fetch("/api/recruiter/student-accounts?role=student")
      const data = await res.json()
      if (data.success) {
        setPortalStudents(data.data)
      }
    } catch (error) {
      console.error("Error fetching portal students:", error)
    } finally {
      setLoadingStudents(false)
    }
  }

  const fetchAllLeads = async () => {
    setLoadingLeads(true)
    try {
      const res = await fetch("/api/recruiter/leads-read")
      const data = await res.json()
      if (data.success) {
        // Filter leads that have email addresses
        setAllLeads(data.data.filter((l: any) => l.prospect_email))
      }
    } catch (error) {
      console.error("Error fetching leads:", error)
    } finally {
      setLoadingLeads(false)
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

  const filteredStudents = portalStudents.filter((s) => {
    if (!studentSearchTerm) return true
    const searchLower = studentSearchTerm.toLowerCase()
    return (
      s.email?.toLowerCase().includes(searchLower) ||
      s.full_name?.toLowerCase().includes(searchLower) ||
      s.country_of_origin?.toLowerCase().includes(searchLower)
    )
  })

  const filteredLeads = allLeads.filter((l) => {
    if (!leadSearchTerm) return true
    const searchLower = leadSearchTerm.toLowerCase()
    return (
      l.prospect_email?.toLowerCase().includes(searchLower) ||
      l.prospect_name?.toLowerCase().includes(searchLower) ||
      l.phone?.toLowerCase().includes(searchLower)
    )
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
        payload.recipient_name = selectedLead.prospect_name
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
        } else if (method === "email") {
          if (data.emailSent) {
            alert("Email sent successfully!")
          } else if (selectedLead?.prospect_email) {
            const subject = encodeURIComponent(
              sendType === "template" ? (sendItem as Template).name : (sendItem as QuickMessage).title
            )
            const body = encodeURIComponent(
              sendType === "template"
                ? `Please find the attached document: ${(sendItem as Template).file_url}`
                : (sendItem as QuickMessage).content
            )
            window.open(`mailto:${selectedLead.prospect_email}?subject=${subject}&body=${body}`)
          }
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

  // Open student selection modal
  const handleSendToPortalStudent = (item: Template | QuickMessage, type: "template" | "message") => {
    setStudentSendItem(item)
    setStudentSendType(type)
    setShowStudentSelectModal(true)
    setSelectedStudent(null)
    setCustomSubject(type === "template" ? (item as Template).name : (item as QuickMessage).title)
    setCustomMessage(type === "template" ? (item as Template).description || "" : (item as QuickMessage).content)
    if (portalStudents.length === 0) {
      fetchPortalStudents()
    }
  }

  // Send to selected portal student
  const handleSendToStudent = async () => {
    if (!selectedStudent || !studentSendItem) return
    setSendingToStudent(true)

    try {
      const payload: Record<string, unknown> = {
        send_method: "email",
        recipient_email: selectedStudent.email,
        recipient_name: selectedStudent.full_name || selectedStudent.email,
        student_user_id: selectedStudent.id,
        custom_subject: customSubject,
        custom_message: customMessage,
      }

      if (studentSendType === "template") {
        payload.template_id = studentSendItem.id
      } else {
        payload.quick_message_id = studentSendItem.id
      }

      // If student has a linked CRM lead, include lead_id for contact history logging
      if (selectedStudent.crm_lead_id) {
        payload.lead_id = selectedStudent.crm_lead_id
      }

      const res = await fetch("/api/recruiter/templates/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        if (data.emailSent) {
          alert(`Email sent successfully to ${selectedStudent.full_name || selectedStudent.email}!`)
        } else {
          alert(data.message || "Action logged. Email may not have been sent (check Resend configuration).")
        }
        setShowStudentSelectModal(false)
        setSelectedStudent(null)
        setStudentSendItem(null)
        onSendComplete?.()
      } else {
        alert(data.error || "Failed to send email")
      }
    } catch (error) {
      console.error("Error sending to student:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSendingToStudent(false)
    }
  }

  // Open lead selection modal
  const handleSendToLead = (item: Template | QuickMessage, type: "template" | "message") => {
    setLeadSendItem(item)
    setLeadSendType(type)
    setShowLeadSelectModal(true)
    setSelectedLeadForSend(null)
    setLeadCustomSubject(type === "template" ? (item as Template).name : (item as QuickMessage).title)
    setLeadCustomMessage(type === "template" ? (item as Template).description || "" : (item as QuickMessage).content)
    if (allLeads.length === 0) {
      fetchAllLeads()
    }
  }

  // Send to selected lead
  const handleSendToSelectedLead = async () => {
    if (!selectedLeadForSend || !leadSendItem) return
    setSendingToLead(true)

    try {
      const payload: Record<string, unknown> = {
        send_method: "email",
        recipient_email: selectedLeadForSend.prospect_email,
        recipient_name: selectedLeadForSend.prospect_name || selectedLeadForSend.prospect_email,
        lead_id: selectedLeadForSend.id,
        custom_subject: leadCustomSubject,
        custom_message: leadCustomMessage,
      }

      if (leadSendType === "template") {
        payload.template_id = leadSendItem.id
      } else {
        payload.quick_message_id = leadSendItem.id
      }

      const res = await fetch("/api/recruiter/templates/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        if (data.emailSent) {
          alert(`Email sent successfully to ${selectedLeadForSend.prospect_name || selectedLeadForSend.prospect_email}!`)
        } else {
          alert(data.message || "Action logged. Email may not have been sent (check Resend configuration).")
        }
        setShowLeadSelectModal(false)
        setSelectedLeadForSend(null)
        setLeadSendItem(null)
        onSendComplete?.()
      } else {
        alert(data.error || "Failed to send email")
      }
    } catch (error) {
      console.error("Error sending to lead:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSendingToLead(false)
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
    <div className={`space-y-4 ${fullWidth ? "p-6" : ""}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Templates & Library</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedLead
              ? `Sending to: ${selectedLead.prospect_name || 'Unknown'}`
              : "Manage documents and send to leads or portal students"}
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

      {/* Content - Templates Grid */}
      {activeTab === "templates" ? (
        <div className={`grid gap-4 ${fullWidth ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
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
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleSendToLead(template, "template")}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                          title="Email to Lead"
                        >
                          <EnvelopeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendToPortalStudent(template, "template")}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                          title="Send to Portal Student"
                        >
                          <UserGroupIcon className="w-4 h-4" />
                        </button>
                      </>
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
        <div className={`grid gap-4 ${fullWidth ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
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
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleSendToLead(msg, "message")}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                        title="Email to Lead"
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendToPortalStudent(msg, "message")}
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                        title="Send to Portal Student"
                      >
                        <UserGroupIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
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

      {/* Send Modal (for leads) */}
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

      {/* Portal Student Selection Modal */}
      {showStudentSelectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Send to Portal Student</h3>
                <p className="text-sm text-gray-500">
                  {studentSendType === "template"
                    ? (studentSendItem as Template)?.name
                    : (studentSendItem as QuickMessage)?.title}
                </p>
              </div>
              <button
                onClick={() => setShowStudentSelectModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {!selectedStudent ? (
              <>
                {/* Student Search */}
                <div className="p-4 border-b dark:border-gray-700">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students by name, email, or country..."
                      value={studentSearchTerm}
                      onChange={(e) => setStudentSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Student List */}
                <div className="p-4 max-h-[400px] overflow-y-auto">
                  {loadingStudents ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No students found</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className="w-full p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {student.full_name || "No name"}
                              </p>
                              <p className="text-sm text-gray-500">{student.email}</p>
                            </div>
                            <div className="text-right">
                              {student.country_of_origin && (
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                  {student.country_of_origin}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Email Customization */}
                <div className="p-4 space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Sending to:</strong> {selectedStudent.full_name || selectedStudent.email}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">{selectedStudent.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message (optional)
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Add a personal message..."
                    />
                  </div>

                  {studentSendType === "template" && (studentSendItem as Template)?.file_url && (
                    <p className="text-sm text-gray-500">
                      Document link will be included: {(studentSendItem as Template).file_url}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t dark:border-gray-700 flex gap-3">
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSendToStudent}
                    disabled={sendingToStudent}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sendingToStudent ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <EnvelopeIcon className="w-4 h-4" />
                        Send Email
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
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

                  <div className="grid grid-cols-2 gap-4">
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Visibility
                      </label>
                      <select
                        value={formData.visibility}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, visibility: e.target.value }))
                        }
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="all">All</option>
                        <option value="internal">Internal</option>
                        <option value="student">Student</option>
                      </select>
                    </div>
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
                      placeholder="e.g., Welcome Message"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, content: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={6}
                      placeholder="Message content..."
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
