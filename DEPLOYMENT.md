# Deployment Guide - Cutz by Bruins

Step-by-step guide to deploy your application to Vercel.

## Pre-Deployment Checklist

Before deploying, ensure:

- ✅ All code is committed to Git
- ✅ Database migrations are applied in Supabase
- ✅ Production build works locally (`npm run build`)
- ✅ Environment variables are ready
- ✅ Supabase project is set up
- ✅ (Optional) Resend account for emails

## Step 1: Prepare Supabase for Production

### 1.1 Verify Database Schema

In Supabase Dashboard → SQL Editor, ensure both migrations are applied:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Should show: users, barber_profiles, bookings, reviews, etc.
```

### 1.2 Verify RLS Policies

Go to Authentication → Policies and confirm all tables have RLS enabled:
- users
- barber_profiles
- bookings
- availability_schedule
- availability_exceptions
- portfolio_photos
- reviews

### 1.3 Configure Email Templates (Optional)

Go to Authentication → Email Templates and customize:
- Confirm signup
- Magic Link
- Change Email

## Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - Cutz by Bruins MVP"

# Create GitHub repo and push
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### 3.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your CutzByBruins repository

### 3.2 Configure Project

**Framework Preset:** Next.js (auto-detected)

**Build Settings:**
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**Root Directory:** `./` (leave as default)

### 3.3 Add Environment Variables

Click "Environment Variables" and add these:

#### Required Variables

```
NEXT_PUBLIC_SUPABASE_URL
```
Value: Your Supabase project URL
- Found in: Supabase Dashboard → Project Settings → API
- Example: `https://abcdefghijklmnop.supabase.co`

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Value: Your Supabase anon/public key
- Found in: Supabase Dashboard → Project Settings → API
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

```
SUPABASE_SERVICE_ROLE_KEY
```
Value: Your Supabase service role key
- Found in: Supabase Dashboard → Project Settings → API
- ⚠️ Keep this secret! Don't expose to client.
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

```
NEXT_PUBLIC_APP_URL
```
Value: Your Vercel deployment URL
- Will be provided after first deployment
- Example: `https://cutz-by-bruins.vercel.app`
- **Note:** You'll need to add this after first deployment and redeploy

#### Optional Variables (Email)

```
RESEND_API_KEY
```
Value: Your Resend API key (if using email notifications)
- Found in: Resend Dashboard → API Keys
- Example: `re_abc123...`

```
FROM_EMAIL
```
Value: Sender email address
- Example: `noreply@yourdomain.com`
- Must be a verified domain in Resend

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Your app is now live! 🎉

## Step 4: Post-Deployment Configuration

### 4.1 Update App URL

After first deployment:

1. Copy your Vercel deployment URL (e.g., `https://cutz-by-bruins.vercel.app`)
2. Go to Vercel Dashboard → Settings → Environment Variables
3. Edit `NEXT_PUBLIC_APP_URL` to your production URL
4. Click "Redeploy" to apply changes

### 4.2 Configure Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration, add:

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs:**
```
https://your-app.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

### 4.3 Set Up Custom Domain (Optional)

In Vercel Dashboard → Settings → Domains:
1. Add your custom domain
2. Configure DNS records as instructed
3. Update `NEXT_PUBLIC_APP_URL` to your custom domain
4. Redeploy

## Step 5: Verify Deployment

Test these critical flows:

### 5.1 Authentication
- [ ] Register new account
- [ ] Receive verification email
- [ ] Log in with credentials
- [ ] Log out

### 5.2 Barber Onboarding
- [ ] Access /become-barber page
- [ ] Complete all 4 steps
- [ ] Submit profile
- [ ] See pending approval message

### 5.3 Browse and Search
- [ ] Visit /barbers page
- [ ] Use filters (price, type, specialties)
- [ ] View barber detail page
- [ ] See reviews and ratings

### 5.4 Booking Flow
- [ ] Click "Book Now" on barber profile
- [ ] Select date and time
- [ ] Complete booking
- [ ] See confirmation page
- [ ] Receive email confirmation (if configured)

### 5.5 Dashboard
- [ ] View dashboard after login
- [ ] See booking list (if any)
- [ ] Navigate to profile sections

## Monitoring and Maintenance

### Vercel Dashboard

Monitor your deployment:
- **Analytics**: Page views, performance
- **Logs**: Runtime errors and warnings
- **Deployments**: History and rollbacks

### Supabase Dashboard

Monitor your database:
- **Table Editor**: View and edit data
- **SQL Editor**: Run queries
- **Logs**: API requests and errors
- **Auth**: User signups and sessions

### Common Issues

#### Build Failures

**Error: Type errors**
```
Solution: Run `npm run build` locally to fix TypeScript issues
```

**Error: Missing environment variables**
```
Solution: Verify all required env vars are set in Vercel
```

#### Runtime Issues

**Error: Supabase connection failed**
```
Solution: Check NEXT_PUBLIC_SUPABASE_URL and keys are correct
```

**Error: Email not sending**
```
Solution: Verify RESEND_API_KEY is set and domain is verified
```

**Error: 404 on dynamic routes**
```
Solution: Ensure build completed successfully, check Vercel logs
```

## Rollback Procedure

If issues occur after deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." menu → "Promote to Production"
4. Instant rollback complete

## Database Migrations in Production

When adding new features with schema changes:

1. **Test locally first:**
   ```bash
   # Run migration in local Supabase
   # Test thoroughly
   ```

2. **Backup production data:**
   - Supabase Dashboard → Database → Backups
   - Create manual backup

3. **Apply migration:**
   - Go to SQL Editor in production Supabase
   - Run migration SQL
   - Verify changes

4. **Deploy code:**
   - Push code changes to GitHub
   - Vercel auto-deploys

## Performance Optimization

### Enable Caching

Vercel automatically caches static assets. For API routes:

```typescript
// app/api/barbers/route.ts
export const revalidate = 60 // Cache for 60 seconds
```

### Database Indexing

Ensure indexes are set (already included in migrations):
- `bookings.barber_id`
- `bookings.customer_id`
- `barber_profiles.status`
- `reviews.barber_id`

### Image Optimization

Next.js automatically optimizes images. For user uploads:
- Limit file sizes
- Use WebP format
- Implement lazy loading

## Security Best Practices

- ✅ RLS policies enabled on all tables
- ✅ Service role key never exposed to client
- ✅ Input validation with Zod
- ✅ HTTPS enforced by Vercel
- ✅ Environment variables secured

## Scaling Considerations

As your app grows:

### Database
- Monitor query performance in Supabase
- Add indexes for slow queries
- Consider upgrading Supabase plan

### Hosting
- Vercel scales automatically
- Monitor bandwidth usage
- Consider Pro plan for higher limits

### Email
- Monitor Resend usage
- Upgrade plan as needed
- Consider batching notifications

## Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Resend Docs**: [resend.com/docs](https://resend.com/docs)

## Deployment Checklist

Use this before each deployment:

- [ ] Code tested locally
- [ ] `npm run build` succeeds
- [ ] All tests pass (if implemented)
- [ ] Database migrations applied
- [ ] Environment variables updated
- [ ] README and docs updated
- [ ] Git committed and pushed
- [ ] Vercel deployment successful
- [ ] Post-deployment tests passed
- [ ] Monitoring enabled
- [ ] Team notified

---

**Ready to deploy?** Follow Steps 1-5 above and your app will be live! 🚀
