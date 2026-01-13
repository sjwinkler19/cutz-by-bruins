/**
 * BARBER PROFILE VALIDATION SCHEMAS
 *
 * Zod schemas for validating barber profile data.
 * WHY: Ensure barber profiles meet quality standards before approval.
 */

import { z } from 'zod'

/**
 * Barber profile creation/update schema
 *
 * Rules enforced:
 * - Bio must be 50-150 characters (not too short, not too long)
 * - Price must be at least $10 (no maximum for premium services)
 * - Years experience must be positive
 * - At least one specialty required
 * - Location details required based on type
 */
export const barberProfileSchema = z.object({
  bio: z
    .string()
    .min(50, 'Bio must be at least 50 characters')
    .max(150, 'Bio must be no more than 150 characters'),
  years_experience: z
    .number()
    .int()
    .min(0, 'Years of experience must be positive')
    .max(50, 'Years of experience seems too high'),
  base_price: z
    .number()
    .min(0, 'Price must be at least $0')
    .max(500, 'Price must be no more than $500'),
  location_type: z.enum(['fixed', 'mobile']),
  location_area: z.string().optional(),
  exact_address: z.string().optional(),
  service_radius_miles: z.number().int().min(0).optional(),
  venmo_handle: z.string().optional(),
  zelle_handle: z.string().optional(),
  instagram_handle: z.string().optional(),
  appointment_duration: z.enum(['30', '45', '60']).transform(Number),
  specialties: z
    .array(
      z.enum([
        'fades',
        'long_hair',
        'womens_cuts',
        'beard_trim',
        'designs',
        'black_hair',
        'asian_hair',
        'curly_hair',
        'buzz_cuts',
      ])
    )
    .min(1, 'At least one specialty is required'),
})
.refine(
  (data) => {
    // If fixed location, require area and address
    if (data.location_type === 'fixed') {
      return data.location_area && data.exact_address
    }
    return true
  },
  {
    message: 'Fixed location requires area and exact address',
    path: ['location_area'],
  }
)
.refine(
  (data) => {
    // If mobile, require service radius
    if (data.location_type === 'mobile') {
      return data.service_radius_miles && data.service_radius_miles > 0
    }
    return true
  },
  {
    message: 'Mobile barbers must specify service radius',
    path: ['service_radius_miles'],
  }
)

export type BarberProfileInput = z.infer<typeof barberProfileSchema>
