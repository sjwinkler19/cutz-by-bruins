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
import { getCurrentUser } from '@/lib/auth/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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

      <div className="grid gap-6 md:grid-cols-2">
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
                <Button className="w-full" variant="default">
                  Find a Barber
                </Button>
                <Button className="w-full" variant="outline">
                  View My Bookings
                </Button>
                <Button className="w-full" variant="outline">
                  Become a Barber
                </Button>
              </>
            )}
            {user.role === 'barber' && (
              <>
                <Button className="w-full" variant="default">
                  View Appointments
                </Button>
                <Button className="w-full" variant="outline">
                  Manage Profile
                </Button>
                <Button className="w-full" variant="outline">
                  Update Availability
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
