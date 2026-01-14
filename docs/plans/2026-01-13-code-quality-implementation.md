# Code Quality Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix high-impact code quality issues to improve maintainability and prevent bugs.

**Architecture:** Extract duplicated utilities to shared modules, add database constraint for race condition, replace `any` types with proper generics, standardize error handling across API routes.

**Tech Stack:** TypeScript, Next.js 15, Supabase (PostgreSQL), Zod validation

---

## Task 1: Create Time Utilities Module

**Files:**
- Create: `lib/utils/time.ts`

**Step 1: Create the time utilities file**

```typescript
/**
 * TIME UTILITIES
 *
 * Shared time manipulation functions used across the application.
 * WHY: Centralize time logic to avoid duplication in API routes.
 */

/**
 * Convert time string to minutes since midnight
 * @example "09:30" -> 570 (9*60 + 30)
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Convert minutes since midnight to time string
 * @example 570 -> "09:30"
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Calculate end time given start time and duration
 * @example ("09:00", 30) -> "09:30"
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = startMinutes + durationMinutes
  return minutesToTime(endMinutes)
}

/**
 * Generate all possible time slots within a time range
 * @example ("09:00", "12:00", 30) -> ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = []
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  for (let time = startMinutes; time + durationMinutes <= endMinutes; time += durationMinutes) {
    slots.push(minutesToTime(time))
  }

  return slots
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit lib/utils/time.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add lib/utils/time.ts
git commit -m "feat: add shared time utilities module"
```

---

## Task 2: Create Validation Constants Module

**Files:**
- Create: `lib/validations/common.ts`

**Step 1: Create the validation constants file**

```typescript
/**
 * COMMON VALIDATION PATTERNS
 *
 * Shared regex patterns and Zod schemas used across the application.
 * WHY: Centralize validation logic to ensure consistency.
 */

import { z } from 'zod'

/**
 * Regex patterns
 */
export const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Reusable Zod schemas
 */
export const timeSchema = z.string().regex(TIME_REGEX, 'Invalid time format (HH:MM)')
export const dateSchema = z.string().regex(DATE_REGEX, 'Invalid date format (YYYY-MM-DD)')
export const uuidSchema = z.string().regex(UUID_REGEX, 'Invalid ID format')
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit lib/validations/common.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add lib/validations/common.ts
git commit -m "feat: add shared validation constants module"
```

---

## Task 3: Create API Error Utilities Module

**Files:**
- Create: `lib/api/errors.ts`

**Step 1: Create the API error utilities file**

```typescript
/**
 * API ERROR UTILITIES
 *
 * Shared error handling functions for API routes.
 * WHY: Standardize error responses and return all validation errors.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Create a validation error response from a ZodError
 * Returns all validation errors, not just the first one
 */
export function validationErrorResponse(error: z.ZodError) {
  const messages = error.issues.map((issue) => issue.message)
  return NextResponse.json(
    {
      error: messages[0], // First error for backwards compatibility
      errors: messages,   // All errors for better UX
    },
    { status: 400 }
  )
}

/**
 * Create a standard error response
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Create an unauthorized error response
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/**
 * Create a not found error response
 */
export function notFoundResponse(resource: string = 'Resource') {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 })
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit lib/api/errors.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add lib/api/errors.ts
git commit -m "feat: add shared API error utilities module"
```

---

## Task 4: Add Database Constraint for Double-Booking Prevention

**Files:**
- Create: `supabase/migrations/20260113_prevent_double_booking.sql`

**Step 1: Create the migration file**

```sql
-- PREVENT DOUBLE-BOOKING
--
-- Add a partial unique index that prevents overlapping bookings
-- for the same barber at the same date/time.
--
-- WHY: Race condition exists between checking availability and inserting.
-- A database constraint makes this atomic and prevents double-bookings.

-- Create partial unique index on active bookings
-- This prevents two bookings at the same date/time for the same barber
-- when either is pending or confirmed
CREATE UNIQUE INDEX IF NOT EXISTS prevent_double_booking
ON bookings (barber_id, appointment_date, appointment_time)
WHERE status IN ('pending', 'confirmed');

-- Add comment explaining the constraint
COMMENT ON INDEX prevent_double_booking IS
  'Prevents double-booking by ensuring only one active booking per barber/date/time';
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260113_prevent_double_booking.sql
git commit -m "feat: add database constraint to prevent double-booking"
```

---

## Task 5: Update Bookings Route to Use Shared Utilities

**Files:**
- Modify: `app/api/bookings/route.ts`

**Step 1: Update imports and remove local functions**

Replace lines 1-19 with:

```typescript
/**
 * BOOKINGS API ROUTE
 *
 * POST /api/bookings - Create a new booking
 * GET /api/bookings - Get user's bookings
 *
 * WHY: Core booking functionality for the marketplace.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/utils'
import { createBookingSchema } from '@/lib/validations/booking'
import { z } from 'zod'
import { sendEmail } from '@/lib/email/service'
import {
  bookingConfirmationEmail,
  newBookingNotificationEmail,
} from '@/lib/email/templates'
import { timeToMinutes, calculateEndTime } from '@/lib/utils/time'
import { validationErrorResponse } from '@/lib/api/errors'
```

