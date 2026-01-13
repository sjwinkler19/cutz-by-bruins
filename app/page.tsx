import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Hero Section */}
      <div className="container px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Quality Haircuts by
          <span className="text-primary"> UCLA Students</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with talented student barbers for affordable, professional haircuts.
          Book appointments easily and support fellow Bruins.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/barbers">
            <Button size="lg">Find a Barber</Button>
          </Link>
          <Link href="/become-barber">
            <Button size="lg" variant="outline">
              Become a Barber
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container px-4 mt-20">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Affordable Prices</h3>
            <p className="text-muted-foreground">
              Student-friendly prices from $10-30, much cheaper than traditional salons.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
            <p className="text-muted-foreground">
              Browse barbers, check availability, and book appointments in minutes.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Support Students</h3>
            <p className="text-muted-foreground">
              Help fellow Bruins earn income while getting a great haircut.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
