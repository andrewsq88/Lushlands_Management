# Vercel Deployment Instructions for LushLands Management

## Prerequisites
- Vercel account connected to your Git repository
- Domain (lushlandsmanagement.com) pointed to Vercel

## Step-by-Step Deployment

### 1. Environment Variables
In your Vercel dashboard, add these environment variables:

```
VITE_SUPABASE_URL=https://chogbrfhhybftphkthpj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNob2dicmZoaHliZnRwaGt0aHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDY3MjIsImV4cCI6MjA3NTUyMjcyMn0.qVOGRXfNRkrqKFC4q2BNvEDI2vXY4kfilRclVj_LD7E
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RWiS5KNVw1suic6PFSMhP3zU7cTsIcEcYqweBZ24wpZZf5QJB6xxZ9uCleHfViheN06qfxdHRKdgwalSGCKVqaZ00BvYA9E75
```

### 2. Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node Version**: 18.x

### 3. Domain Configuration
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your domain: `lushlandsmanagement.com`
4. Add www redirect: `www.lushlandsmanagement.com` → `lushlandsmanagement.com`

### 4. DNS Configuration
Point your domain to Vercel:
- **A Record**: `76.76.21.21` (or current Vercel IP)
- **CNAME for www**: `cname.vercel-dns.com`

### 5. Deploy
1. Push your code to the connected Git repository
2. Vercel will automatically trigger a deployment
3. Monitor the build logs for any errors
4. Once deployed, verify all routes work:
   - https://lushlandsmanagement.com/
   - https://lushlandsmanagement.com/properties
   - https://lushlandsmanagement.com/tenants
   - etc.

### 6. Verification Checklist
- [ ] Home page loads correctly
- [ ] All routes are accessible (no 404 errors)
- [ ] Authentication works (sign up/sign in)
- [ ] Properties page displays and functions correctly
- [ ] Tenants page works
- [ ] Maintenance page works
- [ ] Payments page works
- [ ] All buttons and forms are functional
- [ ] Database connections work (Supabase)
- [ ] Stripe integration works
- [ ] CSS and images load properly
- [ ] No console errors in browser
- [ ] SSL certificate is active
- [ ] Mobile responsiveness works

## Troubleshooting

### Issue: Page shows only placeholder content
**Solution**: Check that the build completed successfully and the dist folder was deployed. Verify environment variables are set.

### Issue: 404 on direct route access
**Solution**: Verify vercel.json has the correct rewrite rules for SPA routing.

### Issue: App not loading
**Solution**: Check browser console for errors. Verify environment variables are set correctly in Vercel dashboard.

### Issue: Database not connecting
**Solution**: Verify Supabase environment variables are correct and Supabase project is accessible.

## Support
If you encounter issues, check:
1. Vercel deployment logs
2. Browser console errors
3. Network tab for failed requests
4. Supabase dashboard for database connectivity
