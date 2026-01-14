# Code Quality Fixes Design

**Date:** 2026-01-13
**Status:** Approved
**Scope:** Quick fixes for maintainability and bug prevention

## Overview

Address high-impact code quality issues without architectural restructuring. Focus on bug prevention, type safety, and reducing duplication.

## Fixes

### Fix 1: Prevent Double-Booking Race Condition

**Problem:** Gap between checking slot availability and inserting booking allows simultaneous requests to create overlapping bookings.

**Solution:** Add database constraint that prevents overlapping confirmed/pending bookings.

```sql
CREATE UNIQUE INDEX prevent_double_booking
ON bookings (barber_id, appointment_date, appointment_time)
WHERE status IN ('pending', 'confirmed');
```

Update `app/api/bookings/route.ts` to catch constraint violation and return friendly error.

**Files:**
- New migration file
- `app/api/bookings/route.ts`

---

### Fix 2: Replace `any` Types with Proper Generics

**Problem:** Form components use `UseFormReturn<any>`, status values cast with `as any`.

**Solution:**

1. Form components - use existing `BarberProfileInput` type:
```typescript
interface BasicInfoStepProps {
  form: UseFormReturn<BarberProfileInput>
}
```

2. Create status union type in `lib/types/booking.ts`:
```typescript
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
```

3. Type filter dropdowns properly:
```typescript
type LocationFilter = 'all' | 'fixed' | 'mobile'
const [locationType, setLocationType] = useState<LocationFilter>('all')
```

**Files:**
- `components/barber/basic-info-step.tsx`
- `components/barber/location-step.tsx`
- `components/barber/specialties-step.tsx`
- `components/barber/review-step.tsx`
- `app/barbers/page.tsx`
- `app/barber/appointments/page.tsx`
- `lib/types/booking.ts` (add status type)

---

### Fix 3: Extract Time Utilities

**Problem:** `timeToMinutes`, `calculateEndTime`, `minutesToTime` duplicated in 3 files.

**Solution:** Create `lib/utils/time.ts`:

```typescript
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = startMinutes + durationMinutes
  return minutesToTime(endMinutes)
}
```

**Files:**
- `lib/utils/time.ts` (new)
- `app/api/bookings/route.ts`
- `app/api/barbers/[id]/slots/route.ts`

---

### Fix 4: Extract Validation Regex Patterns

**Problem:** Time, date, and UUID regex patterns duplicated in 4+ files.

**Solution:** Create `lib/validations/common.ts`:

```typescript
export const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const timeSchema = z.string().regex(TIME_REGEX, 'Invalid time format (HH:MM)')
export const dateSchema = z.string().regex(DATE_REGEX, 'Invalid date format (YYYY-MM-DD)')
export const uuidSchema = z.string().regex(UUID_REGEX, 'Invalid ID format')
```

**Files:**
- `lib/validations/common.ts` (new)
- `lib/validations/booking.ts`
- `app/api/barber/availability/schedule/route.ts`
- `app/api/barber/availability/exceptions/route.ts`
- `app/api/barbers/[id]/route.ts`
- `app/api/barbers/[id]/reviews/route.ts`

---

### Fix 5: Return All Validation Errors

**Problem:** API routes only return first Zod validation error, forcing users to fix and resubmit repeatedly.

**Solution:** Create `lib/api/errors.ts`:

```typescript
import { NextResponse } from 'next/server'
import { z } from 'zod'

export function validationErrorResponse(error: z.ZodError) {
  const messages = error.issues.map(issue => issue.message)
  return NextResponse.json(
    { error: messages[0], errors: messages },
    { status: 400 }
  )
}
```

Update all API routes to use this helper.

**Files:**
- `lib/api/errors.ts` (new)
- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/bookings/route.ts`
- `app/api/bookings/[id]/route.ts`
- `app/api/reviews/route.ts`
- `app/api/barber/availability/schedule/route.ts`
- `app/api/barber/availability/exceptions/route.ts`
- `app/api/barber/profile/route.ts`

---

## Out of Scope

Intentionally not included:
- Status color duplication (only 2 files, may intentionally diverge)
- Email retry logic (enhancement, not quick fix)
- Review distribution query optimization (low priority)
- Barber appointments TODO (requires new endpoint design)

## Summary

| Fix | New Files | Modified Files | Risk |
|-----|-----------|----------------|------|
| 1. Double-booking constraint | 1 migration | 1 | Low |
| 2. Type safety | 0 | 7 | Low |
| 3. Time utilities | 1 | 2 | Low |
| 4. Validation regex | 1 | 5 | Low |
| 5. Validation errors | 1 | 8 | Low |

**Total:** 4 new files, ~20 modified files
