/**
 * AVAILABLE SLOTS CALCULATION API ROUTE
 *
 * GET /api/barbers/[id]/slots?date=YYYY-MM-DD
 *
 * Calculates available time slots for a barber on a specific date.
 * WHY: Customers need to see which times are available for booking.
 *
 * Logic:
 * 1. Get barber's regular schedule for that day of week
 * 2. Check for exceptions (blocked dates or special hours)
 * 3. Get existing bookings for that date
 * 4. Calculate free slots based on appointment duration
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { timeToMinutes, generateTimeSlots } from '@/lib/utils/time'
import { DATE_REGEX } from '@/lib/validations/common'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: barberId } = await params
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    // Validate date parameter
    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required (format: YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    // Validate date format
    if (!DATE_REGEX.test(dateParam)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const date = new Date(dateParam + 'T00:00:00')
    const dayOfWeek = date.getDay()

    const supabase = await createClient()

    // Step 1: Get barber profile (for appointment duration)
    const { data: barber, error: barberError } = await supabase
      .from('barber_profiles')
      .select('appointment_duration, status')
      .eq('id', barberId)
      .eq('status', 'approved')
      .single()

    if (barberError || !barber) {
      return NextResponse.json(
        { error: 'Barber not found or not approved' },
        { status: 404 }
      )
    }

    const appointmentDuration = barber.appointment_duration

    // Step 2: Check for exceptions on this date
    const { data: exception } = await supabase
      .from('availability_exceptions')
      .select('*')
      .eq('barber_id', barberId)
      .eq('date', dateParam)
      .single()

    let availableHours: Array<{ start_time: string; end_time: string }> = []

    if (exception) {
      // Exception exists for this date
      if (!exception.is_available) {
        // Date is blocked - no availability
        return NextResponse.json({
          date: dateParam,
          available_slots: [],
          message: 'Barber is not available on this date',
        })
      } else {
        // Special availability for this date
        availableHours = [
          {
            start_time: exception.start_time,
            end_time: exception.end_time,
          },
        ]
      }
    } else {
      // No exception - use regular schedule
      const { data: schedule } = await supabase
        .from('availability_schedule')
        .select('*')
        .eq('barber_id', barberId)
        .eq('day_of_week', dayOfWeek)

      if (!schedule || schedule.length === 0) {
        // No regular schedule for this day
        return NextResponse.json({
          date: dateParam,
          available_slots: [],
          message: 'Barber is not available on this day of the week',
        })
      }

      availableHours = schedule.map((slot) => ({
        start_time: slot.start_time,
        end_time: slot.end_time,
      }))
    }

    // Step 3: Get existing bookings for this date
    const { data: bookings } = await supabase
      .from('bookings')
      .select('appointment_time, duration_minutes')
      .eq('barber_id', barberId)
      .eq('appointment_date', dateParam)
      .in('status', ['pending', 'confirmed']) // Only active bookings

    // Step 4: Generate all possible slots from available hours
    let allSlots: string[] = []
    for (const hours of availableHours) {
      const slots = generateTimeSlots(
        hours.start_time,
        hours.end_time,
        appointmentDuration
      )
      allSlots = [...allSlots, ...slots]
    }

    // Step 5: Filter out booked slots
    const bookedSlots = new Set<string>()
    if (bookings) {
      for (const booking of bookings) {
        const bookingStart = timeToMinutes(booking.appointment_time)
        const bookingEnd = bookingStart + booking.duration_minutes

        // Mark all slots that overlap with this booking as booked
        for (const slot of allSlots) {
          const slotStart = timeToMinutes(slot)
          const slotEnd = slotStart + appointmentDuration

          // Check if slot overlaps with booking
          if (slotStart < bookingEnd && slotEnd > bookingStart) {
            bookedSlots.add(slot)
          }
        }
      }
    }

    // Step 6: Return available slots
    const availableSlots = allSlots.filter((slot) => !bookedSlots.has(slot))

    return NextResponse.json({
      date: dateParam,
      day_of_week: dayOfWeek,
      appointment_duration: appointmentDuration,
      available_slots: availableSlots,
      total_slots: availableSlots.length,
    })
  } catch (error) {
    console.error('Get available slots error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate available slots' },
      { status: 500 }
    )
  }
}
