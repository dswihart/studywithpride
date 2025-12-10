"use client"

import { useState, useMemo, useCallback } from "react"

interface UsePaginationOptions {
  /** Initial page number (default: 1) */
  initialPage?: number
  /** Initial items per page (default: 50) */
  initialItemsPerPage?: number
  /** Available page size options (default: [25, 50, 100, 200]) */
  pageSizeOptions?: number[]
}

interface UsePaginationReturn<T> {
  // Current page data
  paginatedItems: T[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  totalItems: number

  // Page info
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPreviousPage: boolean

  // Actions
  setCurrentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  nextPage: () => void
  previousPage: () => void
  firstPage: () => void
  lastPage: () => void
  goToPage: (page: number) => void

  // Page size options
  pageSizeOptions: number[]

  // Page numbers for rendering
  getPageNumbers: () => (number | "...")[]
}

/**
 * Hook for client-side pagination
 * @param items - Full array of items to paginate
 * @param options - Pagination options
 * @returns Pagination state and controls
 */
export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const {
    initialPage = 1,
    initialItemsPerPage = 50,
    pageSizeOptions = [25, 50, 100, 200],
  } = options

  const [currentPage, setCurrentPageState] = useState(initialPage)
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage)

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  // Ensure current page is valid when items change
  const validCurrentPage = Math.min(currentPage, totalPages)
  if (validCurrentPage !== currentPage) {
    setCurrentPageState(validCurrentPage)
  }

  const startIndex = (validCurrentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex)
  }, [items, startIndex, endIndex])

  const hasNextPage = validCurrentPage < totalPages
  const hasPreviousPage = validCurrentPage > 1

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const setItemsPerPage = useCallback((count: number) => {
    setItemsPerPageState(count)
    setCurrentPageState(1) // Reset to first page when changing page size
  }, [])

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPageState((p) => p + 1)
    }
  }, [hasNextPage])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPageState((p) => p - 1)
    }
  }, [hasPreviousPage])

  const firstPage = useCallback(() => {
    setCurrentPageState(1)
  }, [])

  const lastPage = useCallback(() => {
    setCurrentPageState(totalPages)
  }, [totalPages])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [setCurrentPage])

  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = useCallback((): (number | "...")[] => {
    const pages: (number | "...")[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Show ellipsis if current page is far from start
      if (validCurrentPage > 3) {
        pages.push("...")
      }

      // Show pages around current page
      const start = Math.max(2, validCurrentPage - 1)
      const end = Math.min(totalPages - 1, validCurrentPage + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Show ellipsis if current page is far from end
      if (validCurrentPage < totalPages - 2) {
        pages.push("...")
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }, [totalPages, validCurrentPage])

  return {
    paginatedItems,
    currentPage: validCurrentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    startIndex: startIndex + 1, // 1-indexed for display
    endIndex,
    hasNextPage,
    hasPreviousPage,
    setCurrentPage,
    setItemsPerPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    goToPage,
    pageSizeOptions,
    getPageNumbers,
  }
}
