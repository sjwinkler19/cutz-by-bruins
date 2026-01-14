/**
 * BARBER APPOINTMENTS PAGE
 *
 * Shows barber's appointments with management actions.
 * WHY: Let barbers view and manage customer bookings.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookingStatus } from '@/lib/validations/booking'

interface Booking {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  total_price: number
  status: BookingStatus
  customer: {
    full_name: string
    email: string
    phone: string | null
  }
}

export default function BarberAppointmentsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch barber's appointments
   */
  useEffect(() => {
    async function fetchAppointments() {
      try {
        // TODO: Need to create an API endpoint for barber's appointments
        // For now, fetch all bookings and filter by current barber
        const response = await fetch('/api/bookings')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch appointments')
        }

        setBookings(data.bookings || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  /**
   * Update booking status
   */
  async function updateStatus(bookingId: string, newStatus: string) {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update booking')
      }

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus as BookingStatus } : booking
        )
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update booking')
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
      <div className="container py-10">
        <div className="text-center">
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container py-10">
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive mb-4">
          {error}
        </div>
        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
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
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Appointments</h1>
            <p className="text-muted-foreground">Manage your customer bookings</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {bookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You don't have any appointments yet</p>
        </div>
      )}

      {/* Upcoming Appointments */}
      {upcomingBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Upcoming Appointments ({upcomingBookings.length})
          </h2>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{booking.customer.full_name}</CardTitle>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Booking Details */}
                    <div className="space-y-2">
                      <h4 className="font-semibold">Booking Details</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="text-muted-foreground">Date:</span>{' '}
                          {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Time:</span> {booking.start_time} -{' '}
                          {booking.end_time}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Price:</span> $
                          {booking.total_price}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-2">
                      <h4 className="font-semibold">Customer Info</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="text-muted-foreground">Email:</span> {booking.customer.email}
                        </p>
                        {booking.customer.phone && (
                          <p>
                            <span className="text-muted-foreground">Phone:</span>{' '}
                            {booking.customer.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(booking.id, 'confirmed')}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(booking.id, 'cancelled')}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(booking.id, 'completed')}
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Past Appointments ({pastBookings.length})
          </h2>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <Card key={booking.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{booking.customer.full_name}</CardTitle>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">Date:</span>{' '}
                      {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Time:</span> {booking.start_time} -{' '}
                      {booking.end_time}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Price:</span> ${booking.total_price}
                    </p>
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
