# LushLands Management - Deployment Guide

## Prerequisites

Before deploying to production, ensure you have:

1. **Stripe Account & API Keys**
   - Stripe Publishable Key (starts with `pk_`)
   - Stripe Secret Key (starts with `sk_`) - Configure in Supabase Dashboard
   - Stripe Webhook Secret (starts with `whsec_`) - Configure in Supabase Dashboard

2. **Supabase Project**
   - Project URL and Anon Key (already configured)
   - All database migrations applied (✓ Complete)
   - All Edge Functions deployed (✓ Complete)

3. **Optional API Keys**
   - ElevenLabs API Key (for voiceover generation) - Configure in Supabase Dashboard
   - Tavus API Key (for video generation) - Configure in Supabase Dashboard
   - Google Analytics 4 Measurement ID (for analytics tracking)

## Environment Variables Setup

### For Local Development

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `VITE_SUPABASE_URL` - Already configured
- `VITE_SUPABASE_ANON_KEY` - Already configured
- `VITE_STRIPE_PUBLISHABLE_KEY` - **ADD YOUR STRIPE PUBLISHABLE KEY**

### For Netlify Deployment

In your Netlify dashboard, go to Site settings > Environment variables and add:

1. `VITE_SUPABASE_URL` = https://chogbrfhhybftphkthpj.supabase.co
2. `VITE_SUPABASE_ANON_KEY` = (your anon key)
3. `VITE_STRIPE_PUBLISHABLE_KEY` = **YOUR STRIPE PUBLISHABLE KEY**

## Supabase Edge Functions Configuration

In your Supabase Dashboard > Edge Functions > Secrets, add:

1. `STRIPE_SECRET_KEY` - Your Stripe secret key
2. `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook signing secret
3. `ELEVENLABS_API_KEY` - Your ElevenLabs API key (optional)
4. `TAVUS_API_KEY` - Your Tavus API key (optional)

**Note:** Environment variables like `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are automatically available in Edge Functions.

## Stripe Webhook Setup

Create webhooks in your Stripe Dashboard pointing to:

1. **Subscription Webhook**
   - URL: `https://chogbrfhhybftphkthpj.supabase.co/functions/v1/subscription-webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

2. **Payment Webhook**
   - URL: `https://chogbrfhhybftphkthpj.supabase.co/functions/v1/stripe-payment-webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

3. **General Webhook**
   - URL: `https://chogbrfhhybftphkthpj.supabase.co/functions/v1/stripe-webhook`
   - Events: All checkout and payment events

Save the webhook signing secrets and add them to Supabase secrets.

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard

1. Push your code to GitHub
2. In Netlify, click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables (see above)
6. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

### Option 3: Deploy via Bolt

If using Bolt's deployment feature, the platform will handle the deployment automatically.

## Custom Domain Setup

1. In Netlify Dashboard, go to Domain settings
2. Add custom domain: `www.lushlandsmanagement.com`
3. Follow DNS configuration instructions
4. Enable HTTPS (automatic with Netlify)

## Post-Deployment Checklist

- [ ] Add your Stripe publishable key to environment variables
- [ ] Configure Stripe webhooks
- [ ] Add Stripe secrets to Supabase Dashboard
- [ ] Test user authentication flow
- [ ] Test property CRUD operations
- [ ] Test tenant screening (if API keys configured)
- [ ] Test payment processing
- [ ] Verify maintenance requests work
- [ ] Enable Google Analytics (optional)
- [ ] Test all premium features
- [ ] Monitor Sentry for errors
- [ ] Check Supabase logs for Edge Function errors

## Monitoring & Error Tracking

### Sentry
- Error tracking is configured and will automatically report errors in production
- View errors at your Sentry dashboard

### Supabase Logs
- Monitor Edge Function execution at: Supabase Dashboard > Edge Functions > Logs
- Monitor database queries at: Supabase Dashboard > Database > Logs

### Netlify Analytics
- View deployment logs and analytics in Netlify Dashboard

## Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use Stripe test keys** during development
3. **Enable RLS** on all tables (✓ Already configured)
4. **Keep Supabase secrets secure** - Only add them via Dashboard UI
5. **Rotate keys** if compromised

## Troubleshooting

### Build Fails
- Check Node version (requires v18+)
- Verify all dependencies installed: `npm install`
- Check build logs in Netlify

### Authentication Issues
- Verify Supabase URL and keys are correct
- Check if email confirmation is required (currently disabled)
- Review Supabase Auth logs

### Payment Issues
- Verify Stripe keys are correct (test vs production)
- Check Stripe webhook delivery status
- Review Edge Function logs for errors

### Edge Function Errors
- Check Supabase Edge Function logs
- Verify all required secrets are configured
- Test functions individually via Supabase Dashboard

## Support

For issues or questions:
1. Check Supabase logs
2. Review Sentry error reports
3. Check Netlify deployment logs
4. Review this documentation

## Current Status

✓ Database schema created
✓ All Edge Functions deployed
✓ Sentry error monitoring integrated
✓ Netlify configuration file created
✓ Security headers configured
✓ SEO optimization complete
✓ PWA meta tags configured

⚠️ **Required Before Production:**
- Add Stripe publishable key to environment variables
- Configure Stripe webhook secrets in Supabase
- (Optional) Add Google Analytics ID
- (Optional) Add ElevenLabs and Tavus API keys for premium features
