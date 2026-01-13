/**
 * BARBER AVAILABILITY PAGE
 *
 * View and manage availability schedule.
 * WHY: Let barbers control when they're available for bookings.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AvailabilitySlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

interface AvailabilityException {
  id: string
  exception_date: string
  is_available: boolean
  start_time: string | null
  end_time: string | null
  reason: string | null
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export default function BarberAvailabilityPage() {
  const router = useRouter()
  const [schedule, setSchedule] = useState<AvailabilitySlot[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch availability schedule
   */
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const response = await fetch('/api/barber/availability/schedule')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch availability')
        }

        setSchedule(data.schedule || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    async function fetchExceptions() {
      try {
        const response = await fetch('/api/barber/availability/exceptions')
        const data = await response.json()

        if (response.ok) {
          setExceptions(data.exceptions || [])
        }
      } catch (err) {
        // Non-critical, just log
        console.error('Failed to fetch exceptions:', err)
      }
    }

    fetchAvailability()
    fetchExceptions()
  }, [])

  /**
   * Group schedule by day of week
   */
  const scheduleByDay = schedule.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = []
    }
    acc[slot.day_of_week].push(slot)
    return acc
  }, {} as Record<number, AvailabilitySlot[]>)

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <p className="text-muted-foreground">Loading availability...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Availability</h1>
            <p className="text-muted-foreground">Manage your schedule and availability</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {schedule.length === 0 ? (
              <p className="text-muted-foreground">
                No availability set. You won't receive bookings until you set your schedule.
              </p>
            ) : (
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((dayName, dayIndex) => {
                  const daySlots = scheduleByDay[dayIndex] || []
                  return (
                    <div key={dayIndex} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="w-32 font-medium">{dayName}</div>
                      <div className="flex-1">
                        {daySlots.length === 0 ? (
                          <span className="text-sm text-muted-foreground">Not available</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {daySlots.map((slot) => (
                              <span
                                key={slot.id}
                                className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                              >
                                {slot.start_time} - {slot.end_time}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Availability Exceptions */}
        <Card>
          <CardHeader>
            <CardTitle>Availability Exceptions</CardTitle>
          </CardHeader>
          <CardContent>
            {exceptions.length === 0 ? (
              <p className="text-muted-foreground">No exceptions set</p>
            ) : (
              <div className="space-y-3">
                {exceptions.map((exception) => (
                  <div
                    key={exception.id}
                    className="flex items-start justify-between p-3 rounded-md border"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(exception.exception_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {exception.is_available ? (
                        <p className="text-sm text-muted-foreground">
                          {exception.start_time} - {exception.end_time}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not available</p>
                      )}
                      {exception.reason && (
                        <p className="text-sm text-muted-foreground mt-1">{exception.reason}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        exception.is_available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {exception.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Note */}
        <div className="rounded-md bg-muted p-4 text-sm">
          <p className="font-medium mb-2">About Availability</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Set your weekly schedule to receive bookings</li>
            <li>• Add exceptions for holidays or special hours</li>
            <li>• Customers can only book during your available times</li>
            <li>• Schedule editing will be available in a future update</li>
          </ul>
        </div>

        {/* Temporary Notice */}
        <div className="rounded-md bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700 text-center">
          <p>
            To set or update your availability, please contact support. A self-service interface
            will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  )
}
