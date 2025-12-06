// Blocked keys that could lead to prototype pollution
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

function isValidKey(key: string): boolean {
  return !BLOCKED_KEYS.has(key)
}

/**
 * Safely traverse an object using dot-notation keys, preventing prototype pollution
 * @param obj The object to traverse
 * @param key Dot-notation key (e.g., "home.title")
 * @returns The value at the key path, or the key itself if not found
 */
export function safeTranslate(obj: any, key: string): string {
  const keys = key.split('.')
  
  // Validate all keys to prevent prototype pollution
  if (!keys.every(isValidKey)) {
    return key
  }
  
  let value: any = obj
  
  for (const k of keys) {
    if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, k)) {
      value = value[k]
    } else {
      return key
    }
  }
  
  return typeof value === 'string' ? value : key
}

/**
 * Creates a translation function for a given messages object
 * @param messages The messages object to use for translations
 * @returns A translation function
 */
export function createTranslator(messages: any): (key: string) => string {
  return (key: string) => safeTranslate(messages, key)
}
