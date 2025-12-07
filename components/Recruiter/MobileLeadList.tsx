"use client"

import { useState } from "react"
import MobileLeadCard from "./MobileLeadCard"

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
  phone_valid: boolean | null
  country: string
  contact_status: string
  recruit_priority: number | null
  last_contact_date: string | null
}

interface MobileLeadListProps {
  leads: Lead[]
  selectedIds: Set<string>
  onSelect: (id: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onView: (lead: Lead) => void
  onLogContact: (lead: Lead) => void
  onWhatsApp: (lead: Lead) => void
  onEdit: (lead: Lead) => void
  totalCount: number
}

export default function MobileLeadList({
  leads,
  selectedIds,
  onSelect,
  onSelectAll,
  onView,
  onLogContact,
  onWhatsApp,
  onEdit,
  totalCount,
}: MobileLeadListProps) {
  const allSelected = leads.length > 0 && leads.every((lead) => selectedIds.has(lead.id))
  const someSelected = leads.some((lead) => selectedIds.has(lead.id))

  return (
    <div className="space-y-3">
      {/* Bulk selection header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected
            }}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Select All ({totalCount} leads)
          </span>
        </label>
        {selectedIds.size > 0 && (
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            {selectedIds.size} selected
          </span>
        )}
      </div>

      {/* Lead cards */}
      {leads.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">📭</div>
          <p className="text-gray-500 dark:text-gray-400">No leads found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        leads.map((lead) => (
          <MobileLeadCard
            key={lead.id}
            lead={lead}
            isSelected={selectedIds.has(lead.id)}
            onSelect={onSelect}
            onView={onView}
            onLogContact={onLogContact}
            onWhatsApp={onWhatsApp}
            onEdit={onEdit}
          />
        ))
      )}
    </div>
  )
}
