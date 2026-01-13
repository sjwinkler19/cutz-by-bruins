/**
 * BARBER PROFILE TYPES
 *
 * TypeScript types for barber profiles and related data.
 * WHY: Type safety for barber-specific features.
 */

/**
 * Barber profile approval status
 */
export type BarberStatus = 'pending' | 'approved' | 'suspended'

/**
 * Service location type
 */
export type LocationType = 'fixed' | 'mobile'

/**
 * Barber specialties
 */
export type Specialty =
  | 'fades'
  | 'long_hair'
  | 'womens_cuts'
  | 'beard_trim'
  | 'designs'
  | 'black_hair'
  | 'asian_hair'
  | 'curly_hair'
  | 'buzz_cuts'

/**
 * Complete barber profile from database
 */
export interface BarberProfile {
  id: string
  user_id: string
  bio: string
  profile_photo_url: string | null
  years_experience: number
  base_price: number
  location_type: LocationType
  location_area: string | null
  exact_address: string | null
  service_radius_miles: number | null
  venmo_handle: string | null
  zelle_handle: string | null
  instagram_handle: string | null
  appointment_duration: number
  status: BarberStatus
  rating_avg: number
  review_count: number
  created_at: string
  updated_at: string
}

/**
 * Barber specialty record
 */
export interface BarberSpecialty {
  id: string
  barber_id: string
  specialty: Specialty
  created_at: string
}

/**
 * Portfolio photo record
 */
export interface PortfolioPhoto {
  id: string
  barber_id: string
  photo_url: string
  caption: string | null
  order_index: number
  created_at: string
}

/**
 * Complete barber profile with specialties and photos
 */
export interface BarberProfileWithDetails extends BarberProfile {
  specialties: BarberSpecialty[]
  portfolio_photos: PortfolioPhoto[]
  user: {
    first_name: string
    last_name: string
    email: string
  }
}
