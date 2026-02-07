# LushLands Management - Production Deployment Guide
## Deploy to lushlandsmanagement.com

This guide will walk you through deploying LushLands Management to production on your custom domain.

---

## 🚀 Quick Start Checklist

- [ ] Netlify account ready
- [ ] Stripe live mode keys ready (pk_live_... and sk_live_...)
- [ ] Supabase project running
- [ ] Domain lushlandsmanagement.com ready to configure
- [ ] Code pushed to GitHub/GitLab repository

---

## Step 1: Netlify Site Setup

### 1.1 Create New Site

1. Log into your Netlify account at https://app.netlify.com
2. Click **"Add new site"** > **"Import an existing project"**
3. Select your Git provider (GitHub, GitLab, Bitbucket)
4. Authorize Netlify to access your repositories
5. Select the LushLands Management repository

### 1.2 Configure Build Settings

On the deployment configuration page, set:

```
Build command: npm run build
Publish directory: dist
Node version: 18
```

**Do not deploy yet** - we need to add environment variables first.

---

## Step 2: Environment Variables Configuration

### 2.1 Add Environment Variables in Netlify

1. In your new site, go to **Site settings** > **Environment variables**
2. Click **"Add a variable"** and add each of the following:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `VITE_SUPABASE_URL` | `https://chogbrfhhybftphkthpj.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNob2dicmZoaHliZnRwaGt0aHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDY3MjIsImV4cCI6MjA3NTUyMjcyMn0.qVOGRXfNRkrqKFC4q2BNvEDI2vXY4kfilRclVj_LD7E` | Your Supabase anon key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_YOUR_KEY_HERE` | **Replace with your Stripe LIVE publishable key** |

3. Click **"Save"** after adding all variables

### 2.2 Trigger Initial Deployment

1. After saving environment variables, go to **Deploys** tab
2. Click **"Trigger deploy"** > **"Deploy site"**
3. Wait for build to complete (typically 2-3 minutes)
4. Verify deployment succeeded with green checkmark

You'll get a temporary Netlify URL like: `https://random-name-123456.netlify.app`

---

## Step 3: Custom Domain Configuration

### 3.1 Add Custom Domain in Netlify

1. In your site dashboard, go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter: `lushlandsmanagement.com`
4. Click **"Verify"** and **"Add domain"**
5. Netlify will show DNS configuration instructions

### 3.2 Configure DNS Records

You need to update DNS records with your domain registrar (GoDaddy, Namecheap, etc.):

**Option A: Using Netlify DNS (Recommended)**
1. In Netlify, click **"Set up Netlify DNS"**
2. Copy the 4 nameservers provided (e.g., dns1.p05.nsone.net)
3. Go to your domain registrar
4. Replace existing nameservers with Netlify's nameservers
5. Wait for propagation (5 minutes - 48 hours, typically 30 minutes)

**Option B: Using Your Current DNS Provider**
1. In Netlify, note the DNS target IP address or CNAME
2. Go to your domain registrar's DNS settings
3. Add an **A record**:
   - Name/Host: `@` (or leave blank)
   - Value: Netlify's IP address (shown in Netlify)
   - TTL: 3600 (or automatic)
4. Add a **CNAME record** for www subdomain:
   - Name/Host: `www`
   - Value: Your Netlify site URL (e.g., `random-name-123456.netlify.app`)
   - TTL: 3600 (or automatic)

### 3.3 Enable HTTPS

1. Once DNS is configured, return to Netlify **Domain settings**
2. Scroll to **HTTPS** section
3. Wait for SSL certificate to be automatically provisioned (5-10 minutes)
4. Verify **"HTTPS: Enabled"** with green checkmark
5. Enable **"Force HTTPS"** to redirect all HTTP traffic to HTTPS

### 3.4 Verify Domain is Live

Test these URLs in your browser:
- `http://lushlandsmanagement.com` (should redirect to HTTPS)
- `https://lushlandsmanagement.com` (should load your site)
- `https://www.lushlandsmanagement.com` (should redirect to primary domain)

---

## Step 4: Supabase Edge Functions Configuration

### 4.1 Add Stripe Secrets to Supabase

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Edge Functions** in the left sidebar
4. Click on **Secrets** tab
5. Add the following secrets:

| Secret Name | Value | Notes |
|-------------|-------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_YOUR_KEY_HERE` | Your Stripe LIVE secret key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_YOUR_KEY_HERE` | Created in Step 5 after setting up webhooks |

**Note:** Don't add the webhook secret yet - you'll create it in the next step.

