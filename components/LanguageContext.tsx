'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Load language preference from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    try {
      const savedLanguage = localStorage.getItem('preferred-language') as Language;
      if (savedLanguage && translations[savedLanguage]) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('preferred-language', lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
    window.dispatchEvent(new Event('languageChanged'));
  };

  const t = (key: string): string => {
    // Check if the key contains dots (nested key)
    if (key.includes('.')) {
      const keys = key.split('.');
      let value: any = translations[language];

      // Traverse the nested object structure
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // If not found in current language, try English fallback
          let fallbackValue: any = translations.en;
          for (const fk of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
              fallbackValue = fallbackValue[fk];
            } else {
              // If not found in fallback either, return the key itself
              return key;
            }
          }
          return typeof fallbackValue === 'string' ? fallbackValue : key;
        }
      }

      return typeof value === 'string' ? value : key;
    }

    // Handle flat keys (original behavior)
    const langTranslations = translations[language as Language] as unknown as Record<string, string>;
    const value = langTranslations[key];
    if (typeof value === 'string') {
      return value;
    }
    const fallback = (translations.en as unknown as Record<string, string>)[key];
    if (typeof fallback === 'string') {
      return fallback;
    }
    return key;
  };

  // Return children even if not mounted to avoid hydration mismatch
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
