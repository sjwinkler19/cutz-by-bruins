/**
 * BARBER REVIEWS API ROUTE
 *
 * GET /api/barbers/[id]/reviews - Get all reviews for a specific barber
 *
 * WHY: Display reviews on barber profile pages to help customers make decisions.
 *
 * Query parameters:
 * - limit: Number of reviews to return (default 20, max 100)
 * - offset: Pagination offset (default 0)
 * - min_rating: Filter by minimum rating (1-5)
 * - sort: Sort order ('newest', 'highest_rating', 'lowest_rating')
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: barberId } = await params
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const minRating = searchParams.get('min_rating')
    const sort = searchParams.get('sort') || 'newest' // Default sort by newest

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(barberId)) {
      return NextResponse.json(
        { error: 'Invalid barber ID format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify barber exists and is approved
    const { data: barber, error: barberError } = await supabase
      .from('barber_profiles')
      .select('id, status, rating_avg, review_count')
      .eq('id', barberId)
      .eq('status', 'approved')
      .single()

    if (barberError || !barber) {
      return NextResponse.json(
        { error: 'Barber not found or not approved' },
        { status: 404 }
      )
    }

    // Build query for reviews
    let query = supabase
      .from('reviews')
      .select(`
        *,
        customer:users!reviews_customer_id_fkey(first_name, last_name)
      `)
      .eq('barber_id', barberId)

    // Apply minimum rating filter if provided
    if (minRating) {
      const minRatingNum = parseInt(minRating)
      if (!isNaN(minRatingNum) && minRatingNum >= 1 && minRatingNum <= 5) {
        query = query.gte('rating', minRatingNum)
      }
    }

    // Apply sorting
    switch (sort) {
      case 'highest_rating':
        query = query.order('rating', { ascending: false })
        query = query.order('created_at', { ascending: false })
        break
      case 'lowest_rating':
        query = query.order('rating', { ascending: true })
        query = query.order('created_at', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data: reviews, error: reviewsError } = await query

    if (reviewsError) throw reviewsError

    // Calculate rating distribution
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('barber_id', barberId)

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    }

    if (allReviews) {
      allReviews.forEach((review) => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++
      })
    }

    return NextResponse.json({
      reviews,
      barber_summary: {
        rating_avg: barber.rating_avg,
        review_count: barber.review_count,
        rating_distribution: ratingDistribution,
      },
      pagination: {
        limit,
        offset,
        total: barber.review_count,
      },
    })
  } catch (error) {
    console.error('Get barber reviews error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
