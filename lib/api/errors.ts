/**
 * API ERROR UTILITIES
 *
 * Shared error handling functions for API routes.
 * WHY: Standardize error responses and return all validation errors.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Create a validation error response from a ZodError
 * Returns all validation errors, not just the first one
 */
export function validationErrorResponse(error: z.ZodError) {
  const messages = error.issues.map((issue) => issue.message)
  return NextResponse.json(
    {
      error: messages[0], // First error for backwards compatibility
      errors: messages,   // All errors for better UX
    },
    { status: 400 }
  )
}

/**
 * Create a standard error response
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Create an unauthorized error response
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/**
 * Create a not found error response
 */
export function notFoundResponse(resource: string = 'Resource') {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 })
}
