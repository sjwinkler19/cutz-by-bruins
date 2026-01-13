/**
 * AUTH CALLBACK ROUTE
 *
 * GET /auth/callback
 *
 * Handles email verification callback from Supabase.
 * WHY: After user clicks verification link in email, this exchanges the
 * code for a session and redirects to the app.
 *
 * This is called automatically by Supabase Auth.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // Exchange the code for a session
    // WHY: The email link contains a code that we exchange for auth tokens
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to home page after verification
  // WHY: User is now authenticated and can use the app
  return NextResponse.redirect(new URL('/login?verified=true', requestUrl.origin))
}
