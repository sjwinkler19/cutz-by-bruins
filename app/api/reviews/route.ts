/**
 * REVIEWS API ROUTE
 *
 * POST /api/reviews - Submit a review for a completed booking
 *
 * WHY: Allow customers to review barbers after appointments.
 * Reviews help build trust and help customers choose barbers.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/utils'
import { submitReviewSchema } from '@/lib/validations/review'
import { z } from 'zod'

/**
 * POST - Submit a review for a booking
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
    const validatedData = submitReviewSchema.parse(body)

    const supabase = await createClient()

    // Step 1: Verify booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, customer_id, barber_id, status')
      .eq('id', validatedData.booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Step 2: Verify user is the customer of this booking
    if (booking.customer_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only review your own bookings' },
        { status: 403 }
      )
    }

    // Step 3: Verify booking is completed
    // WHY: Can only review after service is rendered
    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed bookings' },
        { status: 400 }
      )
    }

    // Step 4: Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', validatedData.booking_id)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this booking' },
        { status: 409 }
      )
    }

    // Step 5: Create the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        booking_id: validatedData.booking_id,
        customer_id: user.id,
        barber_id: booking.barber_id,
        rating: validatedData.rating,
        review_text: validatedData.review_text || null,
        photo_url: validatedData.photo_url || null,
        tags: validatedData.tags || null,
      })
      .select(`
        *,
        customer:users!reviews_customer_id_fkey(first_name, last_name),
        barber:barber_profiles!reviews_barber_id_fkey(
          id,
          user:users!barber_profiles_user_id_fkey(first_name, last_name)
        )
      `)
      .single()

    if (reviewError) throw reviewError

    // Note: Barber rating_avg and review_count are automatically updated
    // by the database trigger we created in the initial schema

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully! Thank you for your feedback.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Submit review error:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
