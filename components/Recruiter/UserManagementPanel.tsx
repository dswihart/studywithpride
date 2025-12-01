/**
 * User Management Panel
 * Lists all users with role and profile editing capabilities
 */

"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/LanguageContext"
import {
  UsersIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  UserCircleIcon,
  CalendarIcon,
  GlobeAltIcon,
  PencilSquareIcon,
  XMarkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"

interface UserAccount {
  id: string
  email: string
  full_name: string | null
  country_of_origin: string | null
  phone_number: string | null
  crm_lead_id: string | null
  created_at: string
  role: string
  has_profile: boolean
  lead_prospect_name?: string
  lead_country?: string
  lead_converted_at?: string
  lead_conversion_source?: string
  intake_term?: string
}

interface UserManagementPanelProps {
  onOpenLead?: (leadId: string) => void
}

const COUNTRIES = [
  "Dominican Republic",
  "Colombia",
  "Venezuela",
  "Mexico",
  "Brazil",
  "Argentina",
  "Chile",
  "Peru",
  "Ecuador",
  "Spain",
  "United States",
  "Other",
]

const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "student", label: "Student" },
  { value: "recruiter", label: "Recruiter" },
  { value: "admin", label: "Admin" },
]

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "crm_conversion", label: "CRM Conversion" },
  { value: "manual", label: "Manual Registration" },
]

export default function UserManagementPanel({ onOpenLead }: UserManagementPanelProps) {
  const { t } = useLanguage()
  const [users, setUsers] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [countryFilter, setCountryFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [sourceFilter, setSourceFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Edit modal
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null)
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    country_of_origin: "",
    role: "",
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")

  // Delete modal
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  // Sorting
  const [sortBy, setSortBy] = useState<"created_at" | "full_name" | "country" | "role">("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
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
    } catch (err) {
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

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
        // Remove from local state
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id))
        closeDeleteModal()
      } else {
        setDeleteError(result.error || "Failed to delete user")
      }
    } catch (err) {
      setDeleteError("Failed to delete user")
    } finally {
      setDeleting(false)
    }
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
        // Update local state
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
        setTimeout(() => {
          closeEditModal()
        }, 1500)
      } else {
        setSaveError(profileResult.error || "Failed to update profile")
      }
    } catch (err) {
      setSaveError("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

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

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDir("desc")
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            Admin
          </span>
        )
      case "recruiter":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            Recruiter
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Student
          </span>
        )
    }
  }

  const getSourceBadge = (user: UserAccount) => {
    if (user.crm_lead_id) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          CRM
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        Manual
      </span>
    )
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCountryFilter("")
    setRoleFilter("")
    setSourceFilter("")
    setDateFrom("")
    setDateTo("")
  }

  const activeFilterCount = [
    searchTerm,
    countryFilter,
    roleFilter,
    sourceFilter,
    dateFrom,
    dateTo,
  ].filter(Boolean).length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">User Management</h2>
              <p className="text-indigo-100 text-sm">
                {filteredUsers.length} of {users.length} users
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showFilters || activeFilterCount > 0
                ? "bg-white text-indigo-600"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-200" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Country
              </label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Countries</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Source
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center">
          <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {users.length === 0
              ? "No users found"
              : "No users match the current filters"}
          </p>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort("full_name")}
                >
                  <div className="flex items-center gap-1">
                    User
                    {sortBy === "full_name" && (
                      <span className="text-indigo-600">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center gap-1">
                    Role
                    {sortBy === "role" && (
                      <span className="text-indigo-600">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort("country")}
                >
                  <div className="flex items-center gap-1">
                    Country
                    {sortBy === "country" && (
                      <span className="text-indigo-600">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center gap-1">
                    Created
                    {sortBy === "created_at" && (
                      <span className="text-indigo-600">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium ${
                          user.role === "admin"
                            ? "bg-gradient-to-br from-red-500 to-pink-500"
                            : user.role === "recruiter"
                            ? "bg-gradient-to-br from-purple-500 to-indigo-500"
                            : "bg-gradient-to-br from-blue-500 to-cyan-500"
                        }`}
                      >
                        {(user.full_name || user.email || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.full_name || "No name"}
                        </div>
                        {user.phone_number && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user.phone_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
                  </td>
                  <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {user.country_of_origin || user.lead_country || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">{getSourceBadge(user)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                      {user.crm_lead_id && onOpenLead && (
                        <button
                          onClick={() => onOpenLead(user.crm_lead_id!)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          Lead
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Footer */}
      {!loading && filteredUsers.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Total:</span>{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {filteredUsers.length}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Students:</span>{" "}
                <span className="font-medium text-blue-600">
                  {filteredUsers.filter((u) => u.role === "student").length}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Recruiters:</span>{" "}
                <span className="font-medium text-purple-600">
                  {filteredUsers.filter((u) => u.role === "recruiter").length}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Admins:</span>{" "}
                <span className="font-medium text-red-600">
                  {filteredUsers.filter((u) => u.role === "admin").length}
                </span>
              </div>
            </div>
            <button
              onClick={fetchUsers}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Edit User</h3>
                  <p className="text-indigo-100 text-sm">{editingUser.email}</p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {saveError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
                  {saveSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+1 (809) 555-0123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country
                </label>
                <select
                  value={editForm.country_of_origin}
                  onChange={(e) => setEditForm({ ...editForm, country_of_origin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select country...</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="student">Student</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {editForm.role === "admin" && "Full access to all features"}
                  {editForm.role === "recruiter" && "Access to recruitment dashboard"}
                  {editForm.role === "student" && "Access to student portal only"}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-6 w-6" />
                  <div>
                    <h3 className="text-lg font-bold">Delete User</h3>
                    <p className="text-red-100 text-sm">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={closeDeleteModal}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {deleteError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {deleteError}
                </div>
              )}

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <TrashIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Are you sure you want to delete this user?
                </p>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {deletingUser.full_name || "No name"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {deletingUser.email}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Role: {deletingUser.role}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                This will permanently delete the user account and all associated data.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleting || deleteConfirmText !== "DELETE"}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
