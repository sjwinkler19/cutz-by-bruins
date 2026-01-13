# UCLA Student Barber Marketplace - MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a functional two-sided marketplace connecting UCLA student barbers with customers seeking affordable haircuts, with booking system and reviews.

**Architecture:** Next.js 14 App Router with Server Components for data fetching, Supabase for database/auth/storage, API routes for mutations. Follow beginner-friendly commenting standards (CODE_STYLE.md) throughout.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (Postgres + Auth + Storage), Resend (email), shadcn/ui, React Hook Form, Zod

---

## Phase 0: Project Setup & Foundation

### Task 0.1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `.env.local`
- Create: `.gitignore`

**Step 1: Initialize Next.js with TypeScript and Tailwind**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Expected: Project scaffolding created with app router structure

**Step 2: Install required dependencies**

Run:
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form zod @hookform/resolvers
npm install date-fns
npm install resend
npm install -D @types/node
```

Expected: All dependencies installed successfully

**Step 3: Set up environment variables template**

Create `.env.local`:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Create `.env.example`:
```bash
# Copy this to .env.local and fill in your values
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 4: Update .gitignore**

Add to `.gitignore`:
```
# Environment variables
.env.local
.env

# Supabase
.supabase/
```

**Step 5: Commit initial setup**

Run:
```bash
git init
git add .
git commit -m "chore: initialize Next.js project with TypeScript and Tailwind"
```

Expected: Initial commit created

---

### Task 0.2: Set Up Supabase Client

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`

**Step 1: Create browser Supabase client**

Create `lib/supabase/client.ts`:
```typescript
/**
 * SUPABASE CLIENT - Browser Side
 *
 * This file creates a Supabase client for use in browser/client components.
 * WHY: We need different clients for browser vs server due to how cookies are handled.
 *
 * Used by: Client components that need to interact with Supabase
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for browser-side operations
 *
 * @returns Supabase client instance configured for browser use
 *
 * @example
 * const supabase = createClient()
 * const { data } = await supabase.from('barber_profiles').select('*')
 */
export function createClient() {
  // Get environment variables for Supabase connection
  // NEXT_PUBLIC_ prefix makes these available in the browser
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Create and return browser client
  // This handles authentication cookies automatically
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
```

**Step 2: Create server Supabase client**

Create `lib/supabase/server.ts`:
```typescript
/**
 * SUPABASE CLIENT - Server Side
 *
 * This file creates a Supabase client for use in Server Components and API routes.
 * WHY: Server-side code needs special cookie handling that differs from browser.
 *
 * Used by: Server Components, API routes, Server Actions
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for server-side operations
 *
 * @returns Supabase client instance configured for server use with cookie support
 *
 * @example
 * const supabase = createClient()
 * const { data } = await supabase.from('users').select('*')
 */
export async function createClient() {
  // Get the Next.js cookies store
  // WHY: We need to read/write auth cookies for session management
  const cookieStore = await cookies()

  // Create server client with cookie handlers
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // How to read a cookie
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // How to set a cookie
        // WHY: Supabase auth needs to store session tokens in cookies
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Can fail in Server Components (read-only)
            // That's okay - will work in API routes/Server Actions
          }
        },
        // How to delete a cookie (for logout)
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Can fail in Server Components
          }
        },
      },
    }
  )
}
```

**Step 3: Create middleware for auth**

Create `lib/supabase/middleware.ts`:
```typescript
/**
 * SUPABASE MIDDLEWARE
 *
 * This middleware refreshes Supabase auth tokens on every request.
 * WHY: Keeps users logged in automatically without manual token refresh.
 *
 * Used by: Next.js middleware (middleware.ts at root level)
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Updates the Supabase session on each request
 *
 * @param request - The incoming Next.js request
 * @returns Modified response with updated auth cookies
 *
 * WHY: Auth tokens expire, this keeps them fresh automatically
 */
