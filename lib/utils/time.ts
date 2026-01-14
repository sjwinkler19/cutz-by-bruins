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
