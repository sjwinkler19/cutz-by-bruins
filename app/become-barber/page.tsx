/**
 * BECOME A BARBER PAGE
 *
 * Multi-step form for barbers to create their profile.
 * WHY: Guide barbers through profile setup with clear steps.
 *
 * Steps:
 * 1. Basic Information
 * 2. Location & Service Area
 * 3. Specialties & Payment
 * 4. Review & Submit
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { barberProfileSchema, type BarberProfileInput } from '@/lib/validations/barber'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Import step components
import { BasicInfoStep } from '@/components/barber/basic-info-step'
import { LocationStep } from '@/components/barber/location-step'
import { SpecialtiesStep } from '@/components/barber/specialties-step'
import { ReviewStep } from '@/components/barber/review-step'

const STEPS = [
  { id: 1, title: 'Basic Information' },
  { id: 2, title: 'Location & Service' },
  { id: 3, title: 'Specialties & Payment' },
  { id: 4, title: 'Review & Submit' },
]

export default function BecomeBarberPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form
  const form = useForm({
    resolver: zodResolver(barberProfileSchema),
    defaultValues: {
      bio: '',
      years_experience: 0,
      base_price: 20,
      location_type: 'fixed' as const,
      location_area: '',
      exact_address: '',
      service_radius_miles: undefined,
      venmo_handle: '',
      zelle_handle: '',
      instagram_handle: '',
      appointment_duration: '45' as const,
      specialties: [] as const,
    },
  })

  /**
   * Move to next step
   * Validates current step before proceeding
   */
  async function nextStep() {
    // Get fields to validate based on current step
    let fieldsToValidate: (keyof BarberProfileInput)[] = []

    if (currentStep === 1) {
      fieldsToValidate = ['bio', 'years_experience', 'base_price', 'appointment_duration']
    } else if (currentStep === 2) {
      fieldsToValidate = ['location_type', 'location_area', 'exact_address', 'service_radius_miles']
    } else if (currentStep === 3) {
      fieldsToValidate = ['specialties']
    }

    // Validate fields for current step
    const isValid = await form.trigger(fieldsToValidate)

    if (isValid) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  /**
   * Move to previous step
   */
  function previousStep() {
    setCurrentStep(currentStep - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /**
   * Submit the complete form
   */
  async function onSubmit(data: BarberProfileInput) {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/barber/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create profile')
      }

      // Success - redirect to dashboard
      router.push('/dashboard?profile_created=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-3xl py-10">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  step.id <= currentStep
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground'
                }`}
              >
                {step.id}
              </div>
              <span className="mt-2 text-sm font-medium hidden sm:block">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {STEPS[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Error message */}
              {error && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Step Content */}
              {currentStep === 1 && <BasicInfoStep form={form} />}
              {currentStep === 2 && <LocationStep form={form} />}
              {currentStep === 3 && <SpecialtiesStep form={form} />}
              {currentStep === 4 && <ReviewStep form={form} />}

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={previousStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                {currentStep < STEPS.length ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Profile'}
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  )
}
