/**
 * HeaderActions Component
 * Consolidated dropdown menu for secondary dashboard actions
 */

"use client"

import { useState, useRef, useEffect } from "react"

interface HeaderActionsProps {
  onAddLog: () => void
  onViewMessages: () => void
  onToggleTheme: () => void
  onLogout: () => void
  theme: "light" | "dark"
}

export default function HeaderActions({
  onAddLog,
  onViewMessages,
  onToggleTheme,
  onLogout,
  theme
}: HeaderActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const menuItems = [
    {
      label: "Add Contact Log",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: () => { onAddLog(); setIsOpen(false) }
    },
    {
      label: "Messages",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      onClick: () => { onViewMessages(); setIsOpen(false) }
    },
    { type: "divider" as const },
    {
      label: theme === "dark" ? "Light Mode" : "Dark Mode",
      icon: theme === "dark" ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      onClick: () => { onToggleTheme(); setIsOpen(false) },
      toggle: true,
      active: theme === "dark"
    },
    { type: "divider" as const },
    {
      label: "Logout",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      onClick: () => { onLogout(); setIsOpen(false) },
      danger: true
    }
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        aria-label="More actions"
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {menuItems.map((item, index) => {
            if (item.type === "divider") {
              return <div key={index} className="border-t border-gray-200 dark:border-gray-700 my-1" />
            }

            return (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                  item.danger ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.toggle && (
                  <span className={`w-2 h-2 rounded-full ${item.active ? "bg-blue-500" : "bg-gray-300"}`} />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