**Step 2: Update the ZodError handler in POST function**

Replace lines 282-286:

```typescript
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
```

With:

```typescript
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error)
    }
```

**Step 3: Update the insert error handling to catch constraint violation**

After line 221 (`if (bookingError) throw bookingError`), replace with:

```typescript
    if (bookingError) {
      // Check for unique constraint violation (double-booking attempt)
      if (bookingError.code === '23505') {
        return NextResponse.json(
          { error: 'This time slot was just booked by someone else. Please choose another time.' },
          { status: 409 }
        )
      }
      throw bookingError
    }
```

**Step 4: Remove local helper functions at end of file**

Delete lines 297-314 (the local `timeToMinutes` and `calculateEndTime` functions).

**Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add app/api/bookings/route.ts
git commit -m "refactor: use shared utilities in bookings route"
```

---

## Task 6: Update Slots Route to Use Shared Utilities

**Files:**
- Modify: `app/api/barbers/[id]/slots/route.ts`

**Step 1: Update imports**

Replace lines 1-17 with:

```typescript
/**
 * AVAILABLE SLOTS CALCULATION API ROUTE
 *
 * GET /api/barbers/[id]/slots?date=YYYY-MM-DD
 *
 * Calculates available time slots for a barber on a specific date.
 * WHY: Customers need to see which times are available for booking.
 *
 * Logic:
 * 1. Get barber's regular schedule for that day of week
 * 2. Check for exceptions (blocked dates or special hours)
 * 3. Get existing bookings for that date
 * 4. Calculate free slots based on appointment duration
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { timeToMinutes, generateTimeSlots } from '@/lib/utils/time'
import { DATE_REGEX } from '@/lib/validations/common'
```

**Step 2: Update date validation**

Replace lines 75-82:

```typescript
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateParam)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }
```

With:

```typescript
    // Validate date format
    if (!DATE_REGEX.test(dateParam)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }
```

**Step 3: Update slot generation call**

Replace lines 168-175:

```typescript
    let allSlots: string[] = []
    for (const hours of availableHours) {
      const slots = generateSlots(
        hours.start_time,
        hours.end_time,
        appointmentDuration
      )
      allSlots = [...allSlots, ...slots]
    }
```

With:

```typescript
    let allSlots: string[] = []
    for (const hours of availableHours) {
      const slots = generateTimeSlots(
        hours.start_time,
        hours.end_time,
        appointmentDuration
      )
      allSlots = [...allSlots, ...slots]
    }
```

**Step 4: Remove local helper functions**

Delete lines 19-56 (the local `timeToMinutes`, `minutesToTime`, and `generateSlots` functions).

**Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add app/api/barbers/[id]/slots/route.ts
git commit -m "refactor: use shared utilities in slots route"
```

---

## Task 7: Update Booking Validation to Use Shared Constants

**Files:**
- Modify: `lib/validations/booking.ts`

**Step 1: Update to use shared constants**

Replace entire file with:

```typescript
/**
 * BOOKING VALIDATION SCHEMAS
 *
 * Zod schemas for validating booking-related data.
 * WHY: Ensure booking requests are valid before processing.
 */

import { z } from 'zod'
import { timeSchema, dateSchema } from './common'

/**
 * Create booking validation schema
 *
 * Rules:
 * - Barber ID must be valid UUID
 * - Date must be valid format and in the future
 * - Time must be valid format
 * - Customer notes optional but limited to 500 chars
 * - Customer location required for mobile barbers
 */
export const createBookingSchema = z.object({
  barber_id: z.string().uuid('Invalid barber ID'),
  appointment_date: dateSchema,
  appointment_time: timeSchema,
  customer_notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .optional(),
  customer_location: z
    .string()
    .max(200, 'Location must be 200 characters or less')
    .optional(),
})

/**
 * Booking status type
 */
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

/**
 * Update booking status validation schema
 */
export const updateBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled', 'no_show']),
  cancellation_reason: z.string().max(500).optional(),
  cancelled_by: z.enum(['customer', 'barber']).optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add lib/validations/booking.ts
git commit -m "refactor: use shared validation constants in booking schema"
```

---

## Task 8: Update Schedule Route to Use Shared Utilities

**Files:**
- Modify: `app/api/barber/availability/schedule/route.ts`

**Step 1: Update imports**

Add after line 16:

```typescript
import { timeSchema } from '@/lib/validations/common'
import { validationErrorResponse } from '@/lib/api/errors'
```

**Step 2: Update validation schema**

Replace lines 19-29:

```typescript
const addScheduleSchema = z.object({
  day_of_week: z.number().int().min(0).max(6, 'Day must be 0-6 (Sun-Sat)'),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
}).refine(
  (data) => data.start_time < data.end_time,
  {
    message: 'Start time must be before end time',
    path: ['start_time'],
  }
)
```

With:

```typescript
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
```

**Step 3: Update ZodError handlers**

Replace lines 158-163 (POST handler):

```typescript
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
```

With:

```typescript
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error)
    }
