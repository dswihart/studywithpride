"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/LanguageContext"

interface PipelineStage {
  id: string
  name: string
  order: number
  color: string
  description: string
  count: number
}

interface Lead {
  id: string
  prospect_name: string | null
  prospect_email: string | null
  phone: string | null
  contact_status: string
  lead_quality: string | null
  last_contact_date: string | null
}

interface PipelineKanbanProps {
  onLeadClick?: (lead: Lead) => void
  onMoveLeads?: (leadIds: string[], targetStage: string) => void
}

export default function PipelineKanban({ onLeadClick, onMoveLeads }: PipelineKanbanProps) {
  const { t } = useLanguage()
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [stageLeads, setStageLeads] = useState<Record<string, Lead[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [draggingLead, setDraggingLead] = useState<Lead | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [expandedStage, setExpandedStage] = useState<string | null>(null)

  useEffect(() => {
    fetchPipelineData()
  }, [])

  async function fetchPipelineData() {
    setLoading(true)
    try {
      const res = await fetch("/api/recruiter/pipeline-stages?metrics=true")
      const json = await res.json()
      if (json.success) {
        // Filter out unqualified from main view, sort by order
        const filteredStages = json.data.stages
          .filter((s: PipelineStage) => s.id !== "unqualified")
          .sort((a: PipelineStage, b: PipelineStage) => a.order - b.order)
        setStages(filteredStages)
      } else {
        setError(json.error || "Failed to load pipeline")
      }
    } catch (err) {
      setError("Failed to fetch pipeline data")
    } finally {
      setLoading(false)
    }
  }

  async function fetchStageLeads(stageId: string) {
    try {
      const res = await fetch("/api/recruiter/pipeline-stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_stage_leads", stageId, limit: 20 }),
      })
      const json = await res.json()
      if (json.success) {
        setStageLeads((prev) => ({
          ...prev,
          [stageId]: json.data.leads,
        }))
      }
    } catch (err) {
      console.error("Failed to fetch stage leads:", err)
    }
  }

  const toggleStage = (stageId: string) => {
    if (expandedStage === stageId) {
      setExpandedStage(null)
    } else {
      setExpandedStage(stageId)
      if (!stageLeads[stageId]) {
        fetchStageLeads(stageId)
      }
    }
  }

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggingLead(lead)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    setDragOverStage(stageId)
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault()
    setDragOverStage(null)

    if (!draggingLead || draggingLead.contact_status === targetStageId) {
      setDraggingLead(null)
      return
    }

    const oldStage = draggingLead.contact_status

    // Optimistic update
    setStageLeads((prev) => {
      const newState = { ...prev }
      // Remove from old stage
      if (newState[oldStage]) {
        newState[oldStage] = newState[oldStage].filter((l) => l.id !== draggingLead.id)
      }
      // Add to new stage
      if (newState[targetStageId]) {
        newState[targetStageId] = [{ ...draggingLead, contact_status: targetStageId }, ...newState[targetStageId]]
      }
      return newState
    })

    // Update stage counts optimistically
    setStages((prev) =>
      prev.map((s) => {
        if (s.id === oldStage) return { ...s, count: Math.max(0, s.count - 1) }
        if (s.id === targetStageId) return { ...s, count: s.count + 1 }
        return s
      })
    )

    // API call
    try {
      const res = await fetch("/api/recruiter/pipeline-stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move_leads",
          leadIds: [draggingLead.id],
          targetStage: targetStageId,
        }),
      })
      const json = await res.json()
      if (!json.success) {
        // Revert on failure
        fetchPipelineData()
      }
      onMoveLeads?.([draggingLead.id], targetStageId)
    } catch (err) {
      // Revert on error
      fetchPipelineData()
    }

    setDraggingLead(null)
  }

  const getQualityBadge = (quality: string | null) => {
    switch (quality) {
      case "hot":
        return <span className="px-1.5 py-0.5 text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded">Hot</span>
      case "warm":
        return <span className="px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded">Warm</span>
      case "cold":
        return <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">Cold</span>
      default:
        return null
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return "Never"
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-64 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Kanban Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pipeline Overview</h2>
        <button
          onClick={fetchPipelineData}
          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400"
        >
          Refresh
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`flex-shrink-0 w-64 rounded-lg transition-all ${
              dragOverStage === stage.id
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "bg-gray-50 dark:bg-gray-800/50"
            }`}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Stage Header */}
            <div
              className="p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => toggleStage(stage.id)}
              style={{ borderLeftColor: stage.color, borderLeftWidth: "4px" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">{stage.name}</h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  {stage.count}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stage.description}</p>
            </div>

            {/* Stage Leads */}
            <div className="p-2 max-h-80 overflow-y-auto">
              {expandedStage === stage.id ? (
                stageLeads[stage.id] ? (
                  stageLeads[stage.id].length > 0 ? (
                    <div className="space-y-2">
                      {stageLeads[stage.id].map((lead) => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead)}
                          onClick={() => onLeadClick?.(lead)}
                          className={`p-2 bg-white dark:bg-gray-700 rounded shadow-sm cursor-pointer hover:shadow transition-shadow ${
                            draggingLead?.id === lead.id ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {lead.prospect_name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {lead.prospect_email || lead.phone || "No contact"}
                              </p>
                            </div>
                            {getQualityBadge(lead.lead_quality)}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Last: {formatDate(lead.last_contact_date)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No leads in this stage
                    </p>
                  )
                ) : (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                )
              ) : (
                <button
                  onClick={() => toggleStage(stage.id)}
                  className="w-full py-2 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400"
                >
                  View {stage.count} leads
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span>Drag leads between stages to update status</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> Hot
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Warm
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Cold
        </span>
      </div>
    </div>
  )
}