export async function updateSession(request: NextRequest) {
  // Create a response we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client with request/response cookie handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on both request and response
          // WHY: Request for current route, response for next route
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh the session (this is the important part!)
  // WHY: Extends the user's session automatically
  await supabase.auth.getUser()

  return response
}
```

**Step 4: Create root middleware file**

Create `middleware.ts` at project root:
```typescript
/**
 * NEXT.JS MIDDLEWARE
 *
 * Runs on every request before the route handler.
 * WHY: We use this to keep Supabase auth sessions fresh.
 *
 * This runs automatically - you don't need to import it anywhere.
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Middleware function that runs on every request
 * Currently only handles Supabase session refresh
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

/**
 * Configure which routes this middleware runs on
 *
 * WHY: We want it on all routes except static files and images
 * This prevents unnecessary processing for assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 5: Commit Supabase setup**

Run:
```bash
git add lib/supabase/ middleware.ts
git commit -m "feat: add Supabase client configuration for browser and server"
```

Expected: Supabase clients configured and committed

---

### Task 0.3: Set Up Database Schema in Supabase

**Files:**
- Create: `supabase/migrations/20260112_initial_schema.sql`

**Step 1: Create Supabase project**

Manual action required:
1. Go to https://supabase.com
2. Create new project
3. Copy the project URL and anon key to `.env.local`
4. Wait for project to be ready (~2 minutes)

**Step 2: Create database schema SQL**

Create `supabase/migrations/20260112_initial_schema.sql`:
```sql
-- INITIAL DATABASE SCHEMA FOR UCLA BARBER MARKETPLACE
-- This file creates all tables, indexes, and Row Level Security policies
-- WHY: We need a structured database to store users, barbers, bookings, and reviews

-- ============================================================================
-- ENUMS (Custom Types)
-- WHY: Enums enforce valid values and make code more readable
-- ============================================================================

-- User roles in the system
CREATE TYPE user_role AS ENUM ('customer', 'barber', 'admin');

-- Barber profile approval status
CREATE TYPE barber_status AS ENUM ('pending', 'approved', 'suspended');

-- Where the barber provides service
CREATE TYPE location_type AS ENUM ('fixed', 'mobile');

-- Booking lifecycle states
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');

-- Who cancelled a booking (if applicable)
CREATE TYPE cancelled_by_type AS ENUM ('customer', 'barber');

-- Barber specialties
CREATE TYPE specialty_type AS ENUM (
  'fades',
  'long_hair',
  'womens_cuts',
  'beard_trim',
  'designs',
  'black_hair',
  'asian_hair',
  'curly_hair',
  'buzz_cuts'
);

-- ============================================================================
-- USERS TABLE
-- Stores basic user information (both customers and barbers)
-- WHY: Central place for authentication and user data
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- auth.users id from Supabase Auth (links to authentication)
  auth_id UUID UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  -- Only barbers need UCLA verification
  ucla_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by auth_id (used frequently)
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- Index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- BARBER PROFILES TABLE
-- Extended profile information for barbers only
-- WHY: Barbers need additional fields that customers don't have
-- ============================================================================

CREATE TABLE barber_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT CHECK (char_length(bio) BETWEEN 50 AND 150),
  profile_photo_url TEXT,
  years_experience INTEGER CHECK (years_experience >= 0),
  base_price DECIMAL(10, 2) CHECK (base_price BETWEEN 10 AND 30),
  location_type location_type NOT NULL,
  -- General area shown publicly (e.g., "Westwood Village")
  location_area TEXT,
  -- Exact address only shared after booking confirmed
  exact_address TEXT,
  -- Service radius in miles (for mobile barbers only)
  service_radius_miles INTEGER CHECK (service_radius_miles >= 0),
  -- Payment handles (off-platform for MVP)
  venmo_handle TEXT,
  zelle_handle TEXT,
  instagram_handle TEXT,
  -- Appointment duration in minutes (30, 45, or 60)
  appointment_duration INTEGER DEFAULT 45 CHECK (appointment_duration IN (30, 45, 60)),
  -- Approval status (manual approval required)
  status barber_status DEFAULT 'pending',
  -- Calculated fields (updated by triggers)
  rating_avg DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating_avg BETWEEN 0 AND 5),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One profile per user
  UNIQUE(user_id)
);

-- Index for finding barbers by status
CREATE INDEX idx_barber_profiles_status ON barber_profiles(status);

-- Index for sorting by rating
CREATE INDEX idx_barber_profiles_rating ON barber_profiles(rating_avg DESC);

-- ============================================================================
-- BARBER SPECIALTIES TABLE (Many-to-Many)
-- Links barbers to their specialties
-- WHY: Barbers can have multiple specialties, used for filtering
-- ============================================================================

CREATE TABLE barber_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
  specialty specialty_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent duplicate specialties for same barber
  UNIQUE(barber_id, specialty)
);

-- Index for filtering by specialty
CREATE INDEX idx_barber_specialties_specialty ON barber_specialties(specialty);

-- ============================================================================
-- PORTFOLIO PHOTOS TABLE
-- Stores barber portfolio images
-- WHY: Barbers need to showcase their work to attract customers
-- ============================================================================

CREATE TABLE portfolio_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
  -- URL to photo in Supabase Storage
  photo_url TEXT NOT NULL,
  caption TEXT,
  -- Order for display (0 = first photo shown)
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching photos in order for a barber
CREATE INDEX idx_portfolio_photos_barber ON portfolio_photos(barber_id, order_index);

-- ============================================================================
-- AVAILABILITY SCHEDULE TABLE
-- Stores recurring weekly availability
-- WHY: Barbers set when they're generally available each week
-- ============================================================================

CREATE TABLE availability_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
  -- Day of week (0 = Sunday, 6 = Saturday)
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure start is before end
  CHECK (start_time < end_time)
);

-- Index for fetching a barber's schedule
CREATE INDEX idx_availability_schedule_barber ON availability_schedule(barber_id, day_of_week);

-- ============================================================================
-- AVAILABILITY EXCEPTIONS TABLE
-- One-off availability changes (block outs or special availability)
-- WHY: Barbers need to block finals week or add one-time availability
-- ============================================================================

CREATE TABLE availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  -- FALSE = blocked out, TRUE = special availability outside normal schedule
  is_available BOOLEAN NOT NULL,
  -- Only used if is_available = TRUE
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    -- If available, must have times. If blocked, no times needed.
    (is_available = TRUE AND start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
    OR (is_available = FALSE AND start_time IS NULL AND end_time IS NULL)
  )
);

-- Index for finding exceptions by barber and date
CREATE INDEX idx_availability_exceptions_barber_date ON availability_exceptions(barber_id, date);

-- ============================================================================
-- BOOKINGS TABLE
-- Stores all appointment bookings
-- WHY: Core of the marketplace - tracks customer-barber appointments
-- ============================================================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status booking_status DEFAULT 'pending',
  -- Customer's notes about what they want
  customer_notes TEXT,
  -- Customer's location (for mobile barbers)
  customer_location TEXT,
  price DECIMAL(10, 2) NOT NULL,
  -- Cancellation info
  cancellation_reason TEXT,
  cancelled_by cancelled_by_type,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Index for finding bookings by customer
CREATE INDEX idx_bookings_customer ON bookings(customer_id, appointment_date DESC);

-- Index for finding bookings by barber
CREATE INDEX idx_bookings_barber ON bookings(barber_id, appointment_date DESC);

-- Index for finding bookings by date (for slot availability)
CREATE INDEX idx_bookings_barber_date ON bookings(barber_id, appointment_date, appointment_time);

-- Index for finding bookings by status
CREATE INDEX idx_bookings_status ON bookings(status);

-- ============================================================================
-- REVIEWS TABLE
-- Customer reviews of barbers
-- WHY: Build trust through social proof and help customers choose barbers
-- ============================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT CHECK (char_length(review_text) <= 500),
  -- Optional before/after photo
  photo_url TEXT,
  -- Tags like "Great fade", "On time", etc. (stored as array)
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One review per booking
  UNIQUE(booking_id)
);

-- Index for fetching barber's reviews
CREATE INDEX idx_reviews_barber ON reviews(barber_id, created_at DESC);

-- ============================================================================
-- CUSTOMER RATINGS TABLE (Internal)
-- Barbers rate customers (not shown publicly)
-- WHY: Help identify problematic customers (no-shows, etc.)
-- ============================================================================

CREATE TABLE customer_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  -- Private notes (not shown to customer)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One rating per booking
  UNIQUE(booking_id)
);

-- Index for finding customer's ratings
CREATE INDEX idx_customer_ratings_customer ON customer_ratings(customer_id);

-- ============================================================================
-- TRIGGERS
-- Automatic updates for timestamps and calculated fields
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barber_profiles_updated_at BEFORE UPDATE ON barber_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update barber rating when review added/updated/deleted
CREATE OR REPLACE FUNCTION update_barber_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate average rating and count for the barber
  UPDATE barber_profiles
  SET
    rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE barber_id = COALESCE(NEW.barber_id, OLD.barber_id)),
    review_count = (SELECT COUNT(*) FROM reviews WHERE barber_id = COALESCE(NEW.barber_id, OLD.barber_id))
  WHERE id = COALESCE(NEW.barber_id, OLD.barber_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply to reviews table
CREATE TRIGGER update_barber_rating_on_review_insert AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_barber_rating();

CREATE TRIGGER update_barber_rating_on_review_update AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_barber_rating();

CREATE TRIGGER update_barber_rating_on_review_delete AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_barber_rating();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Controls who can read/write each row
-- WHY: Security - users should only access their own data
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_ratings ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES
-- Anyone can read user info (needed for profiles)
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
-- Users can update their own info
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);

-- BARBER PROFILES POLICIES
-- Anyone can read approved barber profiles (public marketplace)
CREATE POLICY "Approved barber profiles are viewable by everyone" ON barber_profiles
  FOR SELECT USING (status = 'approved' OR user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
-- Barbers can insert their own profile
CREATE POLICY "Users can create own barber profile" ON barber_profiles
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
-- Barbers can update their own profile
CREATE POLICY "Barbers can update own profile" ON barber_profiles
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- BARBER SPECIALTIES POLICIES
-- Anyone can read specialties (needed for filtering)
CREATE POLICY "Specialties are viewable by everyone" ON barber_specialties FOR SELECT USING (true);
-- Barbers can manage their own specialties
CREATE POLICY "Barbers can manage own specialties" ON barber_specialties
  FOR ALL USING (barber_id IN (SELECT id FROM barber_profiles WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

-- PORTFOLIO PHOTOS POLICIES
-- Anyone can read photos (public portfolio)
CREATE POLICY "Portfolio photos are viewable by everyone" ON portfolio_photos FOR SELECT USING (true);
-- Barbers can manage their own photos
CREATE POLICY "Barbers can manage own portfolio" ON portfolio_photos
  FOR ALL USING (barber_id IN (SELECT id FROM barber_profiles WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

-- AVAILABILITY SCHEDULE POLICIES
-- Anyone can read schedules (needed for booking)
CREATE POLICY "Schedules are viewable by everyone" ON availability_schedule FOR SELECT USING (true);
-- Barbers can manage their own schedule
CREATE POLICY "Barbers can manage own schedule" ON availability_schedule
  FOR ALL USING (barber_id IN (SELECT id FROM barber_profiles WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

-- AVAILABILITY EXCEPTIONS POLICIES
-- Anyone can read exceptions (needed for booking)
CREATE POLICY "Exceptions are viewable by everyone" ON availability_exceptions FOR SELECT USING (true);
-- Barbers can manage their own exceptions
CREATE POLICY "Barbers can manage own exceptions" ON availability_exceptions
  FOR ALL USING (barber_id IN (SELECT id FROM barber_profiles WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

-- BOOKINGS POLICIES
-- Users can read their own bookings (as customer or barber)
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (
    customer_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR barber_id IN (SELECT id FROM barber_profiles WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  );
-- Customers can create bookings
CREATE POLICY "Customers can create bookings" ON bookings
  FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
-- Both parties can update bookings (for status changes)
CREATE POLICY "Participants can update bookings" ON bookings
  FOR UPDATE USING (
    customer_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR barber_id IN (SELECT id FROM barber_profiles WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  );

-- REVIEWS POLICIES
-- Anyone can read reviews (public)
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
-- Customers can create reviews for their bookings
CREATE POLICY "Customers can create reviews" ON reviews
  FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- CUSTOMER RATINGS POLICIES (Internal only)
-- Only barbers can read/write customer ratings
CREATE POLICY "Barbers can view customer ratings" ON customer_ratings
  FOR SELECT USING (barber_id IN (SELECT id FROM barber_profiles WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));
CREATE POLICY "Barbers can create customer ratings" ON customer_ratings
  FOR INSERT WITH CHECK (barber_id IN (SELECT id FROM barber_profiles WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));
```

**Step 3: Apply migration to Supabase**

Manual action required:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `supabase/migrations/20260112_initial_schema.sql`
4. Paste into SQL Editor and run
5. Verify all tables created successfully in Table Editor

**Step 4: Commit database schema**

Run:
```bash
git add supabase/
git commit -m "feat: add initial database schema with RLS policies"
```

Expected: Database schema committed

---

## Phase 1: Authentication System

### Task 1.1: Create Auth Utilities

**Files:**
- Create: `lib/auth/utils.ts`
- Create: `lib/auth/types.ts`

**Step 1: Create auth types**

Create `lib/auth/types.ts`:
```typescript
/**
 * AUTHENTICATION TYPES
 *
 * TypeScript types for authentication and user data.
 * WHY: Type safety helps catch errors at compile time.
 */

