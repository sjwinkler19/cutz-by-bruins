/**
 * AUTHENTICATION TYPES
 *
 * TypeScript types for authentication and user data.
 * WHY: Type safety helps catch errors at compile time.
 */

/**
 * User role in the system
 * - customer: Can book appointments
 * - barber: Can receive bookings and manage profile
 * - admin: Platform administrator (future use)
 */
export type UserRole = 'customer' | 'barber' | 'admin'

/**
 * Complete user profile data from database
 * Matches the 'users' table schema
 */
export interface User {
  id: string
  auth_id: string
  email: string
  phone: string | null
  first_name: string
  last_name: string
  role: UserRole
  ucla_verified: boolean
  created_at: string
  updated_at: string
}

/**
 * Registration form data for new users
 */
export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
}

/**
 * Login form data
 */
export interface LoginData {
  email: string
  password: string
}