### 4.2 Verify Edge Functions are Deployed

1. In Supabase dashboard, go to **Edge Functions**
2. Verify these 12 functions are deployed and active:
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

All should show green "Deployed" status.

---

## Step 5: Stripe Webhook Configuration

### 5.1 Create Subscription Webhook

1. Log into Stripe dashboard: https://dashboard.stripe.com
2. Switch to **Live mode** (toggle in top right)
3. Go to **Developers** > **Webhooks**
4. Click **"Add endpoint"**

**Subscription Webhook Details:**
- Endpoint URL: `https://chogbrfhhybftphkthpj.supabase.co/functions/v1/subscription-webhook`
- Description: `LushLands Subscription Events`
- Events to send:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `customer.subscription.trial_will_end`
- API Version: Latest (default)

5. Click **"Add endpoint"**
6. Click on the newly created webhook
7. Click **"Reveal"** next to "Signing secret"
8. Copy the signing secret (starts with `whsec_`)

### 5.2 Create Payment Webhook

1. In Stripe Webhooks page, click **"Add endpoint"** again

**Payment Webhook Details:**
- Endpoint URL: `https://chogbrfhhybftphkthpj.supabase.co/functions/v1/stripe-payment-webhook`
- Description: `LushLands Payment Events`
- Events to send:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `payment_intent.requires_action`
  - `payment_intent.canceled`

2. Click **"Add endpoint"**
3. Copy this webhook's signing secret as well

### 5.3 Create General Checkout Webhook

1. Click **"Add endpoint"** one more time

**General Webhook Details:**
- Endpoint URL: `https://chogbrfhhybftphkthpj.supabase.co/functions/v1/stripe-webhook`
- Description: `LushLands Checkout Events`
- Events to send:
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`

2. Click **"Add endpoint"**
3. Copy this webhook's signing secret

### 5.4 Add Webhook Secret to Supabase

1. Return to Supabase dashboard > **Edge Functions** > **Secrets**
2. Add or update `STRIPE_WEBHOOK_SECRET` with the signing secret from your primary webhook (use the subscription webhook secret)

**Note:** If you need to use different secrets for different webhooks, you can create separate secret keys like `STRIPE_SUBSCRIPTION_WEBHOOK_SECRET`, `STRIPE_PAYMENT_WEBHOOK_SECRET`, etc., and update the Edge Function code accordingly.

### 5.5 Test Webhook Delivery

1. In Stripe dashboard, click on each webhook
2. Click **"Send test webhook"**
3. Select an event type and click **"Send test webhook"**
4. Verify status shows **"Succeeded"** (green checkmark)
5. If failed, check Supabase Edge Function logs for errors

---

## Step 6: Production Testing

### 6.1 Test User Authentication

1. Visit `https://lushlandsmanagement.com`
2. Click **"Sign Up"** or **"Register"**
3. Create a new test account with a real email
4. Verify you can sign in
5. Check that you're redirected to the dashboard
6. Sign out and sign back in to verify session persistence

### 6.2 Test Property Management

1. Navigate to **Properties** section
2. Click **"Add Property"**
3. Fill in property details:
   - Property name
   - Address
   - Purchase price
   - Monthly rent
   - Bedrooms/bathrooms
4. Save the property
5. Verify property appears in the list
6. Edit the property to test update functionality
7. Test property filtering and search if available

### 6.3 Test Maintenance Requests

1. Go to **Maintenance** section
2. Click **"Create Maintenance Request"**
3. Fill in request details:
   - Property
   - Description
   - Priority
   - Category
4. Submit the request
5. Verify request appears in the list
6. Update request status to test workflow

### 6.4 Test Payment Processing

**IMPORTANT:** Use a real card, then immediately refund to avoid charges.

1. Go to **Premium Features** or **Upgrade** section
2. Select a subscription plan
3. Enter test card details:
   - Card: Use your real card or Stripe test card `4242 4242 4242 4242`
   - Exp: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
4. Complete the payment
5. Verify success message appears
6. Check Stripe dashboard for the payment
7. **Immediately refund the payment** in Stripe dashboard if you used a real card
8. Verify subscription status updates in the app

### 6.5 Test Tenant Features

1. Navigate to **Tenants** section
2. Click **"Add Tenant"**
3. Fill in tenant information
4. Save the tenant
5. Associate tenant with a property
6. Test tenant screening if you have API keys configured

### 6.6 Mobile Responsiveness Test

Test on actual mobile devices:
- iPhone (Safari)
- Android (Chrome)
- iPad/Tablet

