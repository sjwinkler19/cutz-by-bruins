/**
 * EMAIL TEMPLATES
 *
 * HTML templates for transactional emails.
 * WHY: Consistent, branded email notifications to users.
 */

import { format } from 'date-fns'

/**
 * Base email wrapper with styling
 */
function emailWrapper(content: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #2563eb;
          }
          .header h1 {
            margin: 0;
            color: #2563eb;
            font-size: 28px;
          }
          .content {
            padding: 30px 0;
          }
          .booking-details {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .booking-details p {
            margin: 8px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Cutz by Bruins</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>UCLA Student Barber Marketplace</p>
          <p>Questions? Contact us at support@cutzbybruins.com</p>
        </div>
      </body>
    </html>
  `
}

/**
 * Booking confirmation email (to customer)
 */
export function bookingConfirmationEmail(data: {
  customerName: string
  barberName: string
  bookingDate: string
  startTime: string
  endTime: string
  price: number
  bookingId: string
}) {
  const content = `
    <h2>Booking Confirmed! 🎉</h2>
    <p>Hi ${data.customerName},</p>
    <p>Your haircut appointment has been successfully booked!</p>

    <div class="booking-details">
      <p><strong>Barber:</strong> ${data.barberName}</p>
      <p><strong>Date:</strong> ${format(new Date(data.bookingDate), 'EEEE, MMMM d, yyyy')}</p>
      <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
      <p><strong>Price:</strong> $${data.price}</p>
    </div>

    <p>Your barber will be notified and will confirm your appointment soon.</p>
    <p><strong>Important:</strong> Please arrive on time and have payment ready.</p>

    <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${data.bookingId}/confirmation" class="button">
      View Booking Details
    </a>

    <p>See you soon!</p>
  `

  return emailWrapper(content)
}

/**
 * New booking notification (to barber)
 */
export function newBookingNotificationEmail(data: {
  barberName: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  bookingDate: string
  startTime: string
  endTime: string
  price: number
  bookingId: string
}) {
  const content = `
    <h2>New Booking Request 📅</h2>
    <p>Hi ${data.barberName},</p>
    <p>You have a new booking request!</p>

    <div class="booking-details">
      <p><strong>Customer:</strong> ${data.customerName}</p>
      <p><strong>Email:</strong> ${data.customerEmail}</p>
      ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
      <p><strong>Date:</strong> ${format(new Date(data.bookingDate), 'EEEE, MMMM d, yyyy')}</p>
      <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
      <p><strong>Price:</strong> $${data.price}</p>
    </div>

    <p>Please confirm or decline this booking as soon as possible.</p>

    <a href="${process.env.NEXT_PUBLIC_APP_URL}/barber/appointments" class="button">
      View Appointment
    </a>
  `

  return emailWrapper(content)
}

/**
 * Booking status update email (to customer)
 */
export function bookingStatusUpdateEmail(data: {
  customerName: string
  barberName: string
  bookingDate: string
  startTime: string
  status: 'confirmed' | 'cancelled'
}) {
  const isConfirmed = data.status === 'confirmed'

  const content = `
    <h2>Booking ${isConfirmed ? 'Confirmed' : 'Cancelled'} ${isConfirmed ? '✅' : '❌'}</h2>
    <p>Hi ${data.customerName},</p>
    <p>Your appointment with ${data.barberName} has been ${data.status}.</p>

    <div class="booking-details">
      <p><strong>Barber:</strong> ${data.barberName}</p>
      <p><strong>Date:</strong> ${format(new Date(data.bookingDate), 'EEEE, MMMM d, yyyy')}</p>
      <p><strong>Time:</strong> ${data.startTime}</p>
      <p><strong>Status:</strong> ${data.status}</p>
    </div>

    ${
      isConfirmed
        ? '<p>Great! Your appointment is confirmed. Looking forward to seeing you!</p>'
        : '<p>We apologize for the inconvenience. You can browse other barbers and book a new appointment.</p>'
    }

    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
      View Dashboard
    </a>
  `

  return emailWrapper(content)
}

/**
 * Welcome email (to new users)
 */
export function welcomeEmail(data: { name: string; role: 'customer' | 'barber' }) {
  const isBarber = data.role === 'barber'

  const content = `
    <h2>Welcome to Cutz by Bruins! 👋</h2>
    <p>Hi ${data.name},</p>
    <p>Thanks for joining the UCLA Student Barber Marketplace!</p>

    ${
      isBarber
        ? `
      <p>As a barber, you can:</p>
      <ul>
        <li>Create your professional profile</li>
        <li>Set your availability and pricing</li>
        <li>Manage bookings from customers</li>
        <li>Build your client base on campus</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/become-barber" class="button">
        Create Your Profile
      </a>
    `
        : `
      <p>As a customer, you can:</p>
      <ul>
        <li>Browse talented student barbers</li>
        <li>Book appointments easily</li>
        <li>Leave reviews and ratings</li>
        <li>Support fellow Bruins</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/barbers" class="button">
        Find a Barber
      </a>
    `
    }

    <p>Questions? We're here to help!</p>
  `

  return emailWrapper(content)
}
