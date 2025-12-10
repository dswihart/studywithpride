"use client"

import { useState } from "react"
import {
  XMarkIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  LinkIcon,
} from "@heroicons/react/24/outline"
import { Template, QuickMessage, Lead, ItemType } from "./types"

interface SendModalProps {
  item: Template | QuickMessage
  itemType: ItemType
  selectedLead?: Lead | null
  onClose: () => void
  onSendComplete?: () => void
}

export function SendModal({
  item,
  itemType,
  selectedLead,
  onClose,
  onSendComplete,
}: SendModalProps) {
  const [sending, setSending] = useState(false)

  const handleSend = async (method: string) => {
    setSending(true)

    try {
      const payload: Record<string, unknown> = {
        send_method: method,
      }

      if (itemType === "template") {
        payload.template_id = item.id
      } else {
        payload.quick_message_id = item.id
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
          const url = itemType === "template" ? (item as Template).file_url : ""
          if (url) {
            await navigator.clipboard.writeText(url)
            alert("Link copied to clipboard!")
          }
        } else if (method === "email") {
          if (data.emailSent) {
            alert("Email sent successfully!")
          } else if (selectedLead?.prospect_email) {
            const subject = encodeURIComponent(
              itemType === "template" ? (item as Template).name : (item as QuickMessage).title
            )
            const body = encodeURIComponent(
              itemType === "template"
                ? `Please find the attached document: ${(item as Template).file_url}`
                : (item as QuickMessage).content
            )
            window.open(`mailto:${selectedLead.prospect_email}?subject=${subject}&body=${body}`)
          }
        } else if (method === "whatsapp" && selectedLead?.phone) {
          const text = encodeURIComponent(
            itemType === "template"
              ? `${(item as Template).name}: ${(item as Template).file_url}`
              : (item as QuickMessage).content
          )
          const phone = selectedLead.phone.replace(/\D/g, "")
          window.open(`https://wa.me/${phone}?text=${text}`)
        }
        onClose()
        onSendComplete?.()
      }
    } catch (error) {
      console.error("Error sending:", error)
    } finally {
      setSending(false)
    }
  }

  const itemName = itemType === "template" ? (item as Template).name : (item as QuickMessage).title

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Send: {itemName}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {selectedLead && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Sending to: <strong>{selectedLead.prospect_name || selectedLead.prospect_email}</strong>
            </p>
          )}

          <button
            onClick={() => handleSend("email")}
            disabled={sending}
            className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <EnvelopeIcon className="w-5 h-5 text-blue-600" />
            <span className="text-gray-900 dark:text-white">Send via Email</span>
          </button>

          {selectedLead?.phone && (
            <button
              onClick={() => handleSend("whatsapp")}
              disabled={sending}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <ChatBubbleLeftIcon className="w-5 h-5 text-green-600" />
              <span className="text-gray-900 dark:text-white">Send via WhatsApp</span>
            </button>
          )}

          {itemType === "template" && (item as Template).file_url && (
            <button
              onClick={() => handleSend("link_copied")}
              disabled={sending}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <LinkIcon className="w-5 h-5 text-purple-600" />
              <span className="text-gray-900 dark:text-white">Copy Link</span>
            </button>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
