"use client"

import { useState, useMemo } from "react"
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { Template, QuickMessage, PortalStudent, ItemType } from "./types"

interface StudentSelectModalProps {
  item: Template | QuickMessage
  itemType: ItemType
  students: PortalStudent[]
  loading: boolean
  onClose: () => void
  onSendComplete?: () => void
}

export function StudentSelectModal({
  item,
  itemType,
  students,
  loading,
  onClose,
  onSendComplete,
}: StudentSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<PortalStudent | null>(null)
  const [sending, setSending] = useState(false)
  const [customSubject, setCustomSubject] = useState(
    itemType === "template" ? (item as Template).name : (item as QuickMessage).title
  )
  const [customMessage, setCustomMessage] = useState(
    itemType === "template" ? (item as Template).description || "" : (item as QuickMessage).content
  )

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students
    const searchLower = searchTerm.toLowerCase()
    return students.filter(
      (s) =>
        s.email?.toLowerCase().includes(searchLower) ||
        s.full_name?.toLowerCase().includes(searchLower) ||
        s.country_of_origin?.toLowerCase().includes(searchLower)
    )
  }, [students, searchTerm])

  const handleSend = async () => {
    if (!selectedStudent) return
    setSending(true)

    try {
      const payload: Record<string, unknown> = {
        send_method: "email",
        recipient_email: selectedStudent.email,
        recipient_name: selectedStudent.full_name || selectedStudent.email,
        student_user_id: selectedStudent.id,
        custom_subject: customSubject,
        custom_message: customMessage,
      }

      if (itemType === "template") {
        payload.template_id = item.id
      } else {
        payload.quick_message_id = item.id
      }

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
          alert(data.message || "Action logged.")
        }
        onClose()
        onSendComplete?.()
      } else {
        alert(data.error || "Failed to send email")
      }
    } catch (error) {
      console.error("Error sending to student:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Send to Portal Student
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b dark:border-gray-700">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
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
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedStudent?.id === student.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white">
                    {student.full_name || student.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {student.email}
                    {student.country_of_origin && ` • ${student.country_of_origin}`}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedStudent && (
          <div className="p-4 border-t dark:border-gray-700 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedStudent || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Email"}
          </button>
        </div>
      </div>
    </div>
  )
}
