/**
 * AUTHENTICATION VALIDATION SCHEMAS
 *
 * Zod schemas for validating auth-related form data.
 * WHY: Validate user input before processing to prevent errors and security issues.
 *
 * Used by: API routes, form components
 */

import { z } from 'zod'

/**
 * Registration form validation schema
 *
 * Rules:
 * - Email must be valid format
 * - Password must be at least 8 characters
 * - First and last name required
 * - Phone optional but must be valid format if provided
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
})

/**
 * Login form validation schema
 *
 * Rules:
 * - Email must be valid format
 * - Password required
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Export TypeScript types from schemas
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
