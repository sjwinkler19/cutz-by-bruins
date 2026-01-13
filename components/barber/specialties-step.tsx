/**
 * SPECIALTIES STEP
 *
 * Step 3 of barber profile creation - specialties and payment info.
 * WHY: Let customers know what services you offer and how to pay.
 */

'use client'

import { UseFormReturn } from 'react-hook-form'
import { BarberProfileInput } from '@/lib/validations/barber'
import { Input } from '@/components/ui/input'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'

interface SpecialtiesStepProps {
  form: UseFormReturn<BarberProfileInput>
}

const SPECIALTIES = [
  { value: 'fades', label: 'Fades' },
  { value: 'long_hair', label: 'Long Hair' },
  { value: 'womens_cuts', label: "Women's Cuts" },
  { value: 'beard_trim', label: 'Beard Trim' },
  { value: 'designs', label: 'Designs' },
  { value: 'black_hair', label: 'Black Hair' },
  { value: 'asian_hair', label: 'Asian Hair' },
  { value: 'curly_hair', label: 'Curly Hair' },
  { value: 'buzz_cuts', label: 'Buzz Cuts' },
] as const

export function SpecialtiesStep({ form }: SpecialtiesStepProps) {
  return (
    <div className="space-y-6">
      {/* Specialties */}
      <FormField
        control={form.control}
        name="specialties"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your Specialties</FormLabel>
            <FormDescription>
              Select all that apply (at least one required)
            </FormDescription>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {SPECIALTIES.map((specialty) => (
                <label
                  key={specialty.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={field.value?.includes(specialty.value)}
                    onChange={(e) => {
                      const currentSpecialties = field.value || []
                      if (e.target.checked) {
                        field.onChange([...currentSpecialties, specialty.value])
                      } else {
                        field.onChange(
                          currentSpecialties.filter((s) => s !== specialty.value)
                        )
                      }
                    }}
                  />
                  <span className="text-sm">{specialty.label}</span>
                </label>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Payment Information */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Payment Information</h3>
        <p className="text-sm text-muted-foreground">
          Provide at least one payment method for customers to pay you after service.
        </p>

        {/* Venmo */}
        <FormField
          control={form.control}
          name="venmo_handle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Venmo Handle (optional)</FormLabel>
              <FormControl>
                <Input placeholder="@username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Zelle */}
        <FormField
          control={form.control}
          name="zelle_handle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zelle Email/Phone (optional)</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com or phone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Instagram */}
        <FormField
          control={form.control}
          name="instagram_handle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram Handle (optional)</FormLabel>
              <FormControl>
                <Input placeholder="@username" {...field} />
              </FormControl>
              <FormDescription>
                Showcase your work and build trust
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
