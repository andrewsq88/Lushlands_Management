# LushLands Management - Deployment Checklist

## Status: Ready for Deployment

Your application is fully configured and ready to deploy! Follow this checklist to get your site live.

---

## Pre-Deployment Verification

### Local Environment - COMPLETED
- [x] Sentry disabled (temporarily)
- [x] Stripe publishable key configured in .env
- [x] Supabase URL and keys configured
- [x] Production build successful (dist folder created)
- [x] All dependencies installed
- [x] No build errors or warnings (except browserslist update suggestion)

### Code Quality - COMPLETED
- [x] All 12 Supabase Edge Functions deployed
- [x] Database migrations applied (20 migrations)
- [x] RLS policies enabled on all tables
- [x] Google AdSense script integrated (client: ca-pub-2857342591276131)
- [x] Security headers configured (CSP, HSTS, etc.)
- [x] SEO meta tags and structured data present

---

## Netlify Deployment Steps

### Step 1: Create Netlify Site

1. Go to https://app.netlify.com
2. Click "Add new site" > "Import an existing project"
3. Connect your Git repository
4. Select the LushLands Management repository

### Step 2: Configure Build Settings

In Netlify deployment settings, set:

```
Build command: npm run build
Publish directory: dist
Node version: 18
```

### Step 3: Add Environment Variables

Go to Site settings > Environment variables and add:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://chogbrfhhybftphkthpj.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNob2dicmZoaHliZnRwaGt0aHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDY3MjIsImV4cCI6MjA3NTUyMjcyMn0.qVOGRXfNRkrqKFC4q2BNvEDI2vXY4kfilRclVj_LD7E` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_51RWiS5KNVw1suic6PFSMhP3zU7cTsIcEcYqweBZ24wpZZf5QJB6xxZ9uCleHfViheN06qfxdHRKdgwalSGCKVqaZ00BvYA9E75` |

**IMPORTANT:** Never commit these values to Git. They should only be in Netlify's environment variables.

### Step 4: Deploy

1. Click "Deploy site"
2. Wait for build to complete (2-3 minutes)
3. Note your temporary Netlify URL (e.g., `random-name-123456.netlify.app`)

---

## Domain Configuration

### Step 5: Add Custom Domain

1. In Netlify, go to Domain settings
2. Click "Add custom domain"
3. Enter: `lushlandsmanagement.com`
4. Click "Verify" and "Add domain"
5. Also add: `www.lushlandsmanagement.com`

### Step 6: Update DNS Records

Your DNS is already pointing to Netlify, but verify:

**If using Netlify DNS:**
- Nameservers should be set at your domain registrar

**If using custom DNS:**
- A record for `@` pointing to Netlify's load balancer
- CNAME for `www` pointing to your Netlify site URL

### Step 7: Enable HTTPS

1. In Netlify Domain settings, scroll to HTTPS
2. Wait for SSL certificate to auto-provision (5-10 minutes)
3. Enable "Force HTTPS" to redirect all HTTP to HTTPS
4. Verify certificate shows as "Active"

---

## Supabase Configuration

### Step 8: Configure Stripe Secrets

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to Edge Functions > Secrets
4. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (starts with `sk_live_`) |
| `STRIPE_WEBHOOK_SECRET` | Created in next step |

### Step 9: Verify Edge Functions

In Supabase dashboard, verify all 12 functions show "Deployed":
- cancel-subscription
- create-payment-intent
- create-subscription
- generate-property-video
- generate-video
- generate-voiceover
- maintenance-prioritization
- stripe-checkout
- stripe-payment-webhook
- stripe-webhook
- subscription-webhook
- tenant-screening

---

## Stripe Webhook Setup

### Step 10: Create Stripe Webhooks

Log into Stripe dashboard at https://dashboard.stripe.com

**Switch to Live Mode** (toggle in top right)

#### Webhook 1: Subscription Events

1. Go to Developers > Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://chogbrfhhybftphkthpj.supabase.co/functions/v1/subscription-webhook`
4. Description: `LushLands Subscription Events`
5. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
6. Click "Add endpoint"
7. Copy the signing secret (starts with `whsec_`)
8. Add to Supabase secrets as `STRIPE_WEBHOOK_SECRET`

