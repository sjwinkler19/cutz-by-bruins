/**
 * HEADER COMPONENT
 *
 * Main navigation header displayed across all pages.
 * WHY: Consistent navigation and branding throughout the app.
 *
 * Includes:
 * - Logo/brand
 * - Main navigation links
 * - User account menu
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold">CutzByBruins</span>
        </Link>

        {/* Main Navigation */}
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link
            href="/barbers"
            className="transition-colors hover:text-foreground/80"
          >
            Find Barbers
          </Link>
          <Link
            href="/become-barber"
            className="transition-colors hover:text-foreground/80"
          >
            Become a Barber
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link href="/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
