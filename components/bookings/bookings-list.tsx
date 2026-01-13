/**
 * BOOKINGS LIST COMPONENT
 *
 * Displays user's bookings with management actions.
 * WHY: Let customers view and manage their appointments.
 */

'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Booking {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  total_price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  barber: {
    id: string
    user: {
      full_name: string
    }
  }
}

export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch user's bookings
   */
  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch('/api/bookings')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch bookings')
        }

        setBookings(data.bookings || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  /**
   * Cancel a booking
   */
  async function handleCancel(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel booking')
      }

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
        )
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel booking')
    }
  }

  /**
   * Get status badge color
   */
  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'confirmed':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading bookings...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  // Empty state
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">You don't have any bookings yet</p>
        <Link href="/barbers">
          <Button>Find a Barber</Button>
        </Link>
      </div>
    )
  }

  // Group bookings by status
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  )
  const pastBookings = bookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  )

  return (
    <div className="space-y-8">
      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{booking.barber.user.full_name}</h4>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p>
                          {booking.start_time} - {booking.end_time}
                        </p>
                        <p className="font-medium text-foreground">
                          ${booking.total_price}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/barbers/${booking.barber.id}`}>
                        <Button variant="outline" size="sm">
                          View Barber
                        </Button>
                      </Link>
                      {booking.status !== 'cancelled' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Past Appointments</h3>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <Card key={booking.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{booking.barber.user.full_name}</h4>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p>
                          {booking.start_time} - {booking.end_time}
                        </p>
                        <p className="font-medium text-foreground">
                          ${booking.total_price}
                        </p>
                      </div>
                    </div>
                    {booking.status === 'completed' && (
                      <Link href={`/reviews/new?booking_id=${booking.id}`}>
                        <Button variant="outline" size="sm">
                          Leave Review
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
