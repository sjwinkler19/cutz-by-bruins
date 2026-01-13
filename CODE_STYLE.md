# Code Style Guide - CutzByBruins

## Target Audience
This codebase is written for developers learning web development who understand basic JavaScript but may not be familiar with advanced patterns.

## Core Principle
**Write code that teaches.** Every file should be understandable by someone new to the codebase.

---

## 1. Comment Philosophy: WHAT and WHY, Not Just HOW

### ✅ Good
```javascript
// Calculate total price including tax and service fee
// WHY: Customers need to see the full cost upfront before booking
const totalPrice = basePrice + tax + serviceFee;
```

### ❌ Bad
```javascript
// Add three numbers together
const totalPrice = basePrice + tax + serviceFee;
```

---

## 2. Function Documentation

Every function must have a comment block explaining:
- **What it does** (high-level purpose)
- **Parameters** (what each parameter represents)
- **Returns** (what the function gives back)
- **Example usage** (if not immediately obvious)

### Template
```javascript
/**
 * [What this function does]
 *
 * @param {Type} paramName - Description of what this parameter represents
 * @returns {Type} Description of what gets returned
 *
 * @example
 * functionName(exampleInput) // => exampleOutput
 */
function functionName(paramName) {
  // implementation
}
```

### Example
```javascript
/**
 * Calculates the final appointment price including tax and service fees
 *
 * @param {number} basePrice - The base cost of the haircut service in dollars
 * @param {number} taxRate - Tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns {number} Total price in dollars rounded to 2 decimal places
 *
 * @example
 * calculateTotal(25, 0.08) // => 27.00
 */
function calculateTotal(basePrice, taxRate) {
  const tax = basePrice * taxRate;
  return Math.round((basePrice + tax) * 100) / 100;
}
```

---

## 3. Inline Comments for Complex Logic

Add comments to explain **why** you made a choice, especially for:
- Non-obvious algorithms
- Business logic decisions
- Edge case handling
- Performance optimizations

### Example
```javascript
// Check if the time slot is available
// WHY: We need to ensure no double-bookings and leave 15min buffer between appointments
if (isSlotAvailable(requestedTime) && hasBufferTime(requestedTime, 15)) {
  bookAppointment(requestedTime);
}
```

---

## 4. Descriptive Variable Names

Use full, descriptive names that explain what the variable represents.

### ✅ Good
```javascript
const availableTimeSlots = [];
const userAppointmentHistory = [];
const isAppointmentConfirmed = false;
```

### ❌ Bad
```javascript
const ats = [];
const uah = [];
const isConf = false;
```

**Exception:** Common loop counters (`i`, `j`) and standard conventions (`err`, `req`, `res`) are acceptable.

---

## 5. Break Complex Functions into Smaller Helpers

If a function does more than one conceptual task, break it into smaller, well-named helper functions.

### ✅ Good
```javascript
/**
 * Processes a new appointment booking
 * Validates availability, calculates price, and creates the booking record
 */
function processAppointmentBooking(appointmentData) {
  const isValid = validateAppointmentRequest(appointmentData);
  if (!isValid) return { error: 'Invalid appointment data' };

  const totalPrice = calculateAppointmentPrice(appointmentData);
  const booking = createBookingRecord(appointmentData, totalPrice);

  return { success: true, booking };
}

// Helper function with clear, single responsibility
function validateAppointmentRequest(data) {
  return data.time && data.service && data.customerName;
}
```

### ❌ Bad
```javascript
// One giant function doing everything
function processAppointmentBooking(appointmentData) {
  // 100 lines of validation, calculation, and creation logic all mixed together
}
```

---

## 6. TODO Comments for Future Improvements

Mark areas that need future work with TODO comments:

```javascript
// TODO: Add email notification when appointment is confirmed
// TODO: Implement recurring appointment feature
// TODO: Add support for multiple barbers scheduling
```

**Format:** `// TODO: [Brief description of what needs to be done]`

---

## 7. File-Level Documentation

Every file should start with a comment explaining its purpose:

```javascript
/**
 * APPOINTMENT BOOKING SYSTEM
 *
 * This file handles all appointment booking logic including:
 * - Checking time slot availability
 * - Calculating appointment prices
 * - Creating booking records in the database
 *
 * Used by: booking-form.js, admin-dashboard.js
 */
```

---

## Quick Checklist

Before committing code, ask yourself:

- [ ] Would someone new to coding understand what this function does?
- [ ] Have I explained WHY I made non-obvious choices?
- [ ] Are my variable names descriptive enough?
- [ ] Could any complex function be broken into smaller helpers?
- [ ] Have I documented all function parameters and return values?
- [ ] Are there any TODOs I should add for future improvements?

---

## Remember

**Good code teaches. Great code teaches well.**

When in doubt, add a comment explaining your reasoning. Future you (and your teammates) will thank you.
