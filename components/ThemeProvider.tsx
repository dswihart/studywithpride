"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"

export type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_COOKIE = 'theme'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function ThemeProvider({ children, initialTheme = "light" }: { children: ReactNode, initialTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [mounted, setMounted] = useState(false)

  const persistTheme = useCallback((nextTheme: Theme) => {
    try {
      window.localStorage.setItem("theme", nextTheme)
      document.cookie = `${THEME_COOKIE}=${nextTheme}; path=/; max-age=${COOKIE_MAX_AGE}`
    } catch {
      // ignore persistence issues (e.g., disabled cookies)
    }
  }, [])

  const applyTheme = useCallback((nextTheme: Theme) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.classList.toggle('dark', nextTheme === 'dark')
    root.dataset.theme = nextTheme
  }, [])

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Get stored theme or use system preference
    const storedTheme = window.localStorage.getItem("theme") as Theme | null
    if (storedTheme) {
      setTheme(storedTheme)
      applyTheme(storedTheme)
      persistTheme(storedTheme)
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const detectedTheme: Theme = prefersDark ? "dark" : "light"
      setTheme(detectedTheme)
      applyTheme(detectedTheme)
      persistTheme(detectedTheme)
    }

    setMounted(true)
  }, [applyTheme, persistTheme])

  // Apply theme whenever it changes (only after mount)
  useEffect(() => {
    if (!mounted) return

    applyTheme(theme)
    persistTheme(theme)
  }, [theme, mounted, applyTheme, persistTheme])

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
  }

  // Always render the provider to avoid hydration mismatches
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