/**
 * User role in the system
 * - customer: Can book appointments
 * - barber: Can receive bookings and manage profile
 * - admin: Platform administrator (future use)
 */
export type UserRole = 'customer' | 'barber' | 'admin'

/**
 * Complete user profile data from database
 * Matches the 'users' table schema
 */
export interface User {
  id: string
  auth_id: string
  email: string
  phone: string | null
  first_name: string
  last_name: string
  role: UserRole
  ucla_verified: boolean
  created_at: string
  updated_at: string
}

/**
 * Registration form data for new users
 */
export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
}

/**
 * Login form data
 */
export interface LoginData {
  email: string
  password: string
}
```

**Step 2: Create auth utility functions**

Create `lib/auth/utils.ts`:
```typescript
/**
 * AUTHENTICATION UTILITIES
 *
 * Helper functions for user authentication and session management.
 * WHY: Centralize auth logic to avoid duplication across the app.
 *
 * Used by: API routes, Server Components, middleware
 */

import { createClient } from '@/lib/supabase/server'
import { User } from './types'

/**
 * Gets the currently logged-in user from the session
 *
 * @returns User object if logged in, null if not
 *
 * @example
 * const user = await getCurrentUser()
 * if (!user) {
 *   redirect('/login')
 * }
 */
export async function getCurrentUser(): Promise<User | null> {
  // Get server Supabase client
  const supabase = await createClient()

  // Get the authenticated user from Supabase Auth
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // If not authenticated, return null
  if (!authUser) {
    return null
  }

  // Fetch full user profile from our users table
  // WHY: Supabase Auth only stores email/id, we need role, name, etc.
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authUser.id)
    .single()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Checks if the current user is authenticated
 *
 * @returns true if user is logged in, false otherwise
 *
 * @example
 * const isAuthenticated = await isLoggedIn()
 */
