import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase Browser Client
 *
 * This client is used in client-side components (components with 'use client' directive).
 * It uses the public anon key which is safe to expose in the browser.
 * Row Level Security (RLS) policies in Supabase protect data access.
 *
 * Usage:
 * import { createClient } from '@/lib/supabase/client'
 * const supabase = createClient()
 * const { data, error } = await supabase.auth.getSession()
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
