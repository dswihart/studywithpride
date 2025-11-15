"use client"

import { useEffect, useState } from 'react'

export function useIsDarkMode() {
  const getCurrent = () =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  const [isDark, setIsDark] = useState<boolean>(getCurrent)

  useEffect(() => {
    const update = () => setIsDark(getCurrent())
    update()

    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    window.addEventListener('storage', update)

    return () => {
      observer.disconnect()
      window.removeEventListener('storage', update)
    }
  }, [])

  return isDark
}
