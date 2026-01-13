/**
 * BARBERS LISTING API ROUTE
 *
 * GET /api/barbers - Get list of approved barbers with filters
 *
 * WHY: Public endpoint for browsing and searching barbers in the marketplace.
 *
 * Query parameters:
 * - specialty: Filter by specialty (e.g., 'fades', 'long_hair')
 * - location_type: Filter by 'fixed' or 'mobile'
 * - min_price: Minimum base price
 * - max_price: Maximum base price
 * - min_rating: Minimum average rating (0-5)
 * - sort: Sort order ('rating', 'price', 'newest')
 * - limit: Number of results (default 20, max 100)
 * - offset: Pagination offset (default 0)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const specialty = searchParams.get('specialty')
    const locationType = searchParams.get('location_type')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const minRating = searchParams.get('min_rating')
    const sort = searchParams.get('sort') || 'rating' // Default sort by rating
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    // Start building query
    // WHY: Select approved barbers with their user info and specialties
    let query = supabase
      .from('barber_profiles')
      .select(`
        *,
        user:users!inner(first_name, last_name, email),
        specialties:barber_specialties(specialty),
        portfolio_photos(photo_url, caption, order_index)
      `)
      .eq('status', 'approved') // Only show approved barbers

    // Apply filters

    // Filter by location type
    if (locationType === 'fixed' || locationType === 'mobile') {
      query = query.eq('location_type', locationType)
    }

    // Filter by price range
    if (minPrice) {
      const minPriceNum = parseFloat(minPrice)
      if (!isNaN(minPriceNum)) {
        query = query.gte('base_price', minPriceNum)
      }
    }
    if (maxPrice) {
      const maxPriceNum = parseFloat(maxPrice)
      if (!isNaN(maxPriceNum)) {
        query = query.lte('base_price', maxPriceNum)
      }
    }

    // Filter by minimum rating
    if (minRating) {
      const minRatingNum = parseFloat(minRating)
      if (!isNaN(minRatingNum)) {
        query = query.gte('rating_avg', minRatingNum)
      }
    }

    // Apply sorting
    switch (sort) {
      case 'price':
        query = query.order('base_price', { ascending: true })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'rating':
      default:
        // Sort by rating (high to low), then by review count
        query = query.order('rating_avg', { ascending: false })
        query = query.order('review_count', { ascending: false })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data: barbers, error } = await query

    if (error) throw error

    // Post-filter by specialty if specified
    // WHY: Specialty is in a related table, easier to filter after fetch for MVP
    let filteredBarbers = barbers
    if (specialty) {
      filteredBarbers = barbers.filter((barber: any) =>
        barber.specialties.some((s: any) => s.specialty === specialty)
      )
    }

    // Get total count for pagination
    // Note: This is a simplified count, in production you'd count with filters
    const { count } = await supabase
      .from('barber_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    return NextResponse.json({
      barbers: filteredBarbers,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Get barbers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch barbers' },
      { status: 500 }
    )
  }
}
