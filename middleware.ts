/**
 * NEXT.JS MIDDLEWARE
 *
 * Runs on every request before the route handler.
 * WHY: We use this to keep Supabase auth sessions fresh.
 *
 * This runs automatically - you don't need to import it anywhere.
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Middleware function that runs on every request
 * Currently only handles Supabase session refresh
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

/**
 * Configure which routes this middleware runs on
 *
 * WHY: We want it on all routes except static files and images
 * This prevents unnecessary processing for assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
