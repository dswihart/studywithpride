"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Breakpoint,
  BREAKPOINTS,
  ColumnConfig,
  getVisibleColumns,
  getHiddenColumns
} from "./columnConfig"

interface UseResponsiveColumnsReturn {
  breakpoint: Breakpoint
  visibleColumns: ColumnConfig[]
  hiddenColumns: ColumnConfig[]
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  mounted: boolean
}

/**
 * Custom hook for responsive column management
 * Detects current breakpoint and returns visible/hidden columns
 */
export function useResponsiveColumns(
  userVisibility?: Record<string, boolean>
): UseResponsiveColumnsReturn {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.tablet) {
        setBreakpoint("mobile")
      } else if (width < BREAKPOINTS.desktop) {
        setBreakpoint("tablet")
      } else {
        setBreakpoint("desktop")
      }
    }

    // Initial check
    updateBreakpoint()

    // Listen for resize
    window.addEventListener("resize", updateBreakpoint)
    return () => window.removeEventListener("resize", updateBreakpoint)
  }, [])

  const visibleColumns = useMemo(
    () => getVisibleColumns(breakpoint, userVisibility),
    [breakpoint, userVisibility]
  )

  const hiddenColumns = useMemo(
    () => getHiddenColumns(breakpoint, userVisibility),
    [breakpoint, userVisibility]
  )

  return {
    breakpoint,
    visibleColumns,
    hiddenColumns,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop",
    mounted
  }
}
