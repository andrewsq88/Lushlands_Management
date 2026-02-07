# LushLands Management - Vercel Deployment Guide

This guide will walk you through deploying your property management application to Vercel.

---

## Prerequisites

- [x] Vercel account created
- [ ] GitHub repository with your code
- [ ] Supabase project running
- [ ] Stripe live API keys ready

---

## Step 1: Push Code to GitHub

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## Step 2: Import Project to Vercel

### 2.1 Create New Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** > **"Project"**
3. Click **"Import"** next to your GitHub repository
4. If not connected, click **"Import Git Repository"** and connect GitHub

### 2.2 Configure Project Settings

Vercel will auto-detect your Vite framework. Verify these settings:

- **Framework Preset:** Vite
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

---

## Step 3: Add Environment Variables

Before deploying, add these environment variables:

1. Click **"Environment Variables"** section
2. Add the following variables:

| Name | Value | Notes |
|------|-------|-------|
| `VITE_SUPABASE_URL` | `https://chogbrfhhybftphkthpj.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Your Supabase anon key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Your Stripe LIVE publishable key |

3. Ensure all variables are added for **Production**, **Preview**, and **Development** environments

---

## Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Build your project
   - Deploy to production
3. Wait 2-3 minutes for deployment to complete
4. You'll get a URL like: `https://your-project.vercel.app`

---

## Step 5: Configure Custom Domain (Optional)

### 5.1 Add Domain

1. Go to your project in Vercel
2. Click **"Settings"** > **"Domains"**
3. Enter your domain: `lushlandsmanagement.com`
4. Click **"Add"**

### 5.2 Update DNS Records

Vercel will provide DNS configuration. At your domain registrar:

**Option A: Using Vercel Nameservers (Recommended)**
- Update nameservers to Vercel's nameservers

**Option B: Using A/CNAME Records**
- Add A record for `@` pointing to `76.76.21.21`
- Add CNAME for `www` pointing to `cname.vercel-dns.com`

### 5.3 Wait for DNS Propagation