export async function isLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Checks if the current user is a barber
 *
 * @returns true if user is a barber, false otherwise
 *
 * @example
 * const canAccessBarberDashboard = await isBarber()
 */
export async function isBarber(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'barber'
}

/**
 * Requires user to be authenticated, redirects to login if not
 *
 * @returns User object
 * @throws Redirects to /login if not authenticated
 *
 * @example
 * const user = await requireAuth()
 * // User is guaranteed to be logged in here
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    // Redirect to login page
    // WHY: Using Next.js redirect() to handle navigation
    const { redirect } = await import('next/navigation')
    redirect('/login')
  }

  return user
}

/**
 * Requires user to be a barber, redirects if not
 *
 * @returns User object (guaranteed to be a barber)
 * @throws Redirects to /dashboard if not a barber
 *
 * @example
 * const barber = await requireBarber()
 * // User is guaranteed to be a barber here
 */
export async function requireBarber(): Promise<User> {
  const user = await requireAuth()

  if (user.role !== 'barber') {
    const { redirect } = await import('next/navigation')
    redirect('/dashboard')
  }

  return user
}
```

**Step 3: Commit auth utilities**

Run:
```bash
git add lib/auth/
git commit -m "feat: add authentication utilities and types"
```

Expected: Auth utilities committed

---

### Task 1.2: Build Registration API

**Files:**
- Create: `app/api/auth/register/route.ts`
- Create: `lib/validations/auth.ts`

**Step 1: Create validation schemas**

Create `lib/validations/auth.ts`:
```typescript
/**
 * AUTHENTICATION VALIDATION SCHEMAS
 *
 * Zod schemas for validating auth-related form data.
 * WHY: Validate user input before processing to prevent errors and security issues.
 *
 * Used by: API routes, form components
 */

