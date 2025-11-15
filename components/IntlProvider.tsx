"use client"

import { createContext, useContext, ReactNode } from 'react'
import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'
import ptMessages from '@/messages/pt.json'
import { useLanguage } from '@/components/LanguageContext'

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
  pt: ptMessages,
}

export function IntlProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useLanguage()
  const locale: Locale = (language as Locale) ?? 'en'

  const setLocale = (newLocale: Locale) => {
    setLanguage(newLocale)
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
