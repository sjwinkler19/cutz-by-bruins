/**
 * COMMON VALIDATION PATTERNS
 *
 * Shared regex patterns and Zod schemas used across the application.
 * WHY: Centralize validation logic to ensure consistency.
 */

import { z } from 'zod'

/**
 * Regex patterns
 */
export const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Reusable Zod schemas
 */
export const timeSchema = z.string().regex(TIME_REGEX, 'Invalid time format (HH:MM)')
export const dateSchema = z.string().regex(DATE_REGEX, 'Invalid date format (YYYY-MM-DD)')
export const uuidSchema = z.string().regex(UUID_REGEX, 'Invalid ID format')
