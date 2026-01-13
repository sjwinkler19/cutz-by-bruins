/**
 * LOGOUT API ROUTE
 *
 * POST /api/auth/logout
 *
 * Logs out the current user and clears session.
 * WHY: Provide secure logout functionality.
 *
 * Response: { success: true } or { error: string }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    // Get Supabase client
    const supabase = await createClient()

    // Sign out the user
    // WHY: This clears the auth session and cookies
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