- Usually takes 5-30 minutes
- Can take up to 48 hours in rare cases
- Check status at [DNS Checker](https://dnschecker.org)

---

## Step 6: Verify Deployment

### 6.1 Test Your Site

Visit your deployment URL and verify:

- [x] Site loads without errors
- [x] Authentication works (sign up/sign in)
- [x] Can create properties
- [x] Can add tenants
- [x] Can create maintenance requests
- [x] Payment processing works

### 6.2 Check Browser Console

1. Open DevTools (F12)
2. Check Console tab for errors
3. Verify no missing environment variables
4. Check Network tab for failed requests

---

## Step 7: Configure Stripe Webhooks

Your Stripe webhooks should point to your Supabase Edge Functions:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Live Mode**
3. Navigate to **Developers** > **Webhooks**
4. Create three webhooks:

### Webhook 1: Subscriptions
- **URL:** `https://chogbrfhhybftphkthpj.supabase.co/functions/v1/subscription-webhook`
- **Events:**
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `customer.subscription.trial_will_end`

### Webhook 2: Payments
- **URL:** `https://chogbrfhhybftphkthpj.supabase.co/functions/v1/stripe-payment-webhook`
- **Events:**
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `payment_intent.requires_action`
  - `payment_intent.canceled`

### Webhook 3: Checkout
- **URL:** `https://chogbrfhhybftphkthpj.supabase.co/functions/v1/stripe-webhook`
- **Events:**
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`

### Add Webhook Secret to Supabase

1. Copy the webhook signing secret from Stripe
2. Go to [Supabase Dashboard](https://supabase.com/dashboard)
3. Select your project
4. Navigate to **Edge Functions** > **Secrets**
5. Add: `STRIPE_WEBHOOK_SECRET` with the signing secret value

---

## Step 8: Supabase Configuration

Ensure these secrets are configured in Supabase:

1. Go to **Edge Functions** > **Secrets**
2. Verify these secrets exist:
   - `STRIPE_SECRET_KEY` - Your Stripe secret key (sk_live_...)
   - `STRIPE_WEBHOOK_SECRET` - From webhook setup above

---

## Step 9: Production Testing

### Test Authentication
1. Visit your live site
2. Sign up with a new account
3. Sign in and out
4. Verify session persistence

### Test Property Management
1. Create a new property
2. Edit property details
3. View property list
4. Delete a test property

### Test Payments
1. Navigate to upgrade/premium section
2. Use test card: `4242 4242 4242 4242`
3. Complete payment
4. Verify success
5. Check Stripe dashboard

### Test on Mobile
- iOS Safari
- Android Chrome
- Tablet devices

---

## Step 10: Monitoring

### Vercel Analytics

1. Go to your project in Vercel
2. Click **"Analytics"** tab
3. Monitor:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Deployment Logs

1. Click **"Deployments"** tab
2. Click on any deployment
3. View **"Build Logs"** for details
4. Check **"Functions"** logs (if using Vercel Functions)

### Set Up Alerts

1. Go to **"Settings"** > **"Notifications"**
2. Enable:
   - Deployment failed
   - Deployment succeeded
   - Domain configuration issues

---

## Performance Optimization

Your build is already optimized with:

- [x] Code splitting (React, UI, Supabase, Stripe vendors)
- [x] Terser minification with 2 passes
- [x] Console logs removed in production
- [x] CSS code splitting enabled
- [x] Asset inlining for small files (< 4KB)
- [x] No source maps in production
- [x] Safari 10 compatibility

### Additional Optimizations

1. **Enable Edge Network:** Vercel automatically uses edge network
2. **Image Optimization:** Use Vercel's Image Optimization (if using images)
3. **Caching:** Static assets cached automatically with `vercel.json` headers

---

## Security Configuration

Security headers are configured in `vercel.json`:

- [x] `X-Content-Type-Options: nosniff`
- [x] `X-Frame-Options: DENY`
- [x] `X-XSS-Protection: 1; mode=block`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Permissions-Policy` for camera, microphone, geolocation

### HTTPS
- Automatically enabled by Vercel
- SSL certificates auto-renewed
- HTTP to HTTPS redirect enabled

---

## Troubleshooting

### Build Fails

**Check Build Logs:**
1. Go to **Deployments**
2. Click failed deployment
3. Review **Build Logs**

**Common Issues:**
- Missing environment variables
- TypeScript errors
- Dependency installation failures
- Node version mismatch

**Solutions:**
- Verify all env vars are set
- Run `npm run build` locally first
- Check Node version (18+ required)
- Clear build cache: **Settings** > **General** > **Clear Build Cache & Redeploy**

### Site Shows White Screen

**Solutions:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify environment variables in Vercel
4. Check Supabase project is active
5. Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Environment Variables Not Working

**Solutions:**
1. Verify variable names start with `VITE_`
2. Redeploy after adding variables
3. Check variable scope (Production/Preview/Development)
4. Verify no typos in variable names

### Stripe Payments Failing

**Solutions:**
1. Verify using live keys (pk_live_... and sk_live_...)
2. Check Stripe secret in Supabase
3. Review Stripe dashboard for errors
4. Test webhooks in Stripe dashboard
5. Check browser console for Stripe.js errors

### Domain Not Working

**Solutions:**
1. Verify DNS records are correct
2. Check DNS propagation: [DNS Checker](https://dnschecker.org)
3. Wait up to 48 hours for propagation
4. Verify domain not expired
5. Check Vercel domain status in Settings

---

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. **Production Deployments:**
   - Triggered by pushes to `main` or `master` branch
   - Uses production environment variables

2. **Preview Deployments:**
   - Triggered by pull requests
   - Unique URL for each PR
   - Uses preview environment variables

3. **Branch Deployments:**
   - Each branch gets its own URL
   - Perfect for testing features

---

## Cost Optimization

### Free Tier Includes:
- 100 GB bandwidth per month
- 100 GB build execution time per month
- Unlimited deployments
- Automatic HTTPS
- Edge Network

### Monitoring Usage:
1. Go to **Settings** > **Usage**
2. Monitor bandwidth and build minutes
3. Set up spending limits if needed

---

## Maintenance Checklist

### Daily
- [ ] Check deployment status
- [ ] Monitor error logs
- [ ] Review user activity

### Weekly
- [ ] Review analytics
- [ ] Check performance metrics
- [ ] Monitor Supabase usage

### Monthly
- [ ] Update dependencies
- [ ] Review security
- [ ] Optimize performance
- [ ] Check for breaking changes

---

## Next Steps

Now that you're deployed:

1. **Share your site** with users
2. **Monitor analytics** to understand usage
3. **Gather feedback** for improvements
4. **Market your platform**
5. **Scale as needed**

---

## Resources

### Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Vite Docs](https://vitejs.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)

### Support
- [Vercel Support](https://vercel.com/support)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

## Deployment Complete!

Your LushLands Management platform is now live on Vercel!

**Features Active:**
- User authentication
- Property management
- Tenant management
- Maintenance tracking
- Payment processing
- Premium subscriptions
- Mobile responsive design
- SEO optimized
- Secure HTTPS
- Global CDN

**Enjoy your deployment!** 🎉
