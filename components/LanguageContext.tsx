'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Blocked keys that could lead to prototype pollution
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isValidKey(key: string): boolean {
  return !BLOCKED_KEYS.has(key);
}

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
      
      // Validate all keys to prevent prototype pollution
      if (!keys.every(isValidKey)) {
        return key;
      }
      
      let value: any = translations[language];

      // Traverse the nested object structure
      for (const k of keys) {
        if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, k)) {
          value = value[k];
        } else {
          // If not found in current language, try English fallback
          let fallbackValue: any = translations.en;
          for (const fk of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && Object.prototype.hasOwnProperty.call(fallbackValue, fk)) {
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

    // Validate key to prevent prototype pollution
    if (!isValidKey(key)) {
      return key;
    }

    // Handle flat keys (original behavior)
    const langTranslations = translations[language as Language] as unknown as Record<string, string>;
    if (Object.prototype.hasOwnProperty.call(langTranslations, key)) {
      const value = langTranslations[key];
      if (typeof value === 'string') {
        return value;
      }
    }
    const enTranslations = translations.en as unknown as Record<string, string>;
    if (Object.prototype.hasOwnProperty.call(enTranslations, key)) {
      const fallback = enTranslations[key];
      if (typeof fallback === 'string') {
        return fallback;
      }
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
