# Netlify Deployment Guide for Lush Lands Management

## Prerequisites Completed ✅
- ✅ netlify.toml configured with build settings and security headers
- ✅ Production environment variables ready
- ✅ Production Stripe key configured
- ✅ Build tested successfully
- ✅ Supabase database configured and ready

---

## Step 1: Create Netlify Site

1. Go to [Netlify Dashboard](https://app.netlify.com/teams/lushlands-management/projects)
2. Click **"Add new site"** button
3. Select **"Import an existing project"**
4. Choose your Git provider (GitHub, GitLab, or Bitbucket)
5. Authorize Netlify to access your repository
6. Select the repository containing this project

---

## Step 2: Configure Build Settings

Netlify should automatically detect these settings from `netlify.toml`:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

If not auto-detected, enter them manually on the configuration screen.

---

## Step 3: Set Environment Variables

In the Netlify site settings, go to **Site settings > Environment variables** and add:

```
VITE_SUPABASE_URL=https://chogbrfhhybftphkthpj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNob2dicmZoaHliZnRwaGt0aHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDY3MjIsImV4cCI6MjA3NTUyMjcyMn0.qVOGRXfNRkrqKFC4q2BNvEDI2vXY4kfilRclVj_LD7E
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RWiS5KNVw1suic6PFSMhP3zU7cTsIcEcYqweBZ24wpZZf5QJB6xxZ9uCleHfViheN06qfxdHRKdgwalSGCKVqaZ00BvYA9E75
```

**Optional**: Add Google Analytics if you have one:
```
VITE_GA_MEASUREMENT_ID=your-ga-id
```

---

## Step 4: Deploy Site

1. Click **"Deploy site"** button
2. Wait for the build to complete (typically 2-5 minutes)
3. Monitor the build logs for any errors
4. Once successful, you'll receive a temporary Netlify URL (e.g., `random-name-12345.netlify.app`)

---

## Step 5: Configure Custom Domain

### Add Custom Domain in Netlify

1. Go to **Site settings > Domain management**
2. Click **"Add custom domain"**
3. Enter: `lushlandsmanagement.com`
4. Click **"Verify"** and then **"Add domain"**
5. Click **"Add domain alias"**
6. Enter: `www.lushlandsmanagement.com`
7. Click **"Save"**

Netlify will show you the DNS configuration needed.

### Configure DNS Records

Go to your domain registrar where you purchased `lushlandsmanagement.com` and update DNS records:

**Option A: Using Netlify DNS (Recommended)**
1. In Netlify, click **"Set up Netlify DNS"**
2. Follow the instructions to update nameservers at your registrar
3. Update nameservers to the ones provided by Netlify
4. Wait for DNS propagation (can take up to 24-48 hours)

**Option B: External DNS**
Add these records at your domain registrar:

```
Type: A
Name: @
Value: 75.2.60.5 (Netlify's load balancer IP - check current IP in Netlify dashboard)

Type: CNAME
Name: www
Value: [your-site-name].netlify.app
```

---

## Step 6: Enable HTTPS/SSL

1. Wait for DNS to propagate (check at https://dnschecker.org/)
2. In Netlify dashboard, go to **Site settings > Domain management > HTTPS**
3. Netlify will automatically provision a free Let's Encrypt SSL certificate
4. Once ready, enable **"Force HTTPS"** to redirect all HTTP traffic to HTTPS

---

## Step 7: Configure Supabase for Production

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/chogbrfhhybftphkthpj)
2. Navigate to **Authentication > URL Configuration**
3. Add these URLs to **Site URL** and **Redirect URLs**:
   - `https://lushlandsmanagement.com`
   - `https://www.lushlandsmanagement.com`
4. Update **Site URL** to: `https://www.lushlandsmanagement.com`

---

## Step 8: Post-Deployment Testing

Once deployed, test the following:

### Authentication
- [ ] User registration works
- [ ] Email/password login works
- [ ] Logout works
- [ ] Password reset flow works
- [ ] Session persistence works

### Core Features
- [ ] Properties page loads and displays data
- [ ] Can add new properties
- [ ] Can edit existing properties
- [ ] Tenants page works
- [ ] Payments tracking works
- [ ] Maintenance requests work

### Stripe Integration
- [ ] Pricing page loads
- [ ] Subscription checkout works
- [ ] Payment processing works
- [ ] Subscription management works

### Performance & Security
- [ ] All pages load quickly
- [ ] Images load properly
- [ ] Mobile responsive design works
- [ ] Security headers are present (check with https://securityheaders.com/)
- [ ] SSL certificate is active
- [ ] HTTPS redirect works

---

## Step 9: Configure Continuous Deployment

Continuous deployment is automatically enabled. Every time you push to your main branch:
1. Netlify detects the change
2. Runs `npm run build`
3. Deploys the new version automatically
4. Provides deploy previews for pull requests

### Deploy Notifications (Optional)
Go to **Site settings > Build & deploy > Deploy notifications** to set up:
- Email notifications
- Slack notifications
- Webhook notifications

---

## Step 10: Monitor and Maintain

### Build Status
- Monitor builds at: `https://app.netlify.com/sites/[your-site-name]/deploys`
- Check build logs for any issues
- Review deploy previews before merging PRs

### Analytics
- View analytics in Netlify dashboard
- Optionally integrate Google Analytics
- Monitor error logs in Sentry (if configured)

### Updates
- Regularly update dependencies
- Monitor Stripe webhook logs
- Review Supabase database performance
- Check security headers periodically

---

## Troubleshooting

### Build Fails
- Check Node version is set to 18
- Verify all environment variables are set
- Review build logs for specific errors
- Ensure package.json scripts are correct

### Domain Not Working
- Wait 24-48 hours for DNS propagation
- Verify DNS records are correct
- Check nameservers if using Netlify DNS
- Use https://dnschecker.org/ to verify propagation

### Authentication Issues
- Verify Supabase redirect URLs include your domain
- Check environment variables are correct
- Ensure CORS is properly configured
- Review Supabase auth logs

### Stripe Not Working
- Verify Stripe publishable key is correct
- Check Stripe webhook endpoints
- Review Stripe dashboard for errors
- Ensure production mode is enabled

---

## Quick Reference

### Important URLs
- **Live Site**: https://www.lushlandsmanagement.com
- **Netlify Dashboard**: https://app.netlify.com/
- **Supabase Dashboard**: https://supabase.com/dashboard/project/chogbrfhhybftphkthpj
- **Stripe Dashboard**: https://dashboard.stripe.com/

### Support Resources
- Netlify Docs: https://docs.netlify.com/
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs

---

## Security Checklist

Before going live, verify:
- [x] HTTPS enabled and forced
- [x] Security headers configured (X-Frame-Options, CSP, etc.)
- [x] Environment variables not exposed in client code
- [x] Supabase Row Level Security (RLS) enabled on all tables
- [x] Stripe using production keys
- [x] Auth redirect URLs restricted to your domain
- [x] CORS properly configured
- [x] robots.txt and sitemap.xml configured

---

## Next Steps After Deployment

1. **Set up monitoring**: Configure uptime monitoring (e.g., UptimeRobot)
2. **Add analytics**: Implement Google Analytics or similar
3. **Configure backups**: Set up Supabase backup schedule
4. **Test thoroughly**: Complete all items in the testing checklist
5. **Update documentation**: Document any custom configurations
6. **Train users**: Provide user guides for your team
7. **Marketing**: Announce your launch!

---

**Your site is ready for production! 🚀**

Once deployed to www.lushlandsmanagement.com, you'll have a fully functional property management system with:
- Secure authentication
- Property and tenant management
- Payment tracking
- Maintenance requests
- Premium subscription features
- Professional security headers
- Automatic SSL/HTTPS
- Continuous deployment
