/**
 * SUPABASE CLIENT - Server Side
 *
 * This file creates a Supabase client for use in Server Components and API routes.
 * WHY: Server-side code needs special cookie handling that differs from browser.
 *
 * Used by: Server Components, API routes, Server Actions
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for server-side operations
 *
 * @returns Supabase client instance configured for server use with cookie support
 *
 * @example
 * const supabase = createClient()
 * const { data } = await supabase.from('users').select('*')
 */
export async function createClient() {
  // Get the Next.js cookies store
  // WHY: We need to read/write auth cookies for session management
  const cookieStore = await cookies()

  // Create server client with cookie handlers
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // How to read a cookie
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // How to set a cookie
        // WHY: Supabase auth needs to store session tokens in cookies
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Can fail in Server Components (read-only)
            // That's okay - will work in API routes/Server Actions
          }
        },
        // How to delete a cookie (for logout)
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Can fail in Server Components
          }
        },
      },
    }
  )
}
