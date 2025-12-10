"use client"

import {
  UsersIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"

import { UserManagementPanelProps } from "./types"
import { useUserManagement } from "./useUserManagement"
import { UserFilters } from "./UserFilters"
import { UserTable } from "./UserTable"
import { EditUserModal } from "./EditUserModal"
import { DeleteUserModal } from "./DeleteUserModal"

export default function UserManagementPanel({ onOpenLead }: UserManagementPanelProps) {
  const {
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
  } = useUserManagement()

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
        <UserFilters
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          countryFilter={countryFilter}
          onCountryFilterChange={setCountryFilter}
          sourceFilter={sourceFilter}
          onSourceFilterChange={setSourceFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          onClearFilters={clearFilters}
        />
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
      ) : users.length === 0 ? (
        <div className="p-12 text-center">
          <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No users found</p>
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onOpenLead={onOpenLead}
        />
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
        <EditUserModal
          user={editingUser}
          editForm={editForm}
          onFormChange={setEditForm}
          saving={saving}
          saveError={saveError}
          saveSuccess={saveSuccess}
          onSave={handleSaveUser}
          onClose={closeEditModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          confirmText={deleteConfirmText}
          onConfirmTextChange={setDeleteConfirmText}
          deleting={deleting}
          deleteError={deleteError}
          onDelete={handleDeleteUser}
          onClose={closeDeleteModal}
        />
      )}
    </div>
  )
}

// Re-export for backwards compatibility
export { UserManagementPanel }
export type { UserManagementPanelProps, UserAccount } from "./types"
