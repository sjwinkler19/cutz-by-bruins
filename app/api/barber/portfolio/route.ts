/**
 * PORTFOLIO PHOTOS API ROUTE
 *
 * POST /api/barber/portfolio - Add a portfolio photo
 * DELETE /api/barber/portfolio - Delete a portfolio photo
 * PUT /api/barber/portfolio - Update photo order/caption
 *
 * WHY: Barbers need to showcase their work to attract customers.
 *
 * Note: For MVP, this accepts photo URLs. In production, you'd integrate
 * Supabase Storage upload directly in the frontend.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/utils'
import { z } from 'zod'

// Validation schema for adding a photo
const addPhotoSchema = z.object({
  photo_url: z.string().url('Must be a valid URL'),
  caption: z.string().max(200, 'Caption too long').optional(),
  order_index: z.number().int().min(0).optional(),
})

// Validation schema for updating a photo
const updatePhotoSchema = z.object({
  id: z.string().uuid('Invalid photo ID'),
  caption: z.string().max(200, 'Caption too long').optional(),
  order_index: z.number().int().min(0).optional(),
})

// Validation schema for deleting a photo
const deletePhotoSchema = z.object({
  id: z.string().uuid('Invalid photo ID'),
})

/**
 * POST - Add a portfolio photo
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
    const validatedData = addPhotoSchema.parse(body)

    const supabase = await createClient()

    // Get barber profile
    const { data: profile, error: profileError } = await supabase
      .from('barber_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Barber profile not found. Create a profile first.' },
        { status: 404 }
      )
    }

    // If no order_index provided, append to end
    let orderIndex = validatedData.order_index
    if (orderIndex === undefined) {
      const { count } = await supabase
        .from('portfolio_photos')
        .select('*', { count: 'exact', head: true })
        .eq('barber_id', profile.id)

      orderIndex = count || 0
    }

    // Insert portfolio photo
    const { data: photo, error } = await supabase
      .from('portfolio_photos')
      .insert({
        barber_id: profile.id,
        photo_url: validatedData.photo_url,
        caption: validatedData.caption || null,
        order_index: orderIndex,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      photo,
      message: 'Photo added successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Add portfolio photo error:', error)
    return NextResponse.json(
      { error: 'Failed to add photo' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update portfolio photo (caption or order)
 */
export async function PUT(request: NextRequest) {
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
    const validatedData = updatePhotoSchema.parse(body)

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

    // Build update object
    const updateData: any = {}
    if (validatedData.caption !== undefined) {
      updateData.caption = validatedData.caption
    }
    if (validatedData.order_index !== undefined) {
      updateData.order_index = validatedData.order_index
    }

    // Update photo (ensure it belongs to this barber)
    const { data: photo, error } = await supabase
      .from('portfolio_photos')
      .update(updateData)
      .eq('id', validatedData.id)
      .eq('barber_id', profile.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Photo not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      photo,
      message: 'Photo updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Update portfolio photo error:', error)
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove a portfolio photo
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
    const validatedData = deletePhotoSchema.parse(body)

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

    // Delete photo (ensure it belongs to this barber)
    const { error } = await supabase
      .from('portfolio_photos')
      .delete()
      .eq('id', validatedData.id)
      .eq('barber_id', profile.id)

    if (error) {
      return NextResponse.json(
        { error: 'Photo not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Delete portfolio photo error:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
