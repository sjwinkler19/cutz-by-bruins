/**
 * BASIC INFO STEP
 *
 * Step 1 of barber profile creation - basic information.
 * WHY: Collect core profile details about the barber.
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

interface BasicInfoStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  return (
    <div className="space-y-4">
      {/* Bio */}
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell customers about your barbering experience and style..."
                {...field}
              />
            </FormControl>
            <FormDescription>
              50-150 characters. Describe your experience and what makes you unique.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Years of Experience */}
      <FormField
        control={form.control}
        name="years_experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Years of Experience</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormDescription>
              How many years have you been cutting hair?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Base Price */}
      <FormField
        control={form.control}
        name="base_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Base Price ($)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                max="500"
                step="0.01"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 20)}
              />
            </FormControl>
            <FormDescription>
              Your standard haircut price (free to $500, you decide)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Appointment Duration */}
      <FormField
        control={form.control}
        name="appointment_duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Appointment Duration (minutes)</FormLabel>
            <FormControl>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...field}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </FormControl>
            <FormDescription>
              How long does a typical appointment take?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
