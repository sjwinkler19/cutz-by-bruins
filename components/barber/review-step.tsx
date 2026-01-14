/**
 * REVIEW STEP
 *
 * Step 4 of barber profile creation - review all information.
 * WHY: Let barbers review their profile before submitting.
 */

'use client'

import { UseFormReturn } from 'react-hook-form'

interface ReviewStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
}

export function ReviewStep({ form }: ReviewStepProps) {
  const values = form.getValues()

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Please review your information before submitting. You can go back to edit any section.
      </p>

      {/* Basic Information */}
      <div className="rounded-lg border p-4 space-y-2">
        <h3 className="font-semibold">Basic Information</h3>
        <div className="text-sm space-y-1">
          <p>
            <span className="font-medium">Bio:</span> {values.bio}
          </p>
          <p>
            <span className="font-medium">Experience:</span> {values.years_experience} years
          </p>
          <p>
            <span className="font-medium">Base Price:</span> ${values.base_price}
          </p>
          <p>
            <span className="font-medium">Appointment Duration:</span> {values.appointment_duration} minutes
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="rounded-lg border p-4 space-y-2">
        <h3 className="font-semibold">Location & Service</h3>
        <div className="text-sm space-y-1">
          <p>
            <span className="font-medium">Service Type:</span>{' '}
            {values.location_type === 'fixed' ? 'Fixed Location' : 'Mobile Service'}
          </p>
          {values.location_type === 'fixed' ? (
            <>
              <p>
                <span className="font-medium">Area:</span> {values.location_area}
              </p>
              <p>
                <span className="font-medium">Address:</span> {values.exact_address}
              </p>
            </>
          ) : (
            <p>
              <span className="font-medium">Service Radius:</span> {values.service_radius_miles} miles
            </p>
          )}
        </div>
      </div>

      {/* Specialties */}
      <div className="rounded-lg border p-4 space-y-2">
        <h3 className="font-semibold">Specialties</h3>
        <div className="flex flex-wrap gap-2">
          {values.specialties?.map((specialty: string) => (
            <span
              key={specialty}
              className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            >
              {specialty.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Payment Information */}
      <div className="rounded-lg border p-4 space-y-2">
        <h3 className="font-semibold">Payment Information</h3>
        <div className="text-sm space-y-1">
          {values.venmo_handle && (
            <p>
              <span className="font-medium">Venmo:</span> {values.venmo_handle}
            </p>
          )}
          {values.zelle_handle && (
            <p>
              <span className="font-medium">Zelle:</span> {values.zelle_handle}
            </p>
          )}
          {values.instagram_handle && (
            <p>
              <span className="font-medium">Instagram:</span> {values.instagram_handle}
            </p>
          )}
          {!values.venmo_handle && !values.zelle_handle && !values.instagram_handle && (
            <p className="text-muted-foreground">No payment methods provided</p>
          )}
        </div>
      </div>

      {/* Important Notice */}
      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm">
          <strong>Note:</strong> Your profile will be reviewed by our team before going live.
          You'll receive an email notification once approved (usually within 24-48 hours).
        </p>
      </div>
    </div>
  )
}
