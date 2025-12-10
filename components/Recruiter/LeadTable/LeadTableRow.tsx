"use client"

import { useLanguage } from "@/components/LanguageContext"
import StatusBadge, { QualityBadge } from "../StatusBadge"
import FunnelStageBadge from "../Funnel/FunnelStageBadge"
import { FunnelStageNumber } from "@/lib/funnel/types"
import ActionButtons from "../ActionButtons"
import { Lead } from "./types"

interface LeadTableRowProps {
  lead: Lead
  isSelected: boolean
  isExpanded: boolean
  isHighlighted: boolean
  isTablet: boolean
  visibleColumnKeys: string[]
  onSelect: (checked: boolean) => void
  onRowClick: (e: React.MouseEvent) => void
  onView: () => void
  onEdit: () => void
  onWhatsApp: () => void
  onMessageHistory: () => void
  onLogContact: () => void
}

export function LeadTableRow({
  lead,
  isSelected,
  isExpanded,
  isHighlighted,
  isTablet,
  visibleColumnKeys,
  onSelect,
  onRowClick,
  onView,
  onEdit,
  onWhatsApp,
  onMessageHistory,
  onLogContact,
}: LeadTableRowProps) {
  const { t } = useLanguage()

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("recruiter.table.na")
    try {
      const date = new Date(dateString)
      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return t("recruiter.table.na")
    }
  }

  const renderCellContent = (columnKey: string) => {
    switch (columnKey) {
      case "prospect_name":
        return (
          <span
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium truncate block max-w-[200px]"
            onClick={(e) => {
              e.stopPropagation()
              onView()
            }}
          >
            {lead.prospect_name || t("recruiter.table.na")}
          </span>
        )
      case "prospect_email":
        return <span className="truncate block max-w-[220px]">{lead.prospect_email || t("recruiter.table.na")}</span>
      case "phone":
        return lead.phone || t("recruiter.table.na")
      case "country":
        return lead.country
      case "referral_source":
        return lead.referral_source || t("recruiter.table.na")
      case "contact_status":
        return <StatusBadge status={lead.contact_status} compact={isTablet} />
      case "funnel_stage":
        return (
          <FunnelStageBadge
            leadId={lead.id}
            contactStatus={lead.contact_status}
            currentStage={(lead.funnel_stage || 1) as FunnelStageNumber}
            completedStages={lead.funnel_data?.completedStages || []}
            size="sm"
            showLabel={false}
          />
        )
      case "lead_quality":
        return <QualityBadge quality={lead.lead_quality} score={lead.lead_score} compact={isTablet} />
      case "last_contact_date":
        return formatDate(lead.last_contact_date)
      case "date_added":
        return formatDate(lead.date_imported || lead.created_at)
      case "notes":
        return (
          <div className="max-w-[200px] truncate" title={lead.notes || ""}>
            {lead.notes || t("recruiter.table.noNotes")}
          </div>
        )
      case "barcelona_timeline":
        return lead.barcelona_timeline ? lead.barcelona_timeline + " months" : t("recruiter.table.na")
      case "intake":
        return lead.intake || t("recruiter.table.na")
      case "created_time":
        return formatDate(lead.created_time)
      case "is_duplicate":
        return (
          <span
            className={
              "px-2 py-0.5 rounded-full text-xs font-semibold " +
              (lead.is_duplicate
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300")
            }
          >
            {lead.is_duplicate ? "Dup" : "Orig"}
          </span>
        )
      case "recruit_priority":
        if (!lead.recruit_priority) return <span className="text-gray-400">-</span>
        return (
          <span className="text-yellow-400" title={`Priority: ${lead.recruit_priority}/5`}>
            {"*".repeat(lead.recruit_priority)}
          </span>
        )
      default:
        return null
    }
  }

  const rowClasses = `
    border-b border-gray-100 dark:border-gray-700
    hover:bg-gray-50 dark:hover:bg-gray-700/50
    cursor-pointer transition-colors
    ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}
    ${isHighlighted ? "bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-400" : ""}
  `

  return (
    <tr className={rowClasses} onClick={onRowClick}>
      {/* Selection checkbox */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>

      {/* Data columns */}
      {visibleColumnKeys.map((key) => (
        <td key={key} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
          {renderCellContent(key)}
        </td>
      ))}

      {/* Actions */}
      <td className="px-4 py-3">
        <ActionButtons
          lead={lead}
          onEdit={onEdit}
          onWhatsApp={onWhatsApp}
          onMessageHistory={onMessageHistory}
          onLogContact={onLogContact}
          compact={isTablet}
        />
      </td>
    </tr>
  )
}
