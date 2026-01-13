/**
 * REGISTRATION API ROUTE
 *
 * POST /api/auth/register
 *
 * Creates a new user account in both Supabase Auth and our users table.
 * WHY: We need a custom registration flow to store additional user data.
 *
 * Request body: { email, password, first_name, last_name, phone? }
 * Response: { success: true, user } or { error: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registerSchema } from '@/lib/validations/auth'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Get Supabase client
    const supabase = await createClient()

    // Step 1: Create auth user in Supabase Auth
    // WHY: Supabase Auth handles password hashing and security
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        // Email confirmation required
        // WHY: Verify it's a real email before allowing bookings
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Step 2: Create user profile in our users table
    // WHY: Store additional info like name and phone
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        auth_id: authData.user.id,
        email: validatedData.email,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        phone: validatedData.phone || null,
        role: 'customer', // Default role
        ucla_verified: false, // Will verify later for barbers
      })
      .select()
      .single()

    if (userError) {
      // If user creation fails, clean up auth user
      // WHY: Prevent orphaned auth records
      await supabase.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'Registration successful! Please check your email to verify your account.',
    })
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