import { z } from 'zod'

/**
 * Registration form validation schema
 *
 * Rules:
 * - Email must be valid format
 * - Password must be at least 8 characters
 * - First and last name required
 * - Phone optional but must be valid format if provided
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
})

/**
 * Login form validation schema
 *
 * Rules:
 * - Email must be valid format
 * - Password required
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Export TypeScript types from schemas
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
```

**Step 2: Create registration API route**

Create `app/api/auth/register/route.ts`:
```typescript
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
        { error: error.errors[0].message },
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
```

**Step 3: Test registration API manually**

Run development server:
```bash
npm run dev
```

Test with curl (in another terminal):
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ucla.edu",
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "User",
    "phone": "+11234567890"
  }'
```

Expected response:
```json
{
  "success": true,
  "user": {...},
  "message": "Registration successful! Please check your email to verify your account."
}
```

**Step 4: Commit registration API**

Run:
```bash
git add app/api/auth/register/ lib/validations/auth.ts
git commit -m "feat: add user registration API with validation"
```

Expected: Registration API committed

---

### Task 1.3: Build Login and Logout APIs

**Files:**
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/logout/route.ts`

**Step 1: Create login API route**

Create `app/api/auth/login/route.ts`:
```typescript
/**
 * LOGIN API ROUTE
 *
 * POST /api/auth/login
 *
 * Authenticates a user and creates a session.
 * WHY: Handle user login with proper error handling and validation.
 *
 * Request body: { email, password }
 * Response: { success: true, user } or { error: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations/auth'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Get Supabase client
    const supabase = await createClient()

    // Attempt to sign in with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      // Return generic error message for security
      // WHY: Don't reveal whether email exists or password is wrong
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 500 }
      )
    }

    // Fetch user profile from our users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
```

**Step 2: Create logout API route**

Create `app/api/auth/logout/route.ts`:
```typescript
/**
 * LOGOUT API ROUTE
 *
 * POST /api/auth/logout
 *
 * Logs out the current user and clears session.
 * WHY: Provide secure logout functionality.
 *
 * Response: { success: true } or { error: string }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    // Get Supabase client
    const supabase = await createClient()

    // Sign out the user
    // WHY: This clears the auth session and cookies
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
```

**Step 3: Commit login/logout APIs**

Run:
```bash
git add app/api/auth/login/ app/api/auth/logout/
git commit -m "feat: add login and logout API routes"
```

Expected: Login/logout APIs committed

---

## Phase 2: Barber Profile System

### Task 2.1: Create Barber Profile API

**Files:**
- Create: `app/api/barber/profile/route.ts`
- Create: `lib/validations/barber.ts`
- Create: `lib/types/barber.ts`

**Step 1: Create barber types**

Create `lib/types/barber.ts`:
```typescript
/**
 * BARBER PROFILE TYPES
 *
 * TypeScript types for barber profiles and related data.
 * WHY: Type safety for barber-specific features.
 */