```

Do the same for the DELETE handler (lines 226-231).

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add app/api/barber/availability/schedule/route.ts
git commit -m "refactor: use shared utilities in schedule route"
```

---

## Task 9: Update Auth Register Route to Return All Errors

**Files:**
- Modify: `app/api/auth/register/route.ts`

**Step 1: Add import**

Add after line 16:

```typescript
import { validationErrorResponse } from '@/lib/api/errors'
```

**Step 2: Update ZodError handler**

Replace lines 87-92:

```typescript
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
```

With:

```typescript
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error)
    }
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add app/api/auth/register/route.ts
git commit -m "refactor: return all validation errors in register route"
```

---

## Task 10: Fix Type Safety in Barber Form Components

**Files:**
- Modify: `components/barber/basic-info-step.tsx`
- Modify: `components/barber/location-step.tsx`
- Modify: `components/barber/specialties-step.tsx`
- Modify: `components/barber/review-step.tsx`

**Step 1: Update basic-info-step.tsx**

Replace lines 10 and 21-23:

```typescript
import { UseFormReturn } from 'react-hook-form'
```

```typescript
interface BasicInfoStepProps {
  form: UseFormReturn<any>
}
```

With:

```typescript
import { UseFormReturn } from 'react-hook-form'
import { BarberProfileInput } from '@/lib/validations/barber'
```

```typescript
interface BasicInfoStepProps {
  form: UseFormReturn<BarberProfileInput>
}
```

**Step 2: Update location-step.tsx**

Apply the same pattern - add the import and update the interface.

**Step 3: Update specialties-step.tsx**

Apply the same pattern - add the import and update the interface.

**Step 4: Update review-step.tsx**

Apply the same pattern - add the import and update the interface.

**Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add components/barber/basic-info-step.tsx components/barber/location-step.tsx components/barber/specialties-step.tsx components/barber/review-step.tsx
git commit -m "fix: replace any types with proper generics in barber form components"
```

---

## Task 11: Fix Type Safety in Barbers Page

**Files:**
- Modify: `app/barbers/page.tsx`

**Step 1: Add location filter type**

After the imports, add:

```typescript
type LocationFilter = 'all' | 'fixed' | 'mobile'
```

**Step 2: Update state declaration**

Find and replace:

```typescript
const [locationType, setLocationType] = useState<string>('all')
```

With:

```typescript
const [locationType, setLocationType] = useState<LocationFilter>('all')
```

**Step 3: Update onChange handler**

Find the location type select and replace the `as any` cast:

```typescript
onChange={(e) => setLocationType(e.target.value as any)}
```

With:

```typescript
onChange={(e) => setLocationType(e.target.value as LocationFilter)}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add app/barbers/page.tsx
git commit -m "fix: replace any types with proper types in barbers page"
```

---

## Task 12: Fix Type Safety in Appointments Page

**Files:**
- Modify: `app/barber/appointments/page.tsx`

**Step 1: Import BookingStatus type**

Add to imports:

```typescript
import { BookingStatus } from '@/lib/validations/booking'
```

**Step 2: Update status casting**

Find and replace:

```typescript
{ ...booking, status: newStatus as any }
```

With:

```typescript
{ ...booking, status: newStatus as BookingStatus }
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add app/barber/appointments/page.tsx
git commit -m "fix: replace any type with BookingStatus in appointments page"
```

---

## Task 13: Final Verification

**Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Run linter**

Run: `npm run lint`
Expected: No errors (warnings acceptable)

**Step 3: Verify no remaining `any` types in modified files**

Run: `grep -r "as any" app/api/bookings/route.ts app/barbers/page.tsx app/barber/appointments/page.tsx components/barber/`
Expected: No matches

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: complete code quality improvements

Summary of changes:
- Added shared time utilities (lib/utils/time.ts)
- Added shared validation constants (lib/validations/common.ts)
- Added API error utilities (lib/api/errors.ts)
- Added database constraint to prevent double-booking
- Updated all API routes to return all validation errors
- Fixed type safety issues in barber form components
- Fixed type safety issues in barbers and appointments pages"
```

---

## Summary

| Task | Description | Files Changed |
|------|-------------|---------------|
| 1 | Create time utilities module | 1 new |
| 2 | Create validation constants module | 1 new |
| 3 | Create API error utilities module | 1 new |
| 4 | Add double-booking prevention constraint | 1 new |
| 5 | Update bookings route | 1 modified |
| 6 | Update slots route | 1 modified |
| 7 | Update booking validation | 1 modified |
| 8 | Update schedule route | 1 modified |
| 9 | Update auth register route | 1 modified |
| 10 | Fix barber form component types | 4 modified |
| 11 | Fix barbers page types | 1 modified |
| 12 | Fix appointments page types | 1 modified |
| 13 | Final verification | - |

**Total: 4 new files, 11 modified files**
