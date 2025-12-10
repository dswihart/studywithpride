/**
 * useUserManagement Hook
 *
 * Manages user data fetching, filtering, and sorting
 */

import { useState, useEffect, useCallback } from "react"
import { UserAccount, SortField, SortDirection, EditFormState } from "./types"

interface UseUserManagementReturn {
  // Data
  users: UserAccount[]
  filteredUsers: UserAccount[]
  loading: boolean
  error: string

  // Filters
  searchTerm: string
  setSearchTerm: (term: string) => void
  countryFilter: string
  setCountryFilter: (country: string) => void
  roleFilter: string
  setRoleFilter: (role: string) => void
  sourceFilter: string
  setSourceFilter: (source: string) => void
  dateFrom: string
  setDateFrom: (date: string) => void
  dateTo: string
  setDateTo: (date: string) => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  activeFilterCount: number
  clearFilters: () => void

  // Sorting
  sortBy: SortField
  sortDir: SortDirection
  handleSort: (field: SortField) => void

  // Edit modal
  editingUser: UserAccount | null
  editForm: EditFormState
  setEditForm: (form: EditFormState) => void
  saving: boolean
  saveError: string
  saveSuccess: string
  openEditModal: (user: UserAccount) => void
  closeEditModal: () => void
  handleSaveUser: () => Promise<void>

  // Delete modal
  deletingUser: UserAccount | null
  deleteConfirmText: string
  setDeleteConfirmText: (text: string) => void
  deleting: boolean
  deleteError: string
  openDeleteModal: (user: UserAccount) => void
  closeDeleteModal: () => void
  handleDeleteUser: () => Promise<void>

  // Actions
  fetchUsers: () => Promise<void>
}

export function useUserManagement(): UseUserManagementReturn {
  // Data state
  const [users, setUsers] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [countryFilter, setCountryFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [sourceFilter, setSourceFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Sort state
  const [sortBy, setSortBy] = useState<SortField>("created_at")
  const [sortDir, setSortDir] = useState<SortDirection>("desc")

  // Edit modal state
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>({
    full_name: "",
    email: "",
    phone_number: "",
    country_of_origin: "",
    role: "",
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")

  // Delete modal state
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/recruiter/student-accounts")
      const result = await response.json()
      if (result.success) {
        setUsers(result.data || [])
      } else {
        setError(result.error || "Failed to fetch users")
      }
    } catch {
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Filter and sort users
  const filteredUsers = users
    .filter((user) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesName = user.full_name?.toLowerCase().includes(search)
        const matchesEmail = user.email?.toLowerCase().includes(search)
        const matchesLeadName = user.lead_prospect_name?.toLowerCase().includes(search)
        if (!matchesName && !matchesEmail && !matchesLeadName) return false
      }
      if (countryFilter) {
        const userCountry = user.country_of_origin || user.lead_country || ""
        if (!userCountry.toLowerCase().includes(countryFilter.toLowerCase())) return false
      }
      if (roleFilter && user.role !== roleFilter) return false
      if (sourceFilter) {
        const isCrmConversion = user.crm_lead_id !== null
        if (sourceFilter === "crm_conversion" && !isCrmConversion) return false
        if (sourceFilter === "manual" && isCrmConversion) return false
      }
      if (dateFrom) {
        const createdDate = new Date(user.created_at)
        const fromDate = new Date(dateFrom)
        if (createdDate < fromDate) return false
      }
      if (dateTo) {
        const createdDate = new Date(user.created_at)
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (createdDate > toDate) return false
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === "created_at") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortBy === "full_name") {
        comparison = (a.full_name || "").localeCompare(b.full_name || "")
      } else if (sortBy === "country") {
        comparison = (a.country_of_origin || "").localeCompare(b.country_of_origin || "")
      } else if (sortBy === "role") {
        comparison = (a.role || "").localeCompare(b.role || "")
      }
      return sortDir === "desc" ? -comparison : comparison
    })

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDir("desc")
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCountryFilter("")
    setRoleFilter("")
    setSourceFilter("")
    setDateFrom("")
    setDateTo("")
  }

  const activeFilterCount = [searchTerm, countryFilter, roleFilter, sourceFilter, dateFrom, dateTo].filter(Boolean).length

  // Edit modal handlers
  const openEditModal = (user: UserAccount) => {
    setEditingUser(user)
    setEditForm({
      full_name: user.full_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      country_of_origin: user.country_of_origin || "",
      role: user.role || "student",
    })
    setSaveError("")
    setSaveSuccess("")
  }

  const closeEditModal = () => {
    setEditingUser(null)
    setSaveError("")
    setSaveSuccess("")
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    setSaving(true)
    setSaveError("")
    setSaveSuccess("")

    try {
      // Update role if changed
      if (editForm.role !== editingUser.role) {
        const roleResponse = await fetch("/api/recruiter/update-user-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: editingUser.id,
            new_role: editForm.role,
          }),
        })
        const roleResult = await roleResponse.json()
        if (!roleResult.success) {
          setSaveError(roleResult.error || "Failed to update role")
          setSaving(false)
          return
        }
      }

      // Update profile info
      const profileResponse = await fetch("/api/recruiter/update-user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: editingUser.id,
          full_name: editForm.full_name,
          phone_number: editForm.phone_number,
          country_of_origin: editForm.country_of_origin,
        }),
      })
      const profileResult = await profileResponse.json()

      if (profileResult.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  full_name: editForm.full_name,
                  phone_number: editForm.phone_number,
                  country_of_origin: editForm.country_of_origin,
                  role: editForm.role,
                }
              : u
          )
        )
        setSaveSuccess("User updated successfully!")
        setTimeout(() => closeEditModal(), 1500)
      } else {
        setSaveError(profileResult.error || "Failed to update profile")
      }
    } catch {
      setSaveError("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  // Delete modal handlers
  const openDeleteModal = (user: UserAccount) => {
    setDeletingUser(user)
    setDeleteConfirmText("")
    setDeleteError("")
  }

  const closeDeleteModal = () => {
    setDeletingUser(null)
    setDeleteConfirmText("")
    setDeleteError("")
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return
    if (deleteConfirmText !== "DELETE") {
      setDeleteError("Please type DELETE to confirm")
      return
    }

    setDeleting(true)
    setDeleteError("")

    try {
      const response = await fetch("/api/recruiter/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: deletingUser.id }),
      })
      const result = await response.json()

      if (result.success) {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id))
        closeDeleteModal()
      } else {
        setDeleteError(result.error || "Failed to delete user")
      }
    } catch {
      setDeleteError("Failed to delete user")
    } finally {
      setDeleting(false)
    }
  }

  return {
    users,
    filteredUsers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    countryFilter,
    setCountryFilter,
    roleFilter,
    setRoleFilter,
    sourceFilter,
    setSourceFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    showFilters,
    setShowFilters,
    activeFilterCount,
    clearFilters,
    sortBy,
    sortDir,
    handleSort,
    editingUser,
    editForm,
    setEditForm,
    saving,
    saveError,
    saveSuccess,
    openEditModal,
    closeEditModal,
    handleSaveUser,
    deletingUser,
    deleteConfirmText,
    setDeleteConfirmText,
    deleting,
    deleteError,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteUser,
    fetchUsers,
  }
}
