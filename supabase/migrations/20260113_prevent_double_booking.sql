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
