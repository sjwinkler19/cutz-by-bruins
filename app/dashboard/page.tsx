/**
 * DASHBOARD PAGE
 *
 * Main dashboard for authenticated users.
 * WHY: Central hub after login - shows different content based on user role.
 *
 * - Customers see their bookings
 * - Barbers see their appointments and profile management
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { BookingsList } from '@/components/bookings/bookings-list'

export default async function DashboardPage() {
  // Get current user (server-side)
  const user = await getCurrentUser()

  // If not logged in, redirect to login page
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {user.first_name}!
        </h1>
        <p className="text-muted-foreground">
          Manage your account and bookings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
            <CardDescription>Account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-muted-foreground">
                {user.first_name} {user.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Role</p>
              <p className="text-muted-foreground capitalize">{user.role}</p>
            </div>
            {user.phone && (
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-muted-foreground">{user.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>What would you like to do?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.role === 'customer' && (
              <>
                <Link href="/barbers" className="block">
                  <Button className="w-full" variant="default">
                    Find a Barber
                  </Button>
                </Link>
                <Link href="/become-barber" className="block">
                  <Button className="w-full" variant="outline">
                    Become a Barber
                  </Button>
                </Link>
              </>
            )}
            {user.role === 'barber' && (
              <>
                <Link href="/barber/appointments" className="block">
                  <Button className="w-full" variant="default">
                    View Appointments
                  </Button>
                </Link>
                <Link href="/barber/profile" className="block">
                  <Button className="w-full" variant="outline">
                    Manage Profile
                  </Button>
                </Link>
                <Link href="/barber/availability" className="block">
                  <Button className="w-full" variant="outline">
                    Update Availability
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bookings Section - Only for customers */}
      {user.role === 'customer' && (
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>View and manage your appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingsList />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