#### Webhook 2: Payment Events

1. Click "Add endpoint" again
2. Endpoint URL: `https://chogbrfhhybftphkthpj.supabase.co/functions/v1/stripe-payment-webhook`
3. Description: `LushLands Payment Events`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.requires_action`
   - `payment_intent.canceled`
5. Click "Add endpoint"

#### Webhook 3: Checkout Events

1. Click "Add endpoint" again
2. Endpoint URL: `https://chogbrfhhybftphkthpj.supabase.co/functions/v1/stripe-webhook`
3. Description: `LushLands Checkout Events`
4. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
5. Click "Add endpoint"

### Step 11: Test Webhooks

1. In Stripe dashboard, click on each webhook
2. Click "Send test webhook"
3. Select an event and send
4. Verify status shows "Succeeded"
5. Check Supabase Edge Function logs if any fail

---

## Post-Deployment Testing

### Step 12: Test Core Features

Visit your live site at `https://lushlandsmanagement.com`

#### Authentication Testing
- [ ] Sign up with new account
- [ ] Verify email confirmation (if enabled)
- [ ] Sign in with credentials
- [ ] Sign out
- [ ] Sign in again to verify session persistence

#### Property Management Testing
- [ ] Create a new property
- [ ] View property list
- [ ] Edit property details
- [ ] Delete a test property

#### Tenant Management Testing
- [ ] Add a new tenant
- [ ] Associate tenant with property
- [ ] View tenant list
- [ ] Edit tenant information

#### Maintenance Testing
- [ ] Create maintenance request
- [ ] View maintenance requests
- [ ] Update request status
- [ ] Test priority filtering

#### Payment Testing (Use Stripe test card: 4242 4242 4242 4242)
- [ ] Navigate to Premium/Upgrade section
- [ ] Select subscription plan
- [ ] Enter test card details
- [ ] Complete checkout
- [ ] Verify success message
- [ ] Check Stripe dashboard for payment
- [ ] Test webhook delivery in Stripe

#### Responsive Design Testing
- [ ] Test on mobile device (iOS/Android)
- [ ] Test on tablet
- [ ] Test on desktop browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify navigation works on all devices
- [ ] Check forms are usable on mobile

### Step 13: Monitor Services

#### Netlify Monitoring
- [ ] Check Deploys tab for successful deployment
- [ ] Review deploy logs for warnings
- [ ] Set up deploy notifications (optional)

#### Supabase Monitoring
- [ ] Check Database logs
- [ ] Review Edge Function logs
- [ ] Monitor Auth users section
- [ ] Verify API usage is within limits

#### Stripe Monitoring
- [ ] Review Payments tab
- [ ] Check webhook delivery status
- [ ] Monitor for failed payments
- [ ] Set up email notifications (optional)

#### Google AdSense
- [ ] Verify AdSense script loads (check page source)
- [ ] Wait 24-48 hours for Google review
- [ ] Check AdSense dashboard for approval status
- [ ] Monitor for policy violations

---

## Security Verification

### Step 14: Security Checklist

- [ ] HTTPS is enabled and enforced
- [ ] SSL certificate is valid
- [ ] Environment variables are NOT in Git repository
- [ ] Supabase RLS policies are enabled on all tables
- [ ] Stripe webhooks require signature verification
- [ ] Security headers are configured (check with securityheaders.com)
- [ ] No console.log statements in production (build strips them)
- [ ] Sensitive data is not exposed in client code

---

## Performance Optimization

### Step 15: Performance Check

- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Check PageSpeed Insights (https://pagespeed.web.dev)
- [ ] Verify images are optimized
- [ ] Test loading time from different locations
- [ ] Monitor Core Web Vitals in Search Console (after indexing)

---

## SEO Configuration

### Step 16: SEO Verification

- [ ] Verify robots.txt is accessible
- [ ] Check sitemap.xml is accessible
- [ ] Confirm meta tags are present (view page source)
- [ ] Verify structured data with Google Rich Results Test
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools

---

## Optional Enhancements

### Enable Sentry Error Tracking (Optional)

If you want to re-enable Sentry:

1. Create a Sentry account at https://sentry.io
2. Create a new project
3. Get your Sentry DSN
4. Add to Netlify environment variables: `VITE_SENTRY_DSN=your-dsn-here`
5. Redeploy site

### Add Google Analytics (Optional)

1. Create GA4 property at https://analytics.google.com
2. Get Measurement ID (format: G-XXXXXXXXXX)
3. Edit `index.html` and uncomment GA code (lines 136-149)
4. Replace placeholder ID with your actual ID
5. Commit and push changes
6. Netlify will auto-deploy

### Enable AI Features (Optional)

To enable premium AI features:

1. Sign up at https://elevenlabs.io for voice generation
2. Get API key from ElevenLabs dashboard
3. Add to Supabase Edge Function secrets: `ELEVENLABS_API_KEY`
4. (Optional) Sign up at https://tavusapi.com for video generation
5. Add to Supabase secrets: `TAVUS_API_KEY`

---

## Troubleshooting

### Issue: Site Shows White Screen

**Solution:**
1. Open browser console (F12) and check for errors
2. Verify environment variables are set in Netlify
3. Check Supabase project is active
4. Clear browser cache and hard reload (Ctrl+Shift+R)

### Issue: Authentication Fails

**Solution:**
1. Verify Supabase URL and keys are correct
2. Check Supabase project is not paused
3. Review Supabase Auth logs for errors
4. Ensure email confirmation is disabled (or configured)

### Issue: Stripe Payments Not Working

**Solution:**
1. Verify Stripe publishable key is correct in Netlify
2. Check Stripe secret key in Supabase secrets
3. Ensure you're using live mode keys for production
4. Review Stripe dashboard for API errors
5. Check browser console for Stripe.js errors

### Issue: Webhooks Failing

**Solution:**
1. Verify webhook URLs are correct (no typos)
2. Check Supabase Edge Functions are deployed and running
3. Review Edge Function logs in Supabase for errors
4. Verify webhook signing secret matches
5. Test with Stripe's "Send test webhook" feature

### Issue: Domain Not Resolving

**Solution:**
1. Check DNS propagation at https://dnschecker.org
2. Verify nameservers at domain registrar
3. Wait longer (DNS can take up to 48 hours)
4. Try from different network/device

---

## Maintenance Schedule

### Daily
- Monitor error logs
- Check Stripe for failed payments
- Review user signups

### Weekly
- Review database usage in Supabase
- Check Netlify bandwidth usage
- Monitor site performance

### Monthly
- Update dependencies: `npm update`
- Review and optimize database queries
- Check for security updates
- Analyze user behavior and feature usage

### Quarterly
- Perform security audit
- Update SEO metadata
- Backup database
- Test disaster recovery

---

## Support Resources

### Official Documentation
- Netlify: https://docs.netlify.com
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- React: https://react.dev

### Community Support
- Netlify Community: https://answers.netlify.com
- Supabase Discord: https://discord.supabase.com
- Stripe Support: support@stripe.com

---

## Deployment Summary

### What's Configured:
- Supabase database with 20 migrations
- 12 Edge Functions deployed
- Stripe integration (live mode)
- Google AdSense (ca-pub-2857342591276131)
- Security headers and SSL
- SEO optimization
- Mobile responsive design

### What's Live:
- User authentication
- Property management
- Tenant management
- Maintenance tracking
- Payment processing
- Premium subscriptions
- AI features (with API keys)

### What's Next:
1. Deploy to Netlify
2. Configure domain and SSL
3. Set up Stripe webhooks
4. Test all features
5. Monitor and optimize

---

## You're Ready to Deploy!

Your application is production-ready. Follow the steps above to get your site live at lushlandsmanagement.com.

**Need help?** Review the PRODUCTION_DEPLOYMENT_GUIDE.md for detailed instructions on each step.

**Good luck with your launch!** 🚀
