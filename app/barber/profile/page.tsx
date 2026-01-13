/**
 * BARBER PROFILE MANAGEMENT PAGE
 *
 * View and edit barber profile information.
 * WHY: Let barbers update their profile details and settings.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BarberProfile {
  id: string
  bio: string
  years_experience: number
  base_price: number
  appointment_duration: number
  location_type: 'fixed' | 'mobile'
  location_area: string | null
  exact_address: string | null
  service_radius_miles: number | null
  venmo_handle: string | null
  zelle_handle: string | null
  instagram_handle: string | null
  specialties: string[]
  status: string
}

export default function BarberProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<BarberProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch barber profile
   */
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/barber/profile')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile')
        }

        setProfile(data.profile)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Error state - no profile
  if (error || !profile) {
    return (
      <div className="container py-10">
        <div className="rounded-md bg-muted p-4 mb-4">
          <p className="mb-2">You haven't created a barber profile yet.</p>
          <Button onClick={() => router.push('/become-barber')}>
            Create Barber Profile
          </Button>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">View and manage your barber profile</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="mb-6">
        {profile.status === 'pending' && (
          <div className="rounded-md bg-yellow-100 p-4 text-sm text-yellow-700">
            Your profile is pending approval. We'll notify you once it's reviewed (usually within
            24-48 hours).
          </div>
        )}
        {profile.status === 'approved' && (
          <div className="rounded-md bg-green-100 p-4 text-sm text-green-700">
            ✓ Your profile is approved and visible to customers!
          </div>
        )}
        {profile.status === 'rejected' && (
          <div className="rounded-md bg-red-100 p-4 text-sm text-red-700">
            Your profile was not approved. Please contact support for more information.
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bio</p>
              <p>{profile.bio}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Experience</p>
                <p>{profile.years_experience} years</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Base Price</p>
                <p>${profile.base_price}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Appointment Duration</p>
                <p>{profile.appointment_duration} minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Service */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Service Type</p>
              <p>{profile.location_type === 'fixed' ? 'Fixed Location' : 'Mobile Service'}</p>
            </div>
            {profile.location_type === 'fixed' ? (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Area</p>
                  <p>{profile.location_area}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p>{profile.exact_address}</p>
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Service Radius</p>
                <p>{profile.service_radius_miles} miles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card>
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {specialty.replace('_', ' ')}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile.venmo_handle && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Venmo</p>
                <p>@{profile.venmo_handle}</p>
              </div>
            )}
            {profile.zelle_handle && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Zelle</p>
                <p>{profile.zelle_handle}</p>
              </div>
            )}
            {profile.instagram_handle && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Instagram</p>
                <p>@{profile.instagram_handle}</p>
              </div>
            )}
            {!profile.venmo_handle && !profile.zelle_handle && !profile.instagram_handle && (
              <p className="text-muted-foreground">No payment methods provided</p>
            )}
          </CardContent>
        </Card>

        {/* Edit Note */}
        <div className="rounded-md bg-muted p-4 text-sm text-center">
          <p>
            Profile editing will be available in a future update. Contact support if you need to
            make changes.
          </p>
        </div>
      </div>
    </div>
  )
}
