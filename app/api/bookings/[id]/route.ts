/**
 * BOOKING DETAIL API ROUTE
 *
 * GET /api/bookings/[id] - Get specific booking details
 * PATCH /api/bookings/[id] - Update booking status (confirm, decline, cancel, complete)
 *
 * WHY: Manage individual booking lifecycle (confirmation, cancellation, completion).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/utils'
import { updateBookingStatusSchema } from '@/lib/validations/booking'
import { z } from 'zod'

/**
 * GET - Fetch specific booking details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params

    // Ensure user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Fetch booking with full details
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:users!bookings_customer_id_fkey(first_name, last_name, email, phone),
        barber:barber_profiles!bookings_barber_id_fkey(
          id,
          base_price,
          location_type,
          location_area,
          exact_address,
          venmo_handle,
          zelle_handle,
          user:users!barber_profiles_user_id_fkey(first_name, last_name, email, phone)
        )
      `)
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check authorization - user must be customer or barber
    const { data: barberProfile } = await supabase
      .from('barber_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const isCustomer = booking.customer_id === user.id
    const isBarber = barberProfile && booking.barber_id === barberProfile.id

    if (!isCustomer && !isBarber) {
      return NextResponse.json(
        { error: 'Unauthorized to view this booking' },
        { status: 403 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update booking status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params

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
    const validatedData = updateBookingStatusSchema.parse(body)

    const supabase = await createClient()

    // Fetch existing booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, customer_id, barber_id, status')
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check authorization and validate status transitions
    const { data: barberProfile } = await supabase
      .from('barber_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const isCustomer = booking.customer_id === user.id
    const isBarber = barberProfile && booking.barber_id === barberProfile.id

    if (!isCustomer && !isBarber) {
      return NextResponse.json(
        { error: 'Unauthorized to update this booking' },
        { status: 403 }
      )
    }

    // Validate status transitions based on role
    const newStatus = validatedData.status

    if (newStatus === 'confirmed') {
      // Only barbers can confirm
      if (!isBarber) {
        return NextResponse.json(
          { error: 'Only the barber can confirm bookings' },
          { status: 403 }
        )
      }
      // Can only confirm pending bookings
      if (booking.status !== 'pending') {
        return NextResponse.json(
          { error: 'Can only confirm pending bookings' },
          { status: 400 }
        )
      }
    }

    if (newStatus === 'completed') {
      // Only barbers can mark as completed
      if (!isBarber) {
        return NextResponse.json(
          { error: 'Only the barber can mark bookings as completed' },
          { status: 403 }
        )
      }
      // Can only complete confirmed bookings
      if (booking.status !== 'confirmed') {
        return NextResponse.json(
          { error: 'Can only complete confirmed bookings' },
          { status: 400 }
        )
      }
    }

    if (newStatus === 'no_show') {
      // Only barbers can mark as no-show
      if (!isBarber) {
        return NextResponse.json(
          { error: 'Only the barber can mark bookings as no-show' },
          { status: 403 }
        )
      }
    }

    if (newStatus === 'cancelled') {
      // Both parties can cancel, but must specify who
      if (!validatedData.cancelled_by) {
        return NextResponse.json(
          { error: 'Must specify who cancelled the booking' },
          { status: 400 }
        )
      }

      // Validate cancelled_by matches the user's role
      if (validatedData.cancelled_by === 'customer' && !isCustomer) {
        return NextResponse.json(
          { error: 'Cannot cancel on behalf of customer' },
          { status: 403 }
        )
      }
      if (validatedData.cancelled_by === 'barber' && !isBarber) {
        return NextResponse.json(
          { error: 'Cannot cancel on behalf of barber' },
          { status: 403 }
        )
      }

      // Cannot cancel already completed bookings
      if (booking.status === 'completed') {
        return NextResponse.json(
          { error: 'Cannot cancel completed bookings' },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (newStatus === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
    }

    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    if (newStatus === 'cancelled') {
      updateData.cancelled_by = validatedData.cancelled_by
      updateData.cancellation_reason = validatedData.cancellation_reason || null
    }

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select(`
        *,
        customer:users!bookings_customer_id_fkey(first_name, last_name, email),
        barber:barber_profiles!bookings_barber_id_fkey(
          id,
          user:users!barber_profiles_user_id_fkey(first_name, last_name, email)
        )
      `)
      .single()

    if (updateError) throw updateError

    // Get status message
    let message = ''
    switch (newStatus) {
      case 'confirmed':
        message = 'Booking confirmed successfully'
        break
      case 'completed':
        message = 'Booking marked as completed'
        break
      case 'cancelled':
        message = 'Booking cancelled successfully'
        break
      case 'no_show':
        message = 'Booking marked as no-show'
        break
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}
