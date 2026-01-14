/**
 * AVAILABILITY SCHEDULE API ROUTE
 *
 * POST /api/barber/availability/schedule - Add a recurring availability slot
 * GET /api/barber/availability/schedule - Get barber's schedule
 * DELETE /api/barber/availability/schedule - Delete a schedule slot
 *
 * WHY: Barbers need to set their regular weekly availability for booking.
 *
 * Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/utils'
import { z } from 'zod'
import { timeSchema } from '@/lib/validations/common'
import { validationErrorResponse } from '@/lib/api/errors'

// Validation schema for adding schedule
const addScheduleSchema = z.object({
  day_of_week: z.number().int().min(0).max(6, 'Day must be 0-6 (Sun-Sat)'),
  start_time: timeSchema,
  end_time: timeSchema,
}).refine(
  (data) => data.start_time < data.end_time,
  {
    message: 'Start time must be before end time',
    path: ['start_time'],
  }
)

// Validation schema for deleting schedule
const deleteScheduleSchema = z.object({
  id: z.string().uuid('Invalid schedule ID'),
})

/**
 * GET - Fetch barber's availability schedule
 */
export async function GET(request: NextRequest) {
  try {
    // Get barber_id from query params (for public viewing)
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get('barber_id')

    const supabase = await createClient()

    if (barberId) {
      // Public view - fetch any barber's schedule
      const { data: schedule, error } = await supabase
        .from('availability_schedule')
        .select('*')
        .eq('barber_id', barberId)
        .order('day_of_week')
        .order('start_time')

      if (error) throw error

      return NextResponse.json({ schedule })
    } else {
      // Private view - fetch current user's schedule
      const user = await getCurrentUser()
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Get barber profile
      const { data: profile } = await supabase
        .from('barber_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profile) {
        return NextResponse.json(
          { error: 'Barber profile not found' },
          { status: 404 }
        )
      }

      const { data: schedule, error } = await supabase
        .from('availability_schedule')
        .select('*')
        .eq('barber_id', profile.id)
        .order('day_of_week')
        .order('start_time')

      if (error) throw error

      return NextResponse.json({ schedule })
    }
  } catch (error) {
    console.error('Get schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}

/**
 * POST - Add a recurring availability slot
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
    const validatedData = addScheduleSchema.parse(body)

    const supabase = await createClient()

    // Get barber profile
    const { data: profile } = await supabase
      .from('barber_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Barber profile not found. Create a profile first.' },
        { status: 404 }
      )
    }

    // Insert availability slot
    const { data: slot, error } = await supabase
      .from('availability_schedule')
      .insert({
        barber_id: profile.id,
        day_of_week: validatedData.day_of_week,
        start_time: validatedData.start_time,
        end_time: validatedData.end_time,
        is_recurring: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      slot,
      message: 'Availability slot added successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error)
    }

    console.error('Add schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to add availability slot' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove an availability slot
 */
export async function DELETE(request: NextRequest) {
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
    const validatedData = deleteScheduleSchema.parse(body)

    const supabase = await createClient()

    // Get barber profile
    const { data: profile } = await supabase
      .from('barber_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Barber profile not found' },
        { status: 404 }
      )
    }

    // Delete slot (ensure it belongs to this barber)
    const { error } = await supabase
      .from('availability_schedule')
      .delete()
      .eq('id', validatedData.id)
      .eq('barber_id', profile.id)

    if (error) {
      return NextResponse.json(
        { error: 'Slot not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Availability slot deleted successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error)
    }

    console.error('Delete schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to delete availability slot' },
      { status: 500 }
    )
  }
}
