/**
 * LOCATION STEP
 *
 * Step 2 of barber profile creation - location and service area.
 * WHY: Determine if barber has a fixed location or is mobile.
 */

'use client'

import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'

interface LocationStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
}

export function LocationStep({ form }: LocationStepProps) {
  const locationType = form.watch('location_type')

  return (
    <div className="space-y-4">
      {/* Location Type */}
      <FormField
        control={form.control}
        name="location_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Type</FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center rounded-md border-2 p-4 transition-colors ${
                    field.value === 'fixed'
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-muted-foreground'
                  }`}
                  onClick={() => field.onChange('fixed')}
                >
                  <span className="text-2xl mb-2">🏠</span>
                  <span className="font-medium">Fixed Location</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Customers come to you
                  </span>
                </button>
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center rounded-md border-2 p-4 transition-colors ${
                    field.value === 'mobile'
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-muted-foreground'
                  }`}
                  onClick={() => field.onChange('mobile')}
                >
                  <span className="text-2xl mb-2">🚗</span>
                  <span className="font-medium">Mobile Service</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    You go to customers
                  </span>
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Fixed Location Fields */}
      {locationType === 'fixed' && (
        <>
          <FormField
            control={form.control}
            name="location_area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>General Area</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Westwood Village" {...field} />
                </FormControl>
                <FormDescription>
                  General area shown publicly (e.g., neighborhood)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="exact_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exact Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Bruin Way, Los Angeles, CA 90024" {...field} />
                </FormControl>
                <FormDescription>
                  Full address (only shared after booking confirmed)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {/* Mobile Service Fields */}
      {locationType === 'mobile' && (
        <FormField
          control={form.control}
          name="service_radius_miles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Radius (miles)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  placeholder="5"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                />
              </FormControl>
              <FormDescription>
                How far are you willing to travel from campus?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}
