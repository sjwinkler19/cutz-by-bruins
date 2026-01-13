/**
 * AVAILABILITY EXCEPTIONS API ROUTE
 *
 * POST /api/barber/availability/exceptions - Add an availability exception
 * GET /api/barber/availability/exceptions - Get barber's exceptions
 * DELETE /api/barber/availability/exceptions - Delete an exception
 *
 * WHY: Barbers need to block out specific dates (finals week) or add
 * special availability outside their normal schedule.
 *
 * Exception types:
 * - is_available = false: Block out a date (no availability)
 * - is_available = true: Add special availability with times
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/utils'
import { z } from 'zod'

// Validation schema for adding exception
const addExceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  is_available: z.boolean(),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
}).refine(
  (data) => {
    // If available, must have times
    if (data.is_available) {
      return data.start_time && data.end_time
    }
    return true
  },
  {
    message: 'Start and end times required when adding availability',
    path: ['start_time'],
  }
).refine(
  (data) => {
    // If available, start must be before end
    if (data.is_available && data.start_time && data.end_time) {
      return data.start_time < data.end_time
    }
    return true
  },
  {
    message: 'Start time must be before end time',
    path: ['start_time'],
  }
)

// Validation schema for deleting exception
const deleteExceptionSchema = z.object({
  id: z.string().uuid('Invalid exception ID'),
})

/**
 * GET - Fetch barber's availability exceptions
 */
export async function GET(request: NextRequest) {
  try {
    // Get barber_id from query params (for public viewing)
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get('barber_id')

    const supabase = await createClient()

    if (barberId) {
      // Public view - fetch any barber's exceptions
      const { data: exceptions, error } = await supabase
        .from('availability_exceptions')
        .select('*')
        .eq('barber_id', barberId)
        .order('date')

      if (error) throw error

      return NextResponse.json({ exceptions })
    } else {
      // Private view - fetch current user's exceptions
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

      const { data: exceptions, error } = await supabase
        .from('availability_exceptions')
        .select('*')
        .eq('barber_id', profile.id)
        .order('date')

      if (error) throw error

      return NextResponse.json({ exceptions })
    }
  } catch (error) {
    console.error('Get exceptions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exceptions' },
      { status: 500 }
    )
  }
}

/**
 * POST - Add an availability exception
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
    const validatedData = addExceptionSchema.parse(body)

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

    // Insert exception
    const { data: exception, error } = await supabase
      .from('availability_exceptions')
      .insert({
        barber_id: profile.id,
        date: validatedData.date,
        is_available: validatedData.is_available,
        start_time: validatedData.start_time || null,
        end_time: validatedData.end_time || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      exception,
      message: validatedData.is_available
        ? 'Special availability added successfully'
        : 'Date blocked successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Add exception error:', error)
    return NextResponse.json(
      { error: 'Failed to add exception' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove an availability exception
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
    const validatedData = deleteExceptionSchema.parse(body)

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

    // Delete exception (ensure it belongs to this barber)
    const { error } = await supabase
      .from('availability_exceptions')
      .delete()
      .eq('id', validatedData.id)
      .eq('barber_id', profile.id)

    if (error) {
      return NextResponse.json(
        { error: 'Exception not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Exception deleted successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Delete exception error:', error)
    return NextResponse.json(
      { error: 'Failed to delete exception' },
      { status: 500 }
    )
  }
}
