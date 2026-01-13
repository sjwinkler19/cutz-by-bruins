/**
 * FOOTER COMPONENT
 *
 * Footer displayed at the bottom of all pages.
 * WHY: Provides secondary navigation, links, and information.
 */

import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">CutzByBruins</h3>
            <p className="text-sm text-muted-foreground">
              Connecting UCLA students with affordable, quality haircuts from
              talented student barbers.
            </p>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">For Customers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/barbers"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Find Barbers
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-muted-foreground hover:text-foreground"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Barbers */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">For Barbers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/become-barber"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Become a Barber
                </Link>
              </li>
              <li>
                <Link
                  href="/barber/dashboard"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Barber Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} CutzByBruins. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
