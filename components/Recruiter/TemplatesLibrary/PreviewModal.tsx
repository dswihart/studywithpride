"use client"

import { XMarkIcon } from "@heroicons/react/24/outline"
import { Template } from "./types"

interface PreviewModalProps {
  template: Template
  onClose: () => void
}

export function PreviewModal({ template, onClose }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="h-[70vh]">
          {template.file_type === "pdf" ? (
            <iframe src={template.file_url} className="w-full h-full" />
          ) : template.file_type === "image" ? (
            <img
              src={template.file_url}
              alt={template.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Preview not available for this file type
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
