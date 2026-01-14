/**
 * EMAIL SERVICE
 *
 * Send transactional emails using Resend.
 * WHY: Notify users about bookings and account events.
 *
 * To use:
 * 1. Sign up at resend.com
 * 2. Get API key from dashboard
 * 3. Add RESEND_API_KEY to .env.local
 */

import { Resend } from 'resend'

// Lazy-initialize Resend to avoid build-time errors when API key not available
let resend: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

/**
 * Send an email
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML content of the email
 * @returns Promise that resolves when email is sent
 */
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const client = getResendClient()

    // Skip if no API key configured
    if (!client) {
      console.warn('Resend API key not configured - email not sent')
      return null
    }

    const data = await client.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@cutzbybruins.com',
      to,
      subject,
      html,
    })

    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}
