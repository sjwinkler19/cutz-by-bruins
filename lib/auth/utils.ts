/**
 * AUTHENTICATION UTILITIES
 *
 * Helper functions for user authentication and session management.
 * WHY: Centralize auth logic to avoid duplication across the app.
 *
 * Used by: API routes, Server Components, middleware
 */

import { createClient } from '@/lib/supabase/server'
import { User } from './types'

/**
 * Gets the currently logged-in user from the session
 *
 * @returns User object if logged in, null if not
 *
 * @example
 * const user = await getCurrentUser()
 * if (!user) {
 *   redirect('/login')
 * }
 */
export async function getCurrentUser(): Promise<User | null> {
  // Get server Supabase client
  const supabase = await createClient()

  // Get the authenticated user from Supabase Auth
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // If not authenticated, return null
  if (!authUser) {
    return null
  }

  // Fetch full user profile from our users table
  // WHY: Supabase Auth only stores email/id, we need role, name, etc.
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authUser.id)
    .single()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Checks if the current user is authenticated
 *
 * @returns true if user is logged in, false otherwise
 *
 * @example
 * const isAuthenticated = await isLoggedIn()
 */
export async function isLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Checks if the current user is a barber
 *
 * @returns true if user is a barber, false otherwise
 *
 * @example
 * const canAccessBarberDashboard = await isBarber()
 */
export async function isBarber(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'barber'
}

/**
 * Requires user to be authenticated, redirects to login if not
 *
 * @returns User object
 * @throws Redirects to /login if not authenticated
 *
 * @example
 * const user = await requireAuth()
 * // User is guaranteed to be logged in here
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    // Redirect to login page
    // WHY: Using Next.js redirect() to handle navigation
    const { redirect } = await import('next/navigation')
    redirect('/login')
    // TypeScript doesn't know redirect() never returns, so we add this to satisfy the compiler
    throw new Error('Redirecting')
  }

  return user
}

/**
 * Requires user to be a barber, redirects if not
 *
 * @returns User object (guaranteed to be a barber)
 * @throws Redirects to /dashboard if not a barber
 *
 * @example
 * const barber = await requireBarber()
 * // User is guaranteed to be a barber here
 */
export async function requireBarber(): Promise<User> {
  const user = await requireAuth()

  if (user.role !== 'barber') {
    const { redirect } = await import('next/navigation')
    redirect('/dashboard')
    throw new Error('Redirecting')
  }

  return user
}
