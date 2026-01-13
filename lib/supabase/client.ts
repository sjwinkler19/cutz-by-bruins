/**
 * SUPABASE CLIENT - Browser Side
 *
 * This file creates a Supabase client for use in browser/client components.
 * WHY: We need different clients for browser vs server due to how cookies are handled.
 *
 * Used by: Client components that need to interact with Supabase
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for browser-side operations
 *
 * @returns Supabase client instance configured for browser use
 *
 * @example
 * const supabase = createClient()
 * const { data } = await supabase.from('barber_profiles').select('*')
 */
export function createClient() {
  // Get environment variables for Supabase connection
  // NEXT_PUBLIC_ prefix makes these available in the browser
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Create and return browser client
  // This handles authentication cookies automatically
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
