/**
 * BARBER PROFILE API ROUTE
 *
 * POST /api/barber/profile - Create or update barber profile
 * GET /api/barber/profile - Get current user's barber profile
 *
 * WHY: Centralized endpoint for barber profile management.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/utils'
import { barberProfileSchema } from '@/lib/validations/barber'
import { z } from 'zod'

/**
 * GET - Fetch current user's barber profile
 */
export async function GET() {
  try {
    // Ensure user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Fetch barber profile with related data
    const { data: profile, error } = await supabase
      .from('barber_profiles')
      .select(`
        *,
        specialties:barber_specialties(*),
        portfolio_photos(*)
      `)
      .eq('user_id', user.id)
      .single()

    if (error) {
      // Profile doesn't exist yet
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create or update barber profile
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
    const validatedData = barberProfileSchema.parse(body)

    const supabase = await createClient()

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('barber_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // Prepare profile data (without specialties)
    const { specialties, ...profileData } = validatedData

    let profile

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('barber_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      profile = data
    } else {
      // Create new profile
      // WHY: First time barber setup
      const { data, error } = await supabase
        .from('barber_profiles')
        .insert({
          user_id: user.id,
          ...profileData,
          status: 'pending', // Requires manual approval
        })
        .select()
        .single()

      if (error) throw error
      profile = data

      // Update user role to barber
      // WHY: User is now a barber, not just a customer
      await supabase
        .from('users')
        .update({ role: 'barber' })
        .eq('id', user.id)
    }

    // Update specialties
    // Step 1: Delete existing specialties
    await supabase
      .from('barber_specialties')
      .delete()
      .eq('barber_id', profile.id)

    // Step 2: Insert new specialties
    if (specialties.length > 0) {
      const specialtyRecords = specialties.map((specialty) => ({
        barber_id: profile.id,
        specialty,
      }))

      const { error: specialtiesError } = await supabase
        .from('barber_specialties')
        .insert(specialtyRecords)

      if (specialtiesError) throw specialtiesError
    }

    // Fetch complete profile with specialties
    const { data: completeProfile } = await supabase
      .from('barber_profiles')
      .select(`
        *,
        specialties:barber_specialties(*),
        portfolio_photos(*)
      `)
      .eq('id', profile.id)
      .single()

    return NextResponse.json({
      success: true,
      profile: completeProfile,
      message: existingProfile
        ? 'Profile updated successfully'
        : 'Profile created successfully! Awaiting approval.',
    })
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Profile creation error:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
}
