/**
 * useTemplates Hook
 *
 * Manages templates data fetching and state
 */

import { useState, useEffect, useCallback } from "react"
import { Category, Template, QuickMessage, Lead, PortalStudent } from "./types"

interface UseTemplatesReturn {
  // Data
  categories: Category[]
  templates: Template[]
  quickMessages: QuickMessage[]
  portalStudents: PortalStudent[]
  allLeads: Lead[]

  // Loading states
  loading: boolean
  loadingStudents: boolean
  loadingLeads: boolean

  // Actions
  fetchData: () => Promise<void>
  fetchPortalStudents: () => Promise<void>
  fetchAllLeads: () => Promise<void>
  deleteItem: (id: string, type: "template" | "message") => Promise<boolean>
  createItem: (payload: Record<string, unknown>) => Promise<boolean>
}

export function useTemplates(): UseTemplatesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([])
  const [portalStudents, setPortalStudents] = useState<PortalStudent[]>([])
  const [allLeads, setAllLeads] = useState<Lead[]>([])

  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingLeads, setLoadingLeads] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/recruiter/templates")
      const data = await res.json()
      if (data.success) {
        setCategories(data.data.categories)
        setTemplates(data.data.templates)
        setQuickMessages(data.data.quickMessages)
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPortalStudents = useCallback(async () => {
    if (portalStudents.length > 0) return // Already fetched

    setLoadingStudents(true)
    try {
      const res = await fetch("/api/recruiter/student-accounts?role=student")
      const data = await res.json()
      if (data.success) {
        setPortalStudents(data.data)
      }
    } catch (error) {
      console.error("Error fetching portal students:", error)
    } finally {
      setLoadingStudents(false)
    }
  }, [portalStudents.length])

  const fetchAllLeads = useCallback(async () => {
    if (allLeads.length > 0) return // Already fetched

    setLoadingLeads(true)
    try {
      const res = await fetch("/api/recruiter/leads-read")
      const data = await res.json()
      if (data.success) {
        setAllLeads(data.data.filter((l: Lead) => l.prospect_email))
      }
    } catch (error) {
      console.error("Error fetching leads:", error)
    } finally {
      setLoadingLeads(false)
    }
  }, [allLeads.length])

  const deleteItem = useCallback(async (id: string, type: "template" | "message"): Promise<boolean> => {
    try {
      const res = await fetch(
        `/api/recruiter/templates/manage?id=${id}&type=${type === "message" ? "quick_message" : "template"}`,
        { method: "DELETE" }
      )
      const data = await res.json()
      if (data.success) {
        await fetchData()
        return true
      }
      return false
    } catch (error) {
      console.error("Delete error:", error)
      return false
    }
  }, [fetchData])

  const createItem = useCallback(async (payload: Record<string, unknown>): Promise<boolean> => {
    try {
      const res = await fetch("/api/recruiter/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        await fetchData()
        return true
      }
      return false
    } catch (error) {
      console.error("Create error:", error)
      return false
    }
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    categories,
    templates,
    quickMessages,
    portalStudents,
    allLeads,
    loading,
    loadingStudents,
    loadingLeads,
    fetchData,
    fetchPortalStudents,
    fetchAllLeads,
    deleteItem,
    createItem,
  }
}