/**
 * Barber profile approval status
 */
export type BarberStatus = 'pending' | 'approved' | 'suspended'

/**
 * Service location type
 */
export type LocationType = 'fixed' | 'mobile'

/**
 * Barber specialties
 */
export type Specialty =
  | 'fades'
  | 'long_hair'
  | 'womens_cuts'
  | 'beard_trim'
  | 'designs'
  | 'black_hair'
  | 'asian_hair'
  | 'curly_hair'
  | 'buzz_cuts'

/**
 * Complete barber profile from database
 */
export interface BarberProfile {
  id: string
  user_id: string
  bio: string
  profile_photo_url: string | null
  years_experience: number
  base_price: number
  location_type: LocationType
  location_area: string | null
  exact_address: string | null
  service_radius_miles: number | null
  venmo_handle: string | null
  zelle_handle: string | null
  instagram_handle: string | null
  appointment_duration: number
  status: BarberStatus
  rating_avg: number
  review_count: number
  created_at: string
  updated_at: string
}

/**
 * Barber specialty record
 */
export interface BarberSpecialty {
  id: string
  barber_id: string
  specialty: Specialty
  created_at: string
}

/**
 * Portfolio photo record
 */
export interface PortfolioPhoto {
  id: string
  barber_id: string
  photo_url: string
  caption: string | null
  order_index: number
  created_at: string
}

