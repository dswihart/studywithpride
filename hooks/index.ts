/**
 * Shared Hooks
 *
 * Re-export all custom hooks for convenient importing:
 * import { useDebounce, useFetch, usePagination } from "@/hooks"
 */

// Existing hooks
export { useDebounce } from "./useDebounce"
export { useIsDarkMode } from "./useIsDarkMode"
export { useResponsiveColumns } from "./useResponsiveColumns"

// New shared hooks
export { useLocalStorage } from "./useLocalStorage"
export { useFetch, useMutation } from "./useFetch"
export { usePagination } from "./usePagination"
export { useSelection } from "./useSelection"
