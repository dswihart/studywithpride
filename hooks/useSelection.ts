"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"

interface UseSelectionOptions<T> {
  /** Function to get unique ID from item */
  getId: (item: T) => string
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void
}

interface UseSelectionReturn {
  // State
  selectedIds: Set<string>
  selectedCount: number

  // Checks
  isSelected: (id: string) => boolean
  isAllSelected: boolean
  isSomeSelected: boolean
  isSelectAllPages: boolean

  // Actions
  select: (id: string) => void
  deselect: (id: string) => void
  toggle: (id: string) => void
  selectAll: (items: { id: string }[]) => void
  deselectAll: () => void
  selectAllPages: (allItems: { id: string }[]) => void
  toggleAll: (currentPageItems: { id: string }[]) => void

  // Utility
  getSelectedItems: <T extends { id: string }>(items: T[]) => T[]
}

/**
 * Hook for managing multi-select functionality
 * @param currentPageItems - Items currently visible on page
 * @param options - Selection options
 * @returns Selection state and controls
 */
export function useSelection<T extends { id: string }>(
  currentPageItems: T[],
  options: UseSelectionOptions<T> = { getId: (item) => item.id }
): UseSelectionReturn {
  const { getId, onSelectionChange } = options

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectAllPages, setIsSelectAllPages] = useState(false)

  // Use ref to prevent callback from causing re-renders
  const onSelectionChangeRef = useRef(onSelectionChange)
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange
  }, [onSelectionChange])

  // Notify when selection changes
  useEffect(() => {
    onSelectionChangeRef.current?.(Array.from(selectedIds))
  }, [selectedIds])

  const selectedCount = selectedIds.size

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const currentPageIds = useMemo(
    () => new Set(currentPageItems.map(getId)),
    [currentPageItems, getId]
  )

  const isAllSelected = useMemo(() => {
    if (currentPageItems.length === 0) return false
    return currentPageItems.every((item) => selectedIds.has(getId(item)))
  }, [currentPageItems, selectedIds, getId])

  const isSomeSelected = useMemo(() => {
    if (currentPageItems.length === 0) return false
    const selectedOnPage = currentPageItems.filter((item) =>
      selectedIds.has(getId(item))
    )
    return selectedOnPage.length > 0 && selectedOnPage.length < currentPageItems.length
  }, [currentPageItems, selectedIds, getId])

  const select = useCallback((id: string) => {
    setSelectedIds((prev) => new Set([...prev, id]))
    setIsSelectAllPages(false)
  }, [])

  const deselect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setIsSelectAllPages(false)
  }, [])

  const toggle = useCallback(
    (id: string) => {
      if (selectedIds.has(id)) {
        deselect(id)
      } else {
        select(id)
      }
    },
    [selectedIds, select, deselect]
  )

  const selectAll = useCallback(
    (items: { id: string }[]) => {
      setSelectedIds(new Set(items.map((item) => item.id)))
      setIsSelectAllPages(false)
    },
    []
  )

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
    setIsSelectAllPages(false)
  }, [])

  const selectAllPages = useCallback(
    (allItems: { id: string }[]) => {
      setSelectedIds(new Set(allItems.map((item) => item.id)))
      setIsSelectAllPages(true)
    },
    []
  )

  const toggleAll = useCallback(
    (currentItems: { id: string }[]) => {
      if (isAllSelected) {
        // Deselect all on current page
        setSelectedIds((prev) => {
          const next = new Set(prev)
          currentItems.forEach((item) => next.delete(item.id))
          return next
        })
      } else {
        // Select all on current page
        setSelectedIds((prev) => {
          const next = new Set(prev)
          currentItems.forEach((item) => next.add(item.id))
          return next
        })
      }
      setIsSelectAllPages(false)
    },
    [isAllSelected]
  )

  const getSelectedItems = useCallback(
    <U extends { id: string }>(items: U[]): U[] => {
      return items.filter((item) => selectedIds.has(item.id))
    },
    [selectedIds]
  )

  return {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    isSomeSelected,
    isSelectAllPages,
    select,
    deselect,
    toggle,
    selectAll,
    deselectAll,
    selectAllPages,
    toggleAll,
    getSelectedItems,
  }
}
