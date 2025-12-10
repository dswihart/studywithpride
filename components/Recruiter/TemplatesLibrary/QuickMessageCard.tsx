"use client"

import {
  TrashIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline"
import { QuickMessage } from "./types"
import { copyToClipboard } from "./utils"

interface QuickMessageCardProps {
  message: QuickMessage
  isAdmin: boolean
  onSend: (message: QuickMessage) => void
  onSendToLead: (message: QuickMessage) => void
  onSendToStudent: (message: QuickMessage) => void
  onDelete: (id: string) => void
}

export function QuickMessageCard({
  message,
  isAdmin,
  onSend,
  onSendToLead,
  onSendToStudent,
  onDelete,
}: QuickMessageCardProps) {
  const handleCopy = async () => {
    await copyToClipboard(message.content)
    alert("Copied to clipboard!")
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{message.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {message.template_categories?.name}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => onDelete(message.id)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
        {message.content}
      </p>

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={handleCopy}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
          title="Copy"
        >
          <ClipboardDocumentIcon className="w-4 h-4" />
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => onSendToLead(message)}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
              title="Email to Lead"
            >
              <EnvelopeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSendToStudent(message)}
              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded"
              title="Send to Portal Student"
            >
              <UserGroupIcon className="w-4 h-4" />
            </button>
          </>
        )}
        <button
          onClick={() => onSend(message)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          <PaperAirplaneIcon className="w-3.5 h-3.5" />
          Send
        </button>
      </div>
    </div>
  )
}
