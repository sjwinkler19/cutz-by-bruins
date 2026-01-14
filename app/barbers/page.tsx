/**
 * BARBERS LISTING PAGE
 *
 * Browse and search for barbers with filtering.
 * WHY: Help customers find barbers that match their needs.
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { BarberCard } from '@/components/barbers/barber-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Specialty options for filters
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
]

type LocationFilter = 'all' | 'fixed' | 'mobile'

interface Barber {
  id: string
  user: {
    full_name: string
  }
  bio: string
  years_experience: number
  base_price: number
  location_area: string | null
  location_type: 'fixed' | 'mobile'
  average_rating: number | null
  total_reviews: number
  specialties: string[]
}

function BarbersPageContent() {
  const searchParams = useSearchParams()

  // State
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')
  const [locationType, setLocationType] = useState<LocationFilter>(
    (searchParams.get('location_type') as LocationFilter) || 'all'
  )
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    searchParams.get('specialties')?.split(',').filter(Boolean) || []
  )

  /**
   * Fetch barbers with current filters
   */
  async function fetchBarbers() {
    setIsLoading(true)
    setError(null)

    try {
      // Build query params
      const params = new URLSearchParams()

      if (searchQuery) params.append('search', searchQuery)
      if (minPrice) params.append('min_price', minPrice)
      if (maxPrice) params.append('max_price', maxPrice)
      if (locationType !== 'all') params.append('location_type', locationType)
      if (selectedSpecialties.length > 0) {
        params.append('specialties', selectedSpecialties.join(','))
      }

      const response = await fetch(`/api/barbers?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch barbers')
      }

      setBarbers(data.barbers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch barbers on mount and when filters change
  useEffect(() => {
    fetchBarbers()
  }, []) // Initial load

  /**
   * Handle filter form submission
   */
  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchBarbers()
  }

  /**
   * Toggle specialty filter
   */
  function toggleSpecialty(specialty: string) {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    )
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    setSearchQuery('')
    setMinPrice('')
    setMaxPrice('')
    setLocationType('all')
    setSelectedSpecialties([])
    // Re-fetch with cleared filters
    setTimeout(() => fetchBarbers(), 0)
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Find Your Barber</h1>
        <p className="text-muted-foreground">
          Browse UCLA student barbers and book your next haircut
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input
                    type="text"
                    placeholder="Search barbers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      min="0"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                {/* Location Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Service Type</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="location_type"
                        value="all"
                        checked={locationType === 'all'}
                        onChange={(e) => setLocationType(e.target.value as LocationFilter)}
                        className="mr-2"
                      />
                      All
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="location_type"
                        value="fixed"
                        checked={locationType === 'fixed'}
                        onChange={(e) => setLocationType(e.target.value as LocationFilter)}
                        className="mr-2"
                      />
                      Fixed Location
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="location_type"
                        value="mobile"
                        checked={locationType === 'mobile'}
                        onChange={(e) => setLocationType(e.target.value as LocationFilter)}
                        className="mr-2"
                      />
                      Mobile Service
                    </label>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Specialties</label>
                  <div className="space-y-2">
                    {SPECIALTIES.map((specialty) => (
                      <label key={specialty.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSpecialties.includes(specialty.value)}
                          onChange={() => toggleSpecialty(specialty.value)}
                          className="mr-2"
                        />
                        {specialty.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button type="submit" className="w-full">
                    Apply Filters
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </aside>

        {/* Barbers Grid */}
        <div className="lg:col-span-3">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading barbers...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Results Count */}
          {!isLoading && !error && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Found {barbers.length} {barbers.length === 1 ? 'barber' : 'barbers'}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && barbers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No barbers found matching your criteria
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          )}

          {/* Barbers Grid */}
          {!isLoading && !error && barbers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {barbers.map((barber) => (
                <BarberCard key={barber.id} barber={barber} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BarbersPage() {
  return (
    <Suspense fallback={<div className="container py-10 text-center">Loading...</div>}>
      <BarbersPageContent />
    </Suspense>
  )
}
