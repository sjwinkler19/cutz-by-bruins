/**
 * BARBER CARD COMPONENT
 *
 * Displays a barber's summary information in a card format.
 * WHY: Reusable component for showing barbers in lists/grids.
 */

import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BarberCardProps {
  barber: {
    id: string
    user: {
      full_name: string
    }
    bio: string
    years_experience: number
    base_price: number
    location_area: string | null
    location_type: 'fixed' | 'mobile'
    average_rating: number | null
    total_reviews: number
    specialties: string[]
  }
}

export function BarberCard({ barber }: BarberCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex-1 pt-6">
        {/* Barber Name */}
        <h3 className="text-xl font-semibold mb-2">
          {barber.user.full_name}
        </h3>

        {/* Location Type Badge */}
        <div className="mb-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              barber.location_type === 'fixed'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {barber.location_type === 'fixed' ? 'Fixed Location' : 'Mobile Service'}
          </span>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {barber.bio}
        </p>

        {/* Experience & Price */}
        <div className="space-y-1 text-sm mb-4">
          <p>
            <span className="font-medium">Experience:</span> {barber.years_experience} years
          </p>
          <p>
            <span className="font-medium">Base Price:</span> ${barber.base_price}
          </p>
          {barber.location_area && (
            <p>
              <span className="font-medium">Area:</span> {barber.location_area}
            </p>
          )}
        </div>

        {/* Rating */}
        {barber.average_rating !== null && barber.total_reviews > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-500">★</span>
            <span className="font-medium">{barber.average_rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({barber.total_reviews} {barber.total_reviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}

        {/* Specialties */}
        <div className="flex flex-wrap gap-1">
          {barber.specialties.slice(0, 3).map((specialty) => (
            <span
              key={specialty}
              className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
            >
              {specialty.replace('_', ' ')}
            </span>
          ))}
          {barber.specialties.length > 3 && (
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
              +{barber.specialties.length - 3}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/barbers/${barber.id}`} className="w-full">
          <Button className="w-full">View Profile & Book</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
