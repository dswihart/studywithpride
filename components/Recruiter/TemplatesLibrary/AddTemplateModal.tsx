"use client"

import { useState } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { Category, ItemType } from "./types"

interface AddTemplateModalProps {
  categories: Category[]
  onClose: () => void
  onSubmit: (payload: Record<string, unknown>) => Promise<boolean>
}

interface FormData {
  name: string
  title: string
  description: string
  content: string
  category_id: string
  file_type: string
  file_url: string
  version: string
  visibility: string
}

const initialFormData: FormData = {
  name: "",
  title: "",
  description: "",
  content: "",
  category_id: "",
  file_type: "pdf",
  file_url: "",
  version: "1.0",
  visibility: "all",
}

export function AddTemplateModal({
  categories,
  onClose,
  onSubmit,
}: AddTemplateModalProps) {
  const [addType, setAddType] = useState<ItemType>("template")
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
    setSubmitting(true)
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

      const success = await onSubmit(payload)
      if (success) {
        onClose()
      } else {
        alert("Failed to create")
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Add New {addType === "template" ? "Template" : "Quick Message"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setAddType("template")}
              className={`flex-1 py-2 rounded-lg font-medium ${
                addType === "template"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Document Template
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

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData((p) => ({ ...p, category_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {addType === "template" ? (
            <>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Visa Requirements Checklist"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="w-full text-sm"
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
                {formData.file_url && (
                  <p className="text-sm text-green-600 mt-1">File uploaded successfully</p>
                )}
              </div>

              {/* Version */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData((p) => ({ ...p, version: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </>
          ) : (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Welcome Message"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter the message text..."
                />
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  )
}
