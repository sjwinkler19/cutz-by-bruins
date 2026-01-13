/**
 * BOOKING CONFIRMATION PAGE
 *
 * Shows booking details after successful creation.
 * WHY: Confirm booking details and provide next steps.
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Booking {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  total_price: number
  status: string
  barber: {
    user: {
      full_name: string
    }
    appointment_duration: number
    venmo_handle: string | null
    zelle_handle: string | null
    location_type: string
    exact_address: string | null
    service_radius_miles: number | null
  }
}

export default function BookingConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch booking details
   */
  useEffect(() => {
    async function fetchBooking() {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch booking')
        }

        setBooking(data.booking)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="container max-w-2xl py-10">
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive mb-4">
          {error || 'Booking not found'}
        </div>
        <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-10">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground">
          Your appointment has been successfully booked
        </p>
      </div>

      {/* Booking Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Barber</p>
              <p className="font-medium">{booking.barber.user.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="font-medium">${booking.total_price}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium">
                {booking.start_time} - {booking.end_time}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{booking.barber.appointment_duration} minutes</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                {booking.status}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Location</p>
            {booking.barber.location_type === 'fixed' && booking.barber.exact_address ? (
              <p className="font-medium">{booking.barber.exact_address}</p>
            ) : (
              <p className="font-medium">
                Mobile service (barber will come to you)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      {(booking.barber.venmo_handle || booking.barber.zelle_handle) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Please pay your barber ${booking.total_price} using one of these methods:
            </p>
            <div className="space-y-2">
              {booking.barber.venmo_handle && (
                <div className="flex items-center justify-between p-3 rounded-md bg-muted">
                  <span className="font-medium">Venmo</span>
                  <span className="text-muted-foreground">@{booking.barber.venmo_handle}</span>
                </div>
              )}
              {booking.barber.zelle_handle && (
                <div className="flex items-center justify-between p-3 rounded-md bg-muted">
                  <span className="font-medium">Zelle</span>
                  <span className="text-muted-foreground">{booking.barber.zelle_handle}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✓ Your barber has been notified of this booking</p>
          <p>✓ You'll receive updates if the barber confirms or requests changes</p>
          <p>✓ Please arrive on time for your appointment</p>
          <p>✓ If you need to cancel, please do so at least 24 hours in advance</p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full">
            Go to Dashboard
          </Button>
        </Link>
        <Link href="/barbers" className="flex-1">
          <Button variant="outline" className="w-full">
            Browse More Barbers
          </Button>
        </Link>
      </div>
    </div>
  )
}