Check:
- Navigation menu works
- Forms are usable
- Buttons are tappable
- Text is readable
- Images load properly

### 6.7 Browser Compatibility Test

Test in multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Verify:
- Site loads without errors
- All features work
- No console errors

---

## Step 7: Google AdSense Verification

### 7.1 Verify AdSense Integration

1. Google AdSense code is already integrated in `index.html`:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2857342591276131"
        crossorigin="anonymous"></script>
   ```

2. Visit your live site and view page source (right-click > View Page Source)
3. Search for "adsbygoogle" to confirm the script is present

### 7.2 Monitor AdSense Dashboard

1. Log into Google AdSense: https://www.google.com/adsense
2. Go to **Sites** section
3. Your site `lushlandsmanagement.com` should appear as "Getting ready"
4. Wait 24-48 hours for Google to review and approve
5. Once approved, ads will automatically start displaying

**Note:** Ad display may take several days after site goes live. Google needs to:
- Verify your site ownership
- Review content for policy compliance
- Set up ad inventory
- Build audience data

### 7.3 Verify Ads Are Displaying

After approval (2-7 days typically):
1. Visit your live site
2. Look for ad placeholders or actual ads
3. Check multiple pages to see ad coverage
4. Monitor AdSense dashboard for impressions and clicks

---

## Step 8: Post-Deployment Monitoring

### 8.1 Monitor Netlify

1. Check **Deploys** tab regularly for build status
2. Review **Functions** logs if you use Netlify Functions
3. Monitor **Analytics** for traffic (if enabled)
4. Set up deploy notifications in **Site settings** > **Build & deploy** > **Deploy notifications**

### 8.2 Monitor Supabase

1. Go to **Database** > **Logs** to monitor queries
2. Check **Edge Functions** > **Logs** for function execution
3. Review **Auth** > **Users** to track user signups
4. Monitor **API** section for rate limits and usage

### 8.3 Monitor Stripe

1. Review **Payments** tab for transactions
2. Check **Customers** to see new subscribers
3. Monitor **Subscriptions** for active plans
4. Review **Webhooks** to ensure delivery success
5. Set up email notifications for failed payments

### 8.4 Monitor Sentry (Error Tracking)

1. Sentry is already integrated in the application
2. Log into Sentry dashboard
3. Monitor for JavaScript errors
4. Set up alerts for critical errors
5. Review error frequency and affected users

### 8.5 Set Up Monitoring Alerts

Configure alerts for:
- Netlify: Failed deployments
- Stripe: Failed payments or webhook delivery issues
- Supabase: High error rates in Edge Functions
- Sentry: Critical application errors

---

## Step 9: Optional Enhancements

### 9.1 Google Analytics 4 (Optional)

To enable analytics tracking:

1. Create Google Analytics 4 property at https://analytics.google.com
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Edit `index.html` lines 136-149
4. Uncomment the GA4 script
5. Replace `G-XXXXXXXXXX` with your actual Measurement ID
6. Commit and push changes
7. Netlify will auto-deploy the update

### 9.2 Premium AI Features (Optional)

To enable AI-powered features:

**ElevenLabs Voice Generation:**
1. Sign up at https://elevenlabs.io
2. Get API key from dashboard
3. Add `ELEVENLABS_API_KEY` to Supabase Edge Function secrets

**Tavus Video Generation:**
1. Sign up at https://tavusapi.com
2. Get API key
3. Add `TAVUS_API_KEY` to Supabase Edge Function secrets

These enable:
- AI voiceover generation for properties
- Video tour generation
- Enhanced property presentations

### 9.3 Custom Email Domain (Optional)

For professional email notifications:

1. Configure email sending in Supabase Auth settings
2. Set up custom SMTP or use SendGrid/Mailgun
3. Update email templates in Supabase dashboard
4. Test email delivery for signup/password reset

---

## Troubleshooting Guide

### Issue: Build Fails on Netlify

**Symptoms:** Red X on deployment, build log shows errors

**Solutions:**
1. Check Node version is set to 18 in build settings
2. Verify all dependencies are in `package.json`
3. Check for TypeScript errors in build log
4. Review build command is exactly: `npm run build`
5. Ensure environment variables are set correctly

### Issue: Site Loads But Shows Errors

**Symptoms:** White screen, error in browser console

**Solutions:**
1. Open browser console (F12) and check error messages
2. Verify Supabase environment variables are correct
3. Check Supabase project is active and not paused
4. Verify Stripe publishable key is set correctly
5. Clear browser cache and hard reload (Ctrl+Shift+R)

### Issue: Stripe Payments Not Working

**Symptoms:** Payment form doesn't load or fails

**Solutions:**
1. Verify you're using live mode keys, not test mode
2. Check Stripe publishable key is set in Netlify env vars
3. Verify Stripe secret key is set in Supabase secrets
4. Check browser console for Stripe.js loading errors
5. Review Stripe dashboard for API errors

### Issue: Webhooks Failing

**Symptoms:** Stripe shows webhook delivery failures

**Solutions:**
1. Verify webhook URLs are correct (check for typos)
2. Check Supabase Edge Functions are deployed and running
3. Review Edge Function logs in Supabase for errors
4. Verify webhook signing secret is correct in Supabase
5. Test webhook with Stripe's "Send test webhook" feature

### Issue: Domain Not Resolving

**Symptoms:** Site not accessible via custom domain

**Solutions:**
1. Check DNS propagation: https://dnschecker.org
2. Verify nameservers are correctly set at registrar
3. Wait longer (DNS can take up to 48 hours)
4. Try accessing from different network/device
5. Check domain hasn't expired at registrar

### Issue: SSL Certificate Not Issued

**Symptoms:** "Not secure" warning in browser

**Solutions:**
1. Verify domain DNS is fully propagated
2. Check Netlify Domain settings shows "DNS verified"
3. Click "Verify DNS configuration" in Netlify
4. Wait 10-15 minutes for certificate to provision
5. Contact Netlify support if still failing after 1 hour

### Issue: AdSense Not Showing Ads

**Symptoms:** No ads appearing on site

**Solutions:**
1. Verify site has been live for at least 24-48 hours
2. Check AdSense account for approval status
3. Ensure site has sufficient content (not just login page)
4. Verify ad code is present in page source
5. Check AdSense dashboard for policy violations

---

## Security Checklist

Before going live, verify:

- [x] Netlify environment variables use live Stripe keys (not test keys)
- [x] Supabase RLS policies are enabled on all tables
- [x] Stripe webhook secrets are configured correctly
- [x] HTTPS is enforced (Force HTTPS enabled in Netlify)
- [x] Security headers are configured (already in netlify.toml)
- [x] `.env` file is in `.gitignore` (never commit secrets)
- [x] Admin accounts use strong passwords
- [x] Supabase API keys are restricted to your domain
- [x] Stripe account has 2FA enabled
- [x] Regular backups are configured in Supabase

---

## Maintenance Schedule

### Daily
- Monitor error logs in Sentry
- Check Stripe for failed payments
- Review user signups and activity

### Weekly
- Review Supabase database usage
- Check Netlify bandwidth usage
- Monitor site performance and loading times
- Review and respond to user feedback

### Monthly
- Update dependencies: `npm update`
- Review and optimize database queries
- Check for security updates
- Analyze user behavior and feature usage
- Review and optimize costs

### Quarterly
- Perform security audit
- Update SEO metadata based on performance
- Review and update content
- Backup entire project and database
- Test disaster recovery procedures

---

## Support Resources

### Official Documentation
- **Netlify:** https://docs.netlify.com
- **Supabase:** https://supabase.com/docs
- **Stripe:** https://stripe.com/docs
- **React:** https://react.dev
- **Vite:** https://vitejs.dev

### Community Support
- **Netlify Community:** https://answers.netlify.com
- **Supabase Discord:** https://discord.supabase.com
- **Stripe Support:** support@stripe.com

### Emergency Contacts
- **Netlify Support:** support@netlify.com
- **Stripe Support:** https://support.stripe.com
- **Supabase Support:** support@supabase.com

---

## Deployment Complete! 🎉

Your LushLands Management platform is now live at:
- **Primary URL:** https://lushlandsmanagement.com
- **Secure:** HTTPS enabled with automatic SSL
- **Payment Processing:** Stripe live mode active
- **Database:** Supabase production ready
- **Monetization:** Google AdSense integrated

### What's Working:
✅ User authentication and authorization
✅ Property management (CRUD operations)
✅ Tenant management and screening
✅ Maintenance request tracking
✅ Online payment processing via Stripe
✅ Premium subscription features
✅ AI-powered features (with API keys)
✅ Mobile responsive design
✅ SEO optimized
✅ Google AdSense ready

### Next Steps:
1. Share with beta users for testing
2. Monitor analytics and user behavior
3. Gather feedback for improvements
4. Market your platform
5. Scale as user base grows

**Congratulations on your deployment!** 🚀
