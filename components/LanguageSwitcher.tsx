'use client'

import { useLanguage } from './LanguageContext'
import { Language } from '@/lib/translations'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ]

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
            language === lang.code
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
          title={lang.label}
        >
          <span className="mr-1">{lang.flag}</span>
          <span className="hidden sm:inline">{lang.label}</span>
          <span className="sm:hidden">{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  )
}
