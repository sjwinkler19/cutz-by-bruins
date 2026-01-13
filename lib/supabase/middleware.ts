/**
 * SUPABASE MIDDLEWARE
 *
 * This middleware refreshes Supabase auth tokens on every request.
 * WHY: Keeps users logged in automatically without manual token refresh.
 *
 * Used by: Next.js middleware (middleware.ts at root level)
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Updates the Supabase session on each request
 *
 * @param request - The incoming Next.js request
 * @returns Modified response with updated auth cookies
 *
 * WHY: Auth tokens expire, this keeps them fresh automatically
 */
export async function updateSession(request: NextRequest) {
  // Create a response we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client with request/response cookie handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on both request and response
          // WHY: Request for current route, response for next route
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh the session (this is the important part!)
  // WHY: Extends the user's session automatically
  await supabase.auth.getUser()

  return response
}
