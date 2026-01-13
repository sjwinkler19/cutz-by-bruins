/**
 * BARBER DETAIL PAGE
 *
 * Shows complete barber profile with reviews and booking.
 * WHY: Let customers view full details before booking.
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BarberDetail {
  id: string
  user: {
    full_name: string
  }
  bio: string
  years_experience: number
  base_price: number
  appointment_duration: number
  location_type: 'fixed' | 'mobile'
  location_area: string | null
  exact_address: string | null
  service_radius_miles: number | null
  venmo_handle: string | null
  zelle_handle: string | null
  instagram_handle: string | null
  specialties: string[]
  average_rating: number | null
  total_reviews: number
  status: string
}

interface Review {
  id: string
  customer: {
    full_name: string
  }
  rating: number
  comment: string | null
  created_at: string
}

export default function BarberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const barberId = params.id as string

  const [barber, setBarber] = useState<BarberDetail | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch barber details and reviews
   */
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch barber details
        const barberResponse = await fetch(`/api/barbers/${barberId}`)
        const barberData = await barberResponse.json()

        if (!barberResponse.ok) {
          throw new Error(barberData.error || 'Failed to fetch barber')
        }

        setBarber(barberData.barber)

        // Fetch reviews
        const reviewsResponse = await fetch(`/api/barbers/${barberId}/reviews`)
        const reviewsData = await reviewsResponse.json()

        if (reviewsResponse.ok) {
          setReviews(reviewsData.reviews || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    if (barberId) {
      fetchData()
    }
  }, [barberId])

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <p className="text-muted-foreground">Loading barber profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !barber) {
    return (
      <div className="container py-10">
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive mb-4">
          {error || 'Barber not found'}
        </div>
        <Button onClick={() => router.push('/barbers')}>Back to Barbers</Button>
      </div>
    )
  }

  return (
    <div className="container py-10">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/barbers')}>
          ← Back to Barbers
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">
                    {barber.user.full_name}
                  </CardTitle>
                  <div className="flex items-center gap-3 mb-3">
                    {/* Service Type Badge */}
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        barber.location_type === 'fixed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {barber.location_type === 'fixed' ? 'Fixed Location' : 'Mobile Service'}
                    </span>
                    {/* Status Badge */}
                    {barber.status === 'approved' && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  {/* Rating */}
                  {barber.average_rating !== null && barber.total_reviews > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 text-xl">★</span>
                      <span className="text-xl font-semibold">
                        {barber.average_rating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({barber.total_reviews} {barber.total_reviews === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{barber.bio}</p>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium">{barber.years_experience} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Base Price</p>
                  <p className="font-medium">${barber.base_price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Appointment Duration</p>
                  <p className="font-medium">{barber.appointment_duration} minutes</p>
                </div>
                {barber.location_area && (
                  <div>
                    <p className="text-sm text-muted-foreground">Area</p>
                    <p className="font-medium">{barber.location_area}</p>
                  </div>
                )}
                {barber.service_radius_miles && (
                  <div>
                    <p className="text-sm text-muted-foreground">Service Radius</p>
                    <p className="font-medium">{barber.service_radius_miles} miles</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {barber.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                  >
                    {specialty.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({barber.total_reviews})</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{review.customer.full_name}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{review.rating}</span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Book Appointment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-2xl font-bold">${barber.base_price}</p>
                <p className="text-sm text-muted-foreground">
                  {barber.appointment_duration} minutes
                </p>
              </div>

              <Link href={`/book/${barber.id}`} className="block">
                <Button className="w-full" size="lg">
                  Book Now
                </Button>
              </Link>

              {/* Payment Methods */}
              {(barber.venmo_handle || barber.zelle_handle || barber.instagram_handle) && (
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm font-medium">Payment Methods</p>
                  {barber.venmo_handle && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Venmo:</span> @{barber.venmo_handle}
                    </p>
                  )}
                  {barber.zelle_handle && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Zelle:</span> {barber.zelle_handle}
                    </p>
                  )}
                  {barber.instagram_handle && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Instagram:</span> @
                      {barber.instagram_handle}
                    </p>
                  )}
                </div>
              )}

              {/* Location Info */}
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium">Location</p>
                {barber.location_type === 'fixed' && barber.exact_address && (
                  <p className="text-sm text-muted-foreground">{barber.exact_address}</p>
                )}
                {barber.location_type === 'mobile' && (
                  <p className="text-sm text-muted-foreground">
                    Mobile service within {barber.service_radius_miles} miles
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
