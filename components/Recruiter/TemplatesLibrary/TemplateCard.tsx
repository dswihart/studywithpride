"use client"

import {
  EyeIcon,
  TrashIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline"
import { Template } from "./types"
import { formatFileSize, getFileIcon } from "./utils"

interface TemplateCardProps {
  template: Template
  isAdmin: boolean
  onPreview: (template: Template) => void
  onSend: (template: Template) => void
  onSendToLead: (template: Template) => void
  onSendToStudent: (template: Template) => void
  onDelete: (id: string) => void
}

export function TemplateCard({
  template,
  isAdmin,
  onPreview,
  onSend,
  onSendToLead,
  onSendToStudent,
  onDelete,
}: TemplateCardProps) {
  const canPreview = template.file_type === "pdf" || template.file_type === "image"

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
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
            onClick={() => onDelete(template.id)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
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
          {canPreview && (
            <button
              onClick={() => onPreview(template)}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
              title="Preview"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          )}
          {isAdmin && (
            <>
              <button
                onClick={() => onSendToLead(template)}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                title="Email to Lead"
              >
                <EnvelopeIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSendToStudent(template)}
                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                title="Send to Portal Student"
              >
                <UserGroupIcon className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onSend(template)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            <PaperAirplaneIcon className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
