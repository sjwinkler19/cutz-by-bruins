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
