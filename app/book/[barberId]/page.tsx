/**
 * BOOKING PAGE
 *
 * Select date and time to book an appointment with a barber.
 * WHY: Let customers choose convenient appointment times.
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, addDays, startOfDay } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TimeSlot {
  start_time: string
  end_time: string
}

interface BarberInfo {
  id: string
  user: {
    full_name: string
  }
  base_price: number
  appointment_duration: number
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const barberId = params.barberId as string

  // State
  const [barber, setBarber] = useState<BarberInfo | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate next 14 days for date selection
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))

  /**
   * Fetch barber info on mount
   */
  useEffect(() => {
    async function fetchBarber() {
      try {
        const response = await fetch(`/api/barbers/${barberId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch barber')
        }

        setBarber(data.barber)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }

    fetchBarber()
  }, [barberId])

  /**
   * Fetch available slots when date changes
   */
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate) return

      setIsLoadingSlots(true)
      setSelectedSlot(null)
      setError(null)

      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        const response = await fetch(`/api/barbers/${barberId}/slots?date=${dateStr}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch available slots')
        }

        setAvailableSlots(data.slots || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setAvailableSlots([])
      } finally {
        setIsLoadingSlots(false)
      }
    }

    fetchSlots()
  }, [selectedDate, barberId])

  /**
   * Submit booking
   */
  async function handleSubmit() {
    if (!selectedSlot || !selectedDate) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barber_id: barberId,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedSlot.start_time,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      // Success - redirect to confirmation page
      router.push(`/bookings/${data.booking.id}/confirmation`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!barber) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      {/* Header */}
      <div className="mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold mt-4">Book Appointment</h1>
        <p className="text-muted-foreground mt-2">
          Booking with {barber.user.full_name} - ${barber.base_price} ({barber.appointment_duration}{' '}
          min)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableDates.map((date) => {
                const isSelected =
                  format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(startOfDay(date))}
                    className={`w-full text-left px-4 py-3 rounded-md border transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="font-medium">{format(date, 'EEEE, MMMM d')}</div>
                    <div className="text-sm opacity-90">{format(date, 'yyyy')}</div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Time Slot Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Time</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Loading state */}
            {isLoadingSlots && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading available times...</p>
              </div>
            )}

            {/* No slots available */}
            {!isLoadingSlots && availableSlots.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No available times for this date</p>
              </div>
            )}

            {/* Slots grid */}
            {!isLoadingSlots && availableSlots.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected =
                    selectedSlot?.start_time === slot.start_time &&
                    selectedSlot?.end_time === slot.end_time
                  return (
                    <button
                      key={`${slot.start_time}-${slot.end_time}`}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {slot.start_time}
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Summary */}
      {selectedSlot && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-6">
              <p>
                <span className="font-medium">Barber:</span> {barber.user.full_name}
              </p>
              <p>
                <span className="font-medium">Date:</span> {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
              <p>
                <span className="font-medium">Time:</span> {selectedSlot.start_time} -{' '}
                {selectedSlot.end_time}
              </p>
              <p>
                <span className="font-medium">Duration:</span> {barber.appointment_duration} minutes
              </p>
              <p className="text-lg font-semibold">
                <span className="font-medium">Price:</span> ${barber.base_price}
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
