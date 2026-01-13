# Cutz by Bruins

UCLA Student Barber Marketplace - Connect students with talented barber peers.

## Overview

Cutz by Bruins is a two-sided marketplace platform that connects UCLA students looking for haircuts with student barbers. The platform features booking management, reviews, and payment coordination.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Resend
- **Form Management**: React Hook Form + Zod
- **Deployment**: Vercel

## Features

### For Customers
- Browse and search barbers with filters
- View barber profiles with ratings and reviews
- Book appointments with real-time availability
- Manage bookings (view, cancel)
- Leave reviews after appointments

### For Barbers
- Create and manage professional profiles
- Set availability schedules
- Accept/decline booking requests
- View customer contact information
- Track appointments and earnings

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Resend account for emails (optional, [resend.com](https://resend.com))

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd CutzByBruins
npm install
```

### 2. Database Setup

1. Create a new project in [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to SQL Editor and run the migration files in order:
   ```
   supabase/migrations/20260112_initial_schema.sql
   supabase/migrations/20260113_update_price_limit.sql
   ```
3. This creates all necessary tables, indexes, triggers, and RLS policies

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your values:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (Optional)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@cutzbybruins.com
```

**Where to find Supabase credentials:**
- Go to Project Settings → API
- Copy the Project URL and anon/public key
- Copy the service_role key (keep this secret!)

**Email (Optional):**
- Sign up at [resend.com](https://resend.com)
- Get API key from dashboard
- Emails won't send without this, but the app will still work

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Quick Deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. Configure environment variables (see below)
5. Deploy!

### Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., `https://cutzbybruins.vercel.app`)

**Optional:**
- `RESEND_API_KEY` - For email notifications
- `FROM_EMAIL` - Sender email address

### Post-Deployment

1. Update `NEXT_PUBLIC_APP_URL` to your production URL
2. Redeploy to apply the change
3. Test all flows:
   - Registration and login
   - Barber profile creation
   - Booking flow
   - Email notifications (if configured)

## Project Structure

```
CutzByBruins/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── barber/         # Barber profile management
│   │   ├── barbers/        # Public barber listings
│   │   ├── bookings/       # Booking management
│   │   └── reviews/        # Review system
│   ├── barber/             # Barber dashboard pages
│   ├── barbers/            # Browse barbers
│   ├── book/               # Booking flow
│   ├── become-barber/      # Barber onboarding
│   └── [auth pages]/       # Login, register, etc.
├── components/              # React components
│   ├── ui/                 # shadcn/ui components
│   ├── barber/             # Barber-specific components
│   ├── bookings/           # Booking components
│   └── layout/             # Layout components
├── lib/                     # Utilities and configs
│   ├── auth/               # Auth helpers
│   ├── email/              # Email service and templates
│   ├── supabase/           # Supabase clients
│   ├── validations/        # Zod schemas
│   └── types/              # TypeScript types
└── supabase/
    └── migrations/          # Database migrations
```

## Key Routes

### Public Routes
- `/` - Homepage
- `/register` - Create account
- `/login` - Sign in
- `/barbers` - Browse barbers
- `/barbers/[id]` - Barber profile

### Protected Routes
- `/dashboard` - User dashboard
- `/become-barber` - Create barber profile
- `/book/[barberId]` - Book appointment
- `/barber/appointments` - Barber's appointments
- `/barber/profile` - Manage barber profile
- `/barber/availability` - Manage schedule

## Development

### Code Style

- Beginner-friendly comments explaining "why" not "what"
- Server/client component separation
- Type-safe with TypeScript
- Validated inputs with Zod schemas
- Row Level Security (RLS) for data protection

### Build and Test

```bash
# Type check
npm run build

# Development
npm run dev

# Production build
npm run build
npm start
```

### Database Migrations

When making schema changes:
1. Create a new migration file in `supabase/migrations/`
2. Name it: `YYYYMMDD_description.sql`
3. Run it in Supabase SQL Editor
4. Document the changes

## Common Issues

### "Invalid Supabase URL"
- Check that `.env.local` has correct Supabase credentials
- Ensure no typos in environment variable names

### Build Errors
- Run `npm run build` to check for TypeScript errors
- Ensure all environment variables are set

### Email Not Sending
- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for sending logs
- App works without emails, they're optional

### Authentication Issues
- Verify Supabase RLS policies are applied
- Check browser console for detailed errors
- Ensure service role key is correct

## Security Notes

- Never commit `.env.local` to git
- Keep service role key secret
- RLS policies protect all data access
- Authentication required for sensitive operations
- Input validation on both client and server

## Future Enhancements

Potential features to add:
- Real-time chat between customers and barbers
- Portfolio photo uploads
- Payment processing integration
- Push notifications
- Admin dashboard for profile approvals
- Analytics and insights

## Support

For issues or questions:
1. Check the Common Issues section above
2. Review the code comments for implementation details
3. Check Supabase and Vercel documentation

## License

This project is for UCLA student use.
