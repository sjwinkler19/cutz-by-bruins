/**
 * REVIEW VALIDATION SCHEMAS
 *
 * Zod schemas for validating review data.
 * WHY: Ensure reviews meet quality standards and prevent spam.
 */

import { z } from 'zod'

/**
 * Submit review validation schema
 *
 * Rules:
 * - Booking ID must be valid UUID
 * - Rating must be 1-5 stars
 * - Review text optional but limited to 500 chars
 * - Tags optional (array of predefined tags)
 * - Photo URL optional
 */
export const submitReviewSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  review_text: z
    .string()
    .max(500, 'Review must be 500 characters or less')
    .optional(),
  photo_url: z.string().url('Must be a valid URL').optional(),
  tags: z
    .array(z.string())
    .max(5, 'Maximum 5 tags allowed')
    .optional(),
})

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>
