import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase Server Client
 *
 * This client is used in server components, API routes, and server actions.
 * It properly handles cookies for session management in Next.js App Router.
 *
 * Usage in Server Components:
 * import { createClient } from '@/lib/supabase/server'
 * const supabase = createClient()
 * const { data: { user } } = await supabase.auth.getUser()
 *
 * Usage in API Routes:
 * import { createClient } from '@/lib/supabase/server'
 * const supabase = createClient()
 * const { data, error } = await supabase.from('table_name').select()
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
