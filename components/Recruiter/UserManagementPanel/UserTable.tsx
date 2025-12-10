"use client"

import {
  ArrowTopRightOnSquareIcon,
  UserCircleIcon,
  CalendarIcon,
  GlobeAltIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { UserAccount, SortField, SortDirection } from "./types"

interface UserTableProps {
  users: UserAccount[]
  sortBy: SortField
  sortDir: SortDirection
  onSort: (field: SortField) => void
  onEdit: (user: UserAccount) => void
  onDelete: (user: UserAccount) => void
  onOpenLead?: (leadId: string) => void
}

export function UserTable({
  users,
  sortBy,
  sortDir,
  onSort,
  onEdit,
  onDelete,
  onOpenLead,
}: UserTableProps) {
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

  if (users.length === 0) {
    return (
      <div className="p-12 text-center">
        <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No users match the current filters</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => onSort("full_name")}
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
              onClick={() => onSort("role")}
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
              onClick={() => onSort("country")}
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
              onClick={() => onSort("created_at")}
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
          {users.map((user) => (
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
                    onClick={() => onEdit(user)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(user)}
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
  )
}
