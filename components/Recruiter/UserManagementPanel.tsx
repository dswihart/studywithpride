/**
 * UserManagementPanel Component - Re-export for backwards compatibility
 * 
 * The component has been split into multiple files:
 * - UserManagementPanel/types.ts - Type definitions and constants
 * - UserManagementPanel/useUserManagement.ts - Data management hook
 * - UserManagementPanel/UserFilters.tsx - Filter panel
 * - UserManagementPanel/UserTable.tsx - User table component
 * - UserManagementPanel/EditUserModal.tsx - Edit user modal
 * - UserManagementPanel/DeleteUserModal.tsx - Delete confirmation modal
 * - UserManagementPanel/index.tsx - Main orchestrator component
 */
export { default, UserManagementPanel } from "./UserManagementPanel/index"
export type { UserManagementPanelProps, UserAccount } from "./UserManagementPanel/types"
