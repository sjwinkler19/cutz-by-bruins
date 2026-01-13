/**
 * BOOKING VALIDATION SCHEMAS
 *
 * Zod schemas for validating booking-related data.
 * WHY: Ensure booking requests are valid before processing.
 */

import { z } from 'zod'

/**
 * Create booking validation schema
 *
 * Rules:
 * - Barber ID must be valid UUID
 * - Date must be valid format and in the future
 * - Time must be valid format
 * - Customer notes optional but limited to 500 chars
 * - Customer location required for mobile barbers
 */
export const createBookingSchema = z.object({
  barber_id: z.string().uuid('Invalid barber ID'),
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  appointment_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  customer_notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .optional(),
  customer_location: z
    .string()
    .max(200, 'Location must be 200 characters or less')
    .optional(),
})

/**
 * Update booking status validation schema
 */
export const updateBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled', 'no_show']),
  cancellation_reason: z.string().max(500).optional(),
  cancelled_by: z.enum(['customer', 'barber']).optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>
