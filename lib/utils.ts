/**
 * UTILITY FUNCTIONS
 *
 * Helper functions used throughout the application.
 * WHY: Centralize common utilities to avoid duplication.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines Tailwind CSS classes with proper merging
 *
 * WHY: Allows conditional classes and prevents duplicate utilities
 *
 * @example
 * cn('px-2 py-1', isActive && 'bg-blue-500', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