/**
 * Complete barber profile with specialties and photos
 */
export interface BarberProfileWithDetails extends BarberProfile {
  specialties: BarberSpecialty[]
  portfolio_photos: PortfolioPhoto[]
  user: {
    first_name: string
    last_name: string
    email: string
  }
}
```

**Step 2: Create barber validation schemas**

Create `lib/validations/barber.ts`:
```typescript
/**
 * BARBER PROFILE VALIDATION SCHEMAS
 *
 * Zod schemas for validating barber profile data.
 * WHY: Ensure barber profiles meet quality standards before approval.
 */

import { z } from 'zod'

/**
 * Barber profile creation/update schema
 *
 * Rules enforced:
 * - Bio must be 50-150 characters (not too short, not too long)
 * - Price must be between $10-30 (affordable for students)
 * - Years experience must be positive
 * - At least one specialty required
 * - Location details required based on type
 */
export const barberProfileSchema = z.object({
  bio: z
    .string()
    .min(50, 'Bio must be at least 50 characters')
    .max(150, 'Bio must be no more than 150 characters'),
  years_experience: z
    .number()
    .int()
    .min(0, 'Years of experience must be positive')
    .max(50, 'Years of experience seems too high'),
  base_price: z
    .number()
    .min(10, 'Price must be at least $10')
    .max(30, 'Price must be no more than $30'),
  location_type: z.enum(['fixed', 'mobile']),
  location_area: z.string().optional(),
  exact_address: z.string().optional(),
  service_radius_miles: z.number().int().min(0).optional(),
  venmo_handle: z.string().optional(),
  zelle_handle: z.string().optional(),
  instagram_handle: z.string().optional(),
  appointment_duration: z.enum([30, 45, 60]).transform(Number),
  specialties: z
    .array(
      z.enum([
        'fades',
        'long_hair',
        'womens_cuts',
        'beard_trim',
        'designs',
        'black_hair',
        'asian_hair',
        'curly_hair',
        'buzz_cuts',
      ])
    )
    .min(1, 'At least one specialty is required'),
})
.refine(
  (data) => {
    // If fixed location, require area and address
    if (data.location_type === 'fixed') {
      return data.location_area && data.exact_address
    }
    return true
  },
  {
    message: 'Fixed location requires area and exact address',
    path: ['location_area'],
  }
)
.refine(
  (data) => {
    // If mobile, require service radius
    if (data.location_type === 'mobile') {
      return data.service_radius_miles && data.service_radius_miles > 0
    }
    return true
  },
  {
    message: 'Mobile barbers must specify service radius',
    path: ['service_radius_miles'],
  }
)

