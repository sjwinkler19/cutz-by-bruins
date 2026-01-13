/**
 * BARBER DETAIL API ROUTE
 *
 * GET /api/barbers/[id] - Get a specific barber's full profile
 *
 * WHY: Fetch complete barber profile for detail page display.
 *
 * Returns barber profile with:
 * - Basic profile information
 * - User information (name, email)
 * - Specialties
 * - Portfolio photos
 * - Availability schedule
 * - Reviews (handled by separate endpoint)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const barberId = params.id

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(barberId)) {
      return NextResponse.json(
        { error: 'Invalid barber ID format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch barber profile with all related data
    const { data: barber, error } = await supabase
      .from('barber_profiles')
      .select(`
        *,
        user:users!inner(first_name, last_name, email, phone),
        specialties:barber_specialties(id, specialty, created_at),
        portfolio_photos(id, photo_url, caption, order_index, created_at)
      `)
      .eq('id', barberId)
      .eq('status', 'approved') // Only show approved barbers
      .single()

    if (error) {
      // Barber not found or not approved
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Barber not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Fetch availability schedule
    const { data: schedule } = await supabase
      .from('availability_schedule')
      .select('*')
      .eq('barber_id', barberId)
      .order('day_of_week')
      .order('start_time')

    // Fetch availability exceptions (for next 90 days)
    const today = new Date().toISOString().split('T')[0]
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 90)
    const futureStr = futureDate.toISOString().split('T')[0]

    const { data: exceptions } = await supabase
      .from('availability_exceptions')
      .select('*')
      .eq('barber_id', barberId)
      .gte('date', today)
      .lte('date', futureStr)
      .order('date')

    // Sort portfolio photos by order_index
    if (barber.portfolio_photos) {
      barber.portfolio_photos.sort(
        (a: any, b: any) => a.order_index - b.order_index
      )
    }

    return NextResponse.json({
      barber: {
        ...barber,
        schedule: schedule || [],
        exceptions: exceptions || [],
      },
    })
  } catch (error) {
    console.error('Get barber detail error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch barber details' },
      { status: 500 }
    )
  }
}
