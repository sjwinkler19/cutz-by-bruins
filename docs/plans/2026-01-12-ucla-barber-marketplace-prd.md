# Product Requirements Document (PRD)
## UCLA Student Barber Marketplace - MVP

---

## 1. Product Overview

**Product Name:** [TBD - suggest "CampusCuts" or similar]

**Vision:** Connect UCLA students who need haircuts with skilled student barbers, creating a trusted marketplace for affordable, convenient grooming services.

**Target Users:**
- **Primary:** UCLA students seeking affordable haircuts ($15-20 range)
- **Secondary:** UCLA student barbers looking for consistent clientele

**Success Metrics (MVP Phase):**
- 5+ active student barbers with complete profiles
- 50+ bookings completed in first month
- 4.0+ average rating across all barbers
- <10% cancellation rate

---

## 2. Core User Flows

### 2.1 Student Barber Onboarding Flow

**Entry Point:** "Become a Barber" CTA on homepage

**Steps:**
1. **Registration**
   - Input: Name, email (@ucla.edu required), phone number, password
   - Verification: Email verification code sent
   - Validation: Must be valid UCLA email

2. **Profile Creation**
   - Basic Info:
     - Profile photo (required)
     - Bio (150 char max)
     - Years of experience
     - Specialties (checkboxes: fades, tapers, long hair, ethnic hair, women's cuts, etc.)
   - Portfolio:
     - Upload 3-6 before/after photos
     - Each photo can have optional caption
   - Pricing:
     - Set base price ($10-30 range)
     - Optional: Different prices for different services
   - Location Setup:
     - Choose: Fixed location OR Mobile (comes to customer)
     - If fixed: General area only (e.g., "Westwood Village", "The Hill") - exact address shared after booking
     - If mobile: Service radius in miles from campus center

3. **Availability Setup**
   - Weekly recurring schedule builder
   - For each day: Add time blocks (e.g., "Monday 3pm-8pm", "Saturday 10am-6pm")
   - Set appointment duration (30min, 45min, or 60min slots)
   - Option to block out specific dates (finals week, breaks, etc.)

4. **Review & Submit**
   - Platform reviews profile for quality
   - Manual approval required before going live (quality gate)
   - Approval within 24-48 hours

**Barber Dashboard (Post-Approval):**
- View upcoming bookings
- Manage availability calendar
- View earnings summary (total bookings * price)
- Respond to booking requests
- View/respond to reviews

---

### 2.2 Student Customer Booking Flow

**Entry Point:** Homepage browse or search

**Steps:**
1. **Browse Barbers**
   - Grid/list view of available barbers
   - Each card shows:
     - Profile photo
     - Name
     - Price
     - Rating (stars + number of reviews)
     - Specialties badges
     - "Mobile" or location area badge
     - Sample portfolio photo
   - Filter options:
     - Price range
     - Availability (today, this week, next week)
     - Location type (mobile vs fixed)
     - Specialties
   - Sort options:
     - Highest rated
     - Most reviews
     - Lowest price
     - Soonest available

2. **View Barber Profile**
   - Full profile info:
     - All photos in gallery
     - Complete bio
     - Detailed specialties
     - All reviews (with photos if any)
     - Average rating breakdown
   - "Book Now" CTA button (prominent)

3. **Booking Calendar View**
   - Week view showing available time slots
   - Green = available, Gray = booked, Empty = barber not available
   - Click slot to select
   - Shows: Date, time, duration, price

4. **Booking Request Form**
   - If not logged in: Quick registration (name, email, phone, password)
   - If logged in: Pre-filled contact info
   - Haircut notes (optional text field): "What are you looking for?"
   - Location info (if mobile barber): Your location/dorm
   - Confirm button

5. **Booking Confirmation**
   - Confirmation screen: "Request sent to [Barber Name]"
   - Email sent to customer
   - SMS sent to barber
   - Status: "Pending confirmation"

6. **Barber Confirms**
   - Barber receives notification, reviews request
   - Accepts or declines (with optional message)
   - If accepted:
     - Customer gets confirmation email/SMS
     - Booking added to both calendars
     - Exact location details shared (if fixed location)
     - Venmo/Zelle handle shared

7. **Day Before Reminder**
   - Automated SMS/email reminder to both parties
   - Customer can cancel (up to 4 hours before)

8. **Post-Appointment**
   - 1 hour after appointment time, customer gets review prompt
   - Review form: Star rating (1-5), optional text review, optional photo upload
   - Barber can also rate customer (for internal reputation - not shown publicly)

**Customer Dashboard:**
- View upcoming bookings
- View past bookings
- Leave reviews for completed appointments
- View favorite barbers

---

## 3. Detailed Feature Specifications

### 3.1 User Authentication

**Registration:**
- Email (@ucla.edu only for barbers, any email for customers initially - can expand later)
- Password requirements: 8+ characters
- Phone number (for SMS notifications)
- Email verification required before booking

**Login:**
- Email + password
- "Forgot password" flow (email reset link)
- Session persistence (stay logged in)

**User Types:**
- Customer (default)
- Barber (requires approval)
- Admin (for platform management - future)

---

### 3.2 Barber Profile System

**Profile Fields:**

**Required:**
- Profile photo (max 5MB, jpg/png)
- Name (first + last)
- Bio (50-150 characters)
- At least 3 portfolio photos
- Base price
- At least 1 specialty selected
- Location type (mobile or fixed)
- Weekly availability (at least 5 hours/week)

**Optional:**
- Instagram handle
- Years of experience
- Service area (if mobile)
- Additional service prices

**Portfolio Management:**
- Upload up to 10 photos
- Drag to reorder
- Add captions
- Delete/replace photos
- First photo is profile cover image

**Pricing Structure (MVP):**
- Single base price for "standard cut"
- Optional: Add custom services (e.g., "Beard trim +$5", "Design +$10")

---

### 3.3 Availability & Calendar System

**Barber Availability Setup:**

**Weekly Recurring Schedule:**
- For each day of week: Add multiple time blocks
- Example: Monday 2pm-5pm, 7pm-9pm
- UI: Click day → add time range → set as recurring

**Time Slot Generation:**
- Based on appointment duration setting (30/45/60min)
- Example: If barber available 2pm-5pm with 45min slots:
  - 2:00pm (available)
  - 2:45pm (available)
  - 3:30pm (available)
  - 4:15pm (available)
- Slots auto-gray out when booked

**Exceptions/Overrides:**
- "Block out dates" feature for breaks, exams, etc.
- Can add one-off available times outside regular schedule
- Can mark specific day as unavailable

**Calendar View for Customers:**
- Week view (7 days ahead)
- Shows available slots only
- Clicking slot shows: Time, duration, price, location type
- Mobile-responsive: Stacks on mobile, side-by-side on desktop

---

### 3.4 Booking System

**Booking States:**
1. **Pending** - Customer requested, awaiting barber confirmation
2. **Confirmed** - Barber accepted, appointment scheduled
3. **Completed** - Appointment time passed
4. **Cancelled** - Either party cancelled
5. **No-show** - Customer didn't show up (barber marks this)

**Booking Flow Details:**

**Request Submission:**
- Customer selects slot
- Fills out request form
- System checks slot still available
- Creates booking record (status: Pending)
- Sends notifications

**Barber Confirmation:**
- Email + SMS to barber: "New booking request from [Name]"
- Link to view request details
- Barber can:
  - Accept (booking → Confirmed)
  - Decline with reason (booking → Cancelled, slot reopens)
  - Propose alternative time (optional feature - future)

**Time Limits:**
- Barber has 12 hours to respond
- After 12 hours, booking auto-declines and customer notified

**Contact Exchange:**
- Upon confirmation, both parties get each other's phone numbers
- Exact address shared (if fixed location)
- Venmo/Zelle handle shared (barber's payment info)

**Cancellation Policy:**
- Customer can cancel up to 4 hours before appointment
- Within 4 hours: Must contact barber directly
- Barber can cancel anytime (but tracked for reliability)
- 3+ cancellations by barber = platform review

**No-Show Handling:**
- After appointment time, barber can mark "Customer no-show"
- Customer gets email asking for explanation
- 2+ no-shows = booking privileges suspended

---

### 3.5 Review & Rating System

**Review Collection:**
- Triggered 1 hour after appointment time
- Email + SMS: "How was your cut with [Barber]?"
- Link to review form

**Review Form:**
- Star rating (1-5, required)
- Written review (optional, 500 char max)
- Photo upload (optional, before/after)
- Tags: "Great fade", "On time", "Friendly", "Great value" (select all that apply)

**Review Display:**
- Shows on barber profile
- Sorted by most recent
- Show: Rating, review text, date, customer first name only
- Photos displayed in gallery

**Rating Calculation:**
- Average of all star ratings
- Displayed as X.X stars out of 5
- Show number of reviews: "(24 reviews)"

**Moderation:**
- Barbers can report inappropriate reviews
- Platform can hide/remove reviews (manual review)
- No editing reviews once submitted

**Mutual Rating (Internal):**
- Barbers can rate customers (1-5 stars, optional notes)
- NOT shown publicly
- Used to flag problematic customers
- Future: Could factor into booking priority

---

### 3.6 Notifications System

**Notification Types:**

**Email Notifications:**
1. Registration verification
2. Booking request received (to barber)
3. Booking confirmed (to customer)
4. Booking cancelled
5. Day-before reminder (both parties)
6. Review request (to customer)
7. New review received (to barber)

**SMS Notifications:**
1. Booking request received (to barber) - "New request from Sarah for Tue 3pm"
2. Booking confirmed (to customer) - "Mario confirmed your cut for Tue 3pm"
3. Day-before reminder (both parties)
4. Booking cancelled (both parties)

**In-App Notifications (Future):**
- Bell icon with notification count
- View all notifications in dashboard

**Notification Settings:**
- Users can opt out of non-critical emails
- SMS opt-out available
- Must receive booking confirmations/cancellations

---

### 3.7 Payment System (MVP - Off-Platform)

**MVP Approach:**
- ALL payments happen off-platform (Venmo/Zelle/Cash)
- No transaction fees
- No payment processing integration

**Payment Flow:**
1. Barber lists their Venmo/Zelle handle in profile
2. Upon booking confirmation, customer sees: "Pay [Barber] via Venmo: @handle"
3. Payment happens before/after cut (barber's discretion)
4. Platform doesn't track payment completion

**Future Payment Integration:**
- Stripe integration for in-platform payments
- 10-15% platform fee
- Automatic payout to barbers
- Payment escrow for disputes

---

### 3.8 Search & Discovery

**Homepage:**
- Hero section: "Find your perfect student barber"
- Featured barbers (highest rated + most reviews)
- "Browse all barbers" CTA
- "Become a barber" CTA

**Browse/Search Page:**

**Filters (Left Sidebar):**
- Price range slider ($10-30)
- Availability:
  - Available today
  - Available this week
  - Available next week
- Location type:
  - Mobile barbers
  - Fixed location
- Specialties (multi-select):
  - Fades & tapers
  - Long hair
  - Women's cuts
  - Beard trimming
  - Ethnic hair (Black hair, Asian hair, etc.)
  - Designs & line-ups

**Sort Options (Dropdown):**
- Highest rated (default)
- Most reviews
- Lowest price
- Highest price
- Soonest available

**Search Bar:**
- Search by barber name
- Search by specialty keywords

**Results Display:**
- Grid view (3 columns on desktop, 1 on mobile)
- Each card: Photo, name, rating, price, "Book" button
- Clicking card opens full profile

---

## 4. Technical Specifications

### 4.1 Tech Stack Recommendations

**Frontend:**
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui or Radix UI
- **Form Handling:** React Hook Form + Zod validation
- **State Management:** React Context or Zustand (lightweight)

**Backend:**
- **Framework:** Next.js API routes
- **Database:** Supabase (Postgres + real-time + auth + storage)
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage (for profile/portfolio photos)

**Communications:**
- **Email:** Resend or SendGrid
- **SMS:** Twilio
- **Notifications:** Trigger scheduled jobs via Vercel Cron or Supabase Functions

**Hosting:**
- **Frontend/Backend:** Vercel
- **Database:** Supabase (hosted Postgres)

**Other Tools:**
- **Image Optimization:** Next.js Image component + Supabase Storage
- **Calendar UI:** react-big-calendar or build custom with date-fns
- **Date Handling:** date-fns
- **Forms:** React Hook Form + Zod

---

### 4.2 Database Schema

**Users Table:**
```sql
users (
  id: uuid (PK)
  email: string (unique)
  phone: string
  password_hash: string
  first_name: string
  last_name: string
  role: enum ['customer', 'barber', 'admin']
  ucla_verified: boolean
  created_at: timestamp
  updated_at: timestamp
)
```

**Barber_Profiles Table:**
```sql
barber_profiles (
  id: uuid (PK)
  user_id: uuid (FK -> users.id)
  bio: string
  profile_photo_url: string
  years_experience: integer
  base_price: decimal
  location_type: enum ['fixed', 'mobile']
  location_area: string (e.g., "Westwood Village")
  exact_address: string (only shared on booking)
  service_radius_miles: integer (if mobile)
  venmo_handle: string
  zelle_handle: string
  instagram_handle: string
  appointment_duration: integer (30, 45, or 60 mins)
  status: enum ['pending', 'approved', 'suspended']
  rating_avg: decimal (calculated)
  review_count: integer (calculated)
  created_at: timestamp
  updated_at: timestamp
)
```

**Barber_Specialties Table (Many-to-Many):**
```sql
barber_specialties (
  id: uuid (PK)
  barber_id: uuid (FK -> barber_profiles.id)
  specialty: enum ['fades', 'long_hair', 'womens_cuts', 'beard_trim', 'designs', 'black_hair', 'asian_hair', etc.]
)
```

**Portfolio_Photos Table:**
```sql
portfolio_photos (
  id: uuid (PK)
  barber_id: uuid (FK -> barber_profiles.id)
  photo_url: string
  caption: string (optional)
  order_index: integer
  created_at: timestamp
)
```

**Availability_Schedule Table:**
```sql
availability_schedule (
  id: uuid (PK)
  barber_id: uuid (FK -> barber_profiles.id)
  day_of_week: integer (0=Sunday, 6=Saturday)
  start_time: time
  end_time: time
  is_recurring: boolean
)
```

**Availability_Exceptions Table:**
```sql
availability_exceptions (
  id: uuid (PK)
  barber_id: uuid (FK -> barber_profiles.id)
  date: date
  is_available: boolean (false = blocked out, true = special availability)
  start_time: time (if is_available=true)
  end_time: time (if is_available=true)
)
```

**Bookings Table:**
```sql
bookings (
  id: uuid (PK)
  customer_id: uuid (FK -> users.id)
  barber_id: uuid (FK -> barber_profiles.id)
  appointment_date: date
  appointment_time: time
  duration_minutes: integer
  status: enum ['pending', 'confirmed', 'completed', 'cancelled', 'no_show']
  customer_notes: text
  customer_location: string (if mobile barber)
  price: decimal
  cancellation_reason: string (optional)
  cancelled_by: enum ['customer', 'barber'] (if cancelled)
  created_at: timestamp
  updated_at: timestamp
  confirmed_at: timestamp
  completed_at: timestamp
)
```

**Reviews Table:**
```sql
reviews (
  id: uuid (PK)
  booking_id: uuid (FK -> bookings.id, unique)
  customer_id: uuid (FK -> users.id)
  barber_id: uuid (FK -> barber_profiles.id)
  rating: integer (1-5)
  review_text: text (optional)
  photo_url: string (optional)
  tags: string[] (array of selected tags)
  created_at: timestamp
)
```

**Customer_Ratings Table (Internal - barber rates customer):**
```sql
customer_ratings (
  id: uuid (PK)
  booking_id: uuid (FK -> bookings.id, unique)
  barber_id: uuid (FK -> barber_profiles.id)
  customer_id: uuid (FK -> users.id)
  rating: integer (1-5)
  notes: text (private)
  created_at: timestamp
)
```

**Notifications Table (Optional - for in-app notifications future):**
```sql
notifications (
  id: uuid (PK)
  user_id: uuid (FK -> users.id)
  type: string
  title: string
  message: text
  is_read: boolean
  created_at: timestamp
)
```

---

### 4.3 API Endpoints (Next.js API Routes)

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verify email code
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

**Barber Profile:**
- `POST /api/barber/profile` - Create/update barber profile
- `GET /api/barber/profile/:id` - Get barber profile
- `GET /api/barber/profiles` - List all barbers (with filters)
- `POST /api/barber/portfolio` - Upload portfolio photo
- `DELETE /api/barber/portfolio/:id` - Delete portfolio photo
- `PUT /api/barber/portfolio/reorder` - Reorder photos

**Availability:**
- `POST /api/barber/availability` - Set weekly schedule
- `GET /api/barber/availability/:barber_id` - Get barber availability
- `POST /api/barber/availability/exception` - Add exception/block out
- `GET /api/barber/slots/:barber_id` - Get available time slots

**Bookings:**
- `POST /api/bookings` - Create booking request
- `GET /api/bookings` - Get user's bookings (customer or barber view)
- `PUT /api/bookings/:id/confirm` - Barber confirms booking
- `PUT /api/bookings/:id/decline` - Barber declines booking
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/no-show` - Mark customer no-show

**Reviews:**
- `POST /api/reviews` - Submit review
- `GET /api/reviews/:barber_id` - Get barber's reviews
- `POST /api/reviews/:id/report` - Report inappropriate review

**Search:**
- `GET /api/search/barbers` - Search barbers with filters

**Admin (Future):**
- `GET /api/admin/pending-barbers` - Get pending barber approvals
- `PUT /api/admin/approve-barber/:id` - Approve barber

---

### 4.4 Key Algorithms & Logic

**Available Slot Generation:**
```
Input: barber_id, date_range (7 days)
Process:
1. Get barber's weekly schedule
2. Get barber's exceptions for date range
3. Get existing bookings for date range
4. For each day in range:
   - Check if day has recurring schedule
   - Apply any exceptions (block outs or special availability)
   - Generate time slots based on appointment duration
   - Remove slots that have existing bookings
   - Remove slots in the past
5. Return array of available slots
```

**Booking Conflict Detection:**
```
When customer requests slot:
1. Check if slot still exists (not booked by someone else)
2. Check if within barber's availability
3. Check if not too far in future (e.g., max 2 weeks ahead)
4. Create booking with "pending" status
5. Lock slot for 12 hours (don't show to other customers)
```

**Rating Calculation:**
```
When new review submitted:
1. Add review to database
2. Recalculate barber's rating_avg:
   rating_avg = SUM(all ratings) / COUNT(all ratings)
3. Update barber_profiles.review_count
4. Trigger notification to barber
```

**Search Ranking Algorithm:**
```
Default sort (Highest Rated):
1. Primary: rating_avg DESC
2. Secondary: review_count DESC (break ties)
3. Tertiary: created_at DESC (newer barbers if tied)

Filters applied:
- Price range: base_price BETWEEN min AND max
- Availability: Check if barber has any slots in next X days
- Location type: location_type = 'mobile' OR 'fixed'
- Specialties: JOIN with barber_specialties table
```

---

## 5. User Interface Specifications

### 5.1 Key Pages & Wireframes

**Homepage:**
- Hero: Large header "Find Your Perfect Student Barber at UCLA"
- Search bar (optional for MVP)
- Featured barbers grid (top 6 by rating)
- "How it works" section (3 steps)
- "Become a barber" CTA
- Footer with links

**Browse Barbers Page:**
- Left sidebar: Filters
- Main content: Grid of barber cards
- Top: Sort dropdown + result count
- Mobile: Filters in collapsible drawer

**Barber Profile Page:**
- Top section:
  - Large profile photo (left)
  - Name, rating, price, location type (right)
  - "Book Now" CTA button (prominent)
  - Specialties badges
- Portfolio gallery (masonry grid)
- About section (bio)
- Reviews section (list with pagination)
- Sticky "Book Now" button on scroll

**Booking Calendar Modal/Page:**
- Week view calendar
- Available slots highlighted
- Click slot → confirmation modal
- Show: Date, time, price, location note
- "Confirm booking" button

**Customer Dashboard:**
- Tabs: Upcoming | Past | Favorites
- Upcoming bookings: Cards with barber photo, date/time, "Cancel" option
- Past bookings: Cards with "Leave review" button if not reviewed
- Favorites: Grid of saved barbers

**Barber Dashboard:**
- Tabs: Upcoming | Past | Profile | Availability
- Upcoming bookings: Cards with customer name, time, "Confirm/Decline" buttons if pending
- Manage availability calendar
- View stats: Total bookings, avg rating, earnings

**Barber Onboarding Flow:**
- Multi-step form with progress indicator
- Step 1: Account info
- Step 2: Profile details
- Step 3: Portfolio upload
- Step 4: Pricing & location
- Step 5: Availability setup
- Step 6: Review & submit

---

### 5.2 Mobile Responsiveness

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile-Specific Considerations:**
- Filters: Collapsible drawer instead of sidebar
- Barber cards: Stack vertically (1 column)
- Profile page: Stack sections vertically
- Calendar: Smaller slot sizes, swipe between days
- Forms: Full-width inputs, larger tap targets
- Navigation: Hamburger menu

---

## 6. MVP Scope & Phasing

### Phase 1 (MVP - Week 1-3):
**Core Features:**
- ✅ User registration & authentication (customer + barber)
- ✅ Barber profile creation (manual approval)
- ✅ Browse barbers with basic filtering
- ✅ Booking request system (pending → confirmed flow)
- ✅ Email notifications only
- ✅ Review system (rating + text)
- ✅ Off-platform payments (Venmo/Zelle)

**Not Included:**
- ❌ SMS notifications (email only for MVP)
- ❌ In-app notifications
- ❌ Advanced search
- ❌ Favorite barbers
- ❌ In-platform payments
- ❌ Admin dashboard

### Phase 2 (Post-MVP - Week 4-6):
- SMS notifications via Twilio
- In-app notification center
- Favorite barbers feature
- Customer no-show tracking
- Barber analytics dashboard
- Advanced filtering (tags, multiple specialties)

### Phase 3 (Growth - Month 2+):
- In-platform payment (Stripe integration)
- Transaction fees (10-15%)
- Admin dashboard for approvals
- Promoted listings (monetization)
- Multi-campus expansion

---

## 7. Success Criteria & KPIs

**MVP Launch Goals (Month 1):**
- 5+ approved barbers with complete profiles
- 50+ total bookings
- 4.0+ average rating across platform
- <15% cancellation rate
- 80%+ booking confirmation rate (barbers responding within 12hrs)

**Growth Metrics (Month 2-3):**
- 10+ active barbers
- 150+ monthly bookings
- 60%+ repeat customer rate
- 20+ reviews per barber on average

**Quality Metrics:**
- Zero reports of safety incidents
- <5% reported booking disputes
- 90%+ positive reviews (4-5 stars)

---

## 8. Open Questions & Decisions Needed

1. **Exact launch timeline?** When do you want to go live?
2. **Barber approval process?** Who reviews/approves barbers? What's the criteria?
3. **Pricing validation?** Have you confirmed $15-20 is attractive to students and viable for barbers?
4. **Mobile vs Fixed?** Should MVP support both or start with one?
5. **Brand name?** Need to finalize name + domain
6. **UCLA verification?** Enforce @ucla.edu emails for customers too, or just barbers?
7. **Liability?** Any terms of service, waiver, or insurance considerations?
8. **Marketing plan?** How will you get first 5 barbers and first 50 customers?

---

## 9. Risks & Mitigations

**Risk: Can't find 5 quality barbers**
- Mitigation: Reach out directly to known student barbers, offer free promotion

**Risk: Quality control issues (bad haircuts)**
- Mitigation: Manual approval, review system, ability to suspend barbers

**Risk: High cancellation rates**
- Mitigation: Cancellation policy, no-show tracking, eventually require deposits

**Risk: Low customer adoption**
- Mitigation: Aggressive social media marketing, referral incentives, pricing discounts for first customers

**Risk: Safety/liability concerns**
- Mitigation: Terms of service, insurance recommendations for barbers, ID verification

---

## 10. Next Steps

1. **Review & approve this PRD** - Any changes needed?
2. **Set up development environment** - Create Next.js project, Supabase account
3. **Design mockups (optional)** - Can start coding directly or create Figma designs first
4. **Build Phase 1 MVP** - Start with auth → profiles → booking system
5. **Recruit first 3 barbers** - Test onboarding flow with real users
6. **Soft launch** - Get first 10 bookings manually before full launch
7. **Iterate based on feedback** - Fix bugs, improve UX

---

**Ready to start building?** Let me know if you want to adjust anything in this PRD, or we can start scaffolding the codebase!
