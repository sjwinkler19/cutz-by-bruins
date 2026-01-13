/**
 * BOOKINGS API ROUTE
 *
 * POST /api/bookings - Create a new booking
 * GET /api/bookings - Get user's bookings
 *
 * WHY: Core booking functionality for the marketplace.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/utils'
import { createBookingSchema } from '@/lib/validations/booking'
import { z } from 'zod'

/**
 * GET - Fetch current user's bookings
 * Returns both bookings as customer and as barber
 */
export async function GET(request: NextRequest) {
  try {
    // Ensure user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // 'customer' or 'barber'
    const status = searchParams.get('status') // Filter by status

    const supabase = await createClient()

    let query

    if (role === 'barber') {
      // Get bookings where user is the barber
      // First get barber profile
      const { data: profile } = await supabase
        .from('barber_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profile) {
        return NextResponse.json({
          bookings: [],
          message: 'No barber profile found',
        })
      }

      query = supabase
        .from('bookings')
        .select(`
          *,
          customer:users!bookings_customer_id_fkey(first_name, last_name, email, phone)
        `)
        .eq('barber_id', profile.id)
    } else {
      // Get bookings where user is the customer (default)
      query = supabase
        .from('bookings')
        .select(`
          *,
          barber:barber_profiles!bookings_barber_id_fkey(
            id,
            base_price,
            location_type,
            location_area,
            exact_address,
            user:users!barber_profiles_user_id_fkey(first_name, last_name, email, phone)
          )
        `)
        .eq('customer_id', user.id)
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Order by date (most recent first)
    query = query.order('appointment_date', { ascending: false })
    query = query.order('appointment_time', { ascending: false })

    const { data: bookings, error } = await query

    if (error) throw error

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create a new booking
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)

    const supabase = await createClient()

    // Step 1: Get barber profile (for price and duration)
    const { data: barber, error: barberError } = await supabase
      .from('barber_profiles')
      .select('id, base_price, appointment_duration, location_type, status')
      .eq('id', validatedData.barber_id)
      .single()

    if (barberError || !barber) {
      return NextResponse.json(
        { error: 'Barber not found' },
        { status: 404 }
      )
    }

    if (barber.status !== 'approved') {
      return NextResponse.json(
        { error: 'Barber is not currently accepting bookings' },
        { status: 400 }
      )
    }

    // Step 2: Validate that the date is in the future
    const appointmentDateTime = new Date(
      `${validatedData.appointment_date}T${validatedData.appointment_time}`
    )
    const now = new Date()

    if (appointmentDateTime <= now) {
      return NextResponse.json(
        { error: 'Appointment must be in the future' },
        { status: 400 }
      )
    }

    // Step 3: Check if slot is still available
    // Get existing bookings at this time
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('appointment_time, duration_minutes')
      .eq('barber_id', validatedData.barber_id)
      .eq('appointment_date', validatedData.appointment_date)
      .in('status', ['pending', 'confirmed'])

    // Check for time conflicts
    if (existingBookings) {
      const requestedStart = timeToMinutes(validatedData.appointment_time)
      const requestedEnd = requestedStart + barber.appointment_duration

      for (const booking of existingBookings) {
        const bookingStart = timeToMinutes(booking.appointment_time)
        const bookingEnd = bookingStart + booking.duration_minutes

        // Check if times overlap
        if (requestedStart < bookingEnd && requestedEnd > bookingStart) {
          return NextResponse.json(
            { error: 'This time slot is no longer available' },
            { status: 409 }
          )
        }
      }
    }

    // Step 4: Validate customer location for mobile barbers
    if (barber.location_type === 'mobile' && !validatedData.customer_location) {
      return NextResponse.json(
        { error: 'Customer location is required for mobile barbers' },
        { status: 400 }
      )
    }

    // Step 5: Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.id,
        barber_id: validatedData.barber_id,
        appointment_date: validatedData.appointment_date,
        appointment_time: validatedData.appointment_time,
        duration_minutes: barber.appointment_duration,
        price: barber.base_price,
        status: 'pending', // Requires barber confirmation
        customer_notes: validatedData.customer_notes || null,
        customer_location: validatedData.customer_location || null,
      })
      .select(`
        *,
        barber:barber_profiles!bookings_barber_id_fkey(
          id,
          user:users!barber_profiles_user_id_fkey(first_name, last_name, email)
        )
      `)
      .single()

    if (bookingError) throw bookingError

    return NextResponse.json({
      success: true,
      booking,
      message: 'Booking request submitted! Waiting for barber confirmation.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to convert time string to minutes
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
