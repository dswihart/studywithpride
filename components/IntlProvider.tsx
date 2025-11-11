'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'
import ptMessages from '@/messages/pt.json'

type Locale = 'en' | 'es' | 'pt'
type Messages = typeof enMessages

interface IntlContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const IntlContext = createContext<IntlContextType | undefined>(undefined)

const messages: Record<Locale, Messages> = {
  en: enMessages,
  es: esMessages,
  pt: ptMessages
}

export function IntlProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('preferred-language') as Locale | null
    if (stored && (stored === 'en' || stored === 'es' || stored === 'pt')) {
      setLocaleState(stored)
    }
    setMounted(true)

    // Listen for storage changes from LanguageContext
    const handleStorageChange = () => {
      const newLang = localStorage.getItem('preferred-language') as Locale | null
      if (newLang && (newLang === 'en' || newLang === 'es' || newLang === 'pt')) {
        setLocaleState(newLang)
      }
    }

    // Listen for storage events (from other windows/tabs)
    window.addEventListener('storage', handleStorageChange)

    // Listen for custom event (for same-window changes)
    window.addEventListener('languageChanged', handleStorageChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('languageChanged', handleStorageChange as EventListener)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('preferred-language', newLocale)
    // Dispatch custom event for same-window changes
    window.dispatchEvent(new Event('languageChanged'))
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = messages[locale]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key
      }
    }

    return typeof value === 'string' ? value : key
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <IntlContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </IntlContext.Provider>
  )
}

export function useIntl() {
  const context = useContext(IntlContext)
  if (!context) {
    throw new Error('useIntl must be used within IntlProvider')
  }
  return context
}