export type BarberProfileInput = z.infer<typeof barberProfileSchema>
```

**Step 3: Create barber profile API route**

Create `app/api/barber/profile/route.ts`:
```typescript
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
        { error: error.errors[0].message },
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
```

**Step 4: Commit barber profile API**

Run:
```bash
git add app/api/barber/profile/ lib/types/barber.ts lib/validations/barber.ts
git commit -m "feat: add barber profile creation and update API"
```

Expected: Barber profile API committed

---

*[Due to length constraints, I'll provide a summary of remaining tasks]*

## Remaining Tasks Summary

### Phase 2 (Continued): Barber Profiles
- **Task 2.2**: Portfolio photo upload API
- **Task 2.3**: Availability schedule API
- **Task 2.4**: Get all barbers API with filters

### Phase 3: Booking System
- **Task 3.1**: Available slots calculation API
- **Task 3.2**: Create booking API
- **Task 3.3**: Confirm/decline booking API
- **Task 3.4**: Cancel booking API
- **Task 3.5**: Get user bookings API

### Phase 4: Review System
- **Task 4.1**: Submit review API
- **Task 4.2**: Get barber reviews API
- **Task 4.3**: Rating calculation (handled by database trigger)

### Phase 5: Frontend - UI Components
- **Task 5.1**: Install and configure shadcn/ui
- **Task 5.2**: Create reusable form components
- **Task 5.3**: Create layout components (header, footer, nav)

### Phase 6: Frontend - Auth Pages
- **Task 6.1**: Registration page
- **Task 6.2**: Login page
- **Task 6.3**: Email verification page

### Phase 7: Frontend - Barber Onboarding
- **Task 7.1**: Multi-step barber profile form
- **Task 7.2**: Portfolio photo upload UI
- **Task 7.3**: Availability schedule builder

### Phase 8: Frontend - Browse & Search
- **Task 8.1**: Homepage with featured barbers
- **Task 8.2**: Browse barbers page with filters
- **Task 8.3**: Barber profile detail page
- **Task 8.4**: Search and sort functionality

### Phase 9: Frontend - Booking Flow
- **Task 9.1**: Booking calendar component
- **Task 9.2**: Booking request form
- **Task 9.3**: Booking confirmation page

### Phase 10: Frontend - Dashboards
- **Task 10.1**: Customer dashboard
- **Task 10.2**: Barber dashboard
- **Task 10.3**: Booking management UI

### Phase 11: Email Notifications
- **Task 11.1**: Email service setup (Resend)
- **Task 11.2**: Email templates
- **Task 11.3**: Notification triggers

### Phase 12: Testing & Polish
- **Task 12.1**: Manual testing of all flows
- **Task 12.2**: Fix bugs and edge cases
- **Task 12.3**: Add loading states
- **Task 12.4**: Error handling improvements
- **Task 12.5**: Mobile responsiveness check

### Phase 13: Deployment
- **Task 13.1**: Deploy to Vercel
- **Task 13.2**: Configure environment variables
- **Task 13.3**: Test production build
- **Task 13.4**: Set up custom domain (optional)

---

## Testing Strategy

**For each API endpoint:**
1. Write the endpoint code following CODE_STYLE.md
2. Test with curl or Postman
3. Verify database changes in Supabase dashboard
4. Test error cases (invalid data, unauthorized access)
5. Commit when working

**For each frontend component:**
1. Build component with comprehensive comments
2. Test in browser with React DevTools
3. Test responsive design (mobile, tablet, desktop)
4. Test keyboard navigation and accessibility
5. Commit when working

---

## Success Criteria

**MVP is complete when:**
- ✅ Users can register and login
- ✅ Barbers can create profiles with photos and availability
- ✅ Customers can browse and filter barbers
- ✅ Customers can book appointments
- ✅ Barbers can confirm/decline bookings
- ✅ Email notifications work for key events
- ✅ Customers can leave reviews
- ✅ All code follows CODE_STYLE.md (beginner-friendly comments)
- ✅ Mobile responsive design works
- ✅ Deployed to production and accessible online

---
