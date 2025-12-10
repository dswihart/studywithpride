"use client"

import { useState, useMemo, useCallback } from "react"
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"

// Types
import { Template, QuickMessage, TemplatesLibraryProps, ActiveTab, ItemType } from "./types"

// Hook
import { useTemplates } from "./useTemplates"

// Components
import { TemplateCard } from "./TemplateCard"
import { QuickMessageCard } from "./QuickMessageCard"
import { SendModal } from "./SendModal"
import { PreviewModal } from "./PreviewModal"
import { StudentSelectModal } from "./StudentSelectModal"
import { LeadSelectModal } from "./LeadSelectModal"
import { AddTemplateModal } from "./AddTemplateModal"

// Utils
import { getCategoryIcon } from "./utils"

export default function TemplatesLibrary({
  isAdmin = false,
  selectedLead,
  onSendComplete,
  fullWidth = false,
}: TemplatesLibraryProps) {
  // Data hook
  const {
    categories,
    templates,
    quickMessages,
    portalStudents,
    allLeads,
    loading,
    loadingStudents,
    loadingLeads,
    fetchPortalStudents,
    fetchAllLeads,
    deleteItem,
    createItem,
  } = useTemplates()

  // UI State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<ActiveTab>("templates")

  // Modal State
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [sendItem, setSendItem] = useState<{ item: Template | QuickMessage; type: ItemType } | null>(null)
  const [studentSendItem, setStudentSendItem] = useState<{ item: Template | QuickMessage; type: ItemType } | null>(null)
  const [leadSendItem, setLeadSendItem] = useState<{ item: Template | QuickMessage; type: ItemType } | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Filtered data
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesCategory = !selectedCategory || t.category_id === selectedCategory
      const matchesSearch =
        !searchTerm ||
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [templates, selectedCategory, searchTerm])

  const filteredMessages = useMemo(() => {
    return quickMessages.filter((m) => {
      const matchesCategory = !selectedCategory || m.category_id === selectedCategory
      const matchesSearch =
        !searchTerm ||
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.content.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [quickMessages, selectedCategory, searchTerm])

  // Handlers
  const handleSendToStudent = useCallback((item: Template | QuickMessage, type: ItemType) => {
    setStudentSendItem({ item, type })
    fetchPortalStudents()
  }, [fetchPortalStudents])

  const handleSendToLead = useCallback((item: Template | QuickMessage, type: ItemType) => {
    setLeadSendItem({ item, type })
    fetchAllLeads()
  }, [fetchAllLeads])

  const handleDelete = useCallback(async (id: string, type: ItemType) => {
    if (!confirm("Are you sure you want to delete this?")) return
    await deleteItem(id, type)
  }, [deleteItem])

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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Templates & Library
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedLead
              ? `Sending to: ${selectedLead.prospect_name || "Unknown"}`
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

      {/* Content Grid */}
      {activeTab === "templates" ? (
        <div
          className={`grid gap-4 ${
            fullWidth
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              No templates found. {isAdmin && "Click 'Add Template' to create one."}
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isAdmin={isAdmin}
                onPreview={setPreviewTemplate}
                onSend={(t) => setSendItem({ item: t, type: "template" })}
                onSendToLead={(t) => handleSendToLead(t, "template")}
                onSendToStudent={(t) => handleSendToStudent(t, "template")}
                onDelete={(id) => handleDelete(id, "template")}
              />
            ))
          )}
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            fullWidth ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {filteredMessages.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              No quick messages found. {isAdmin && "Click 'Add Template' to create one."}
            </div>
          ) : (
            filteredMessages.map((message) => (
              <QuickMessageCard
                key={message.id}
                message={message}
                isAdmin={isAdmin}
                onSend={(m) => setSendItem({ item: m, type: "message" })}
                onSendToLead={(m) => handleSendToLead(m, "message")}
                onSendToStudent={(m) => handleSendToStudent(m, "message")}
                onDelete={(id) => handleDelete(id, "message")}
              />
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {previewTemplate && (
        <PreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
      )}

      {sendItem && (
        <SendModal
          item={sendItem.item}
          itemType={sendItem.type}
          selectedLead={selectedLead}
          onClose={() => setSendItem(null)}
          onSendComplete={onSendComplete}
        />
      )}

      {studentSendItem && (
        <StudentSelectModal
          item={studentSendItem.item}
          itemType={studentSendItem.type}
          students={portalStudents}
          loading={loadingStudents}
          onClose={() => setStudentSendItem(null)}
          onSendComplete={onSendComplete}
        />
      )}

      {leadSendItem && (
        <LeadSelectModal
          item={leadSendItem.item}
          itemType={leadSendItem.type}
          leads={allLeads}
          loading={loadingLeads}
          onClose={() => setLeadSendItem(null)}
          onSendComplete={onSendComplete}
        />
      )}

      {showAddModal && (
        <AddTemplateModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSubmit={createItem}
        />
      )}
    </div>
  )
}

// Re-export for backwards compatibility
export { TemplatesLibrary }
