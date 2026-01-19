# LushLands Management - Complete Functionality Test Guide

## Overview
This document provides a comprehensive testing checklist for all features and functionality in the LushLands Management application.

---

## Pre-Test Requirements

### 1. Environment Setup
- Site deployed successfully to Vercel
- All environment variables configured
- Supabase database connected
- Stripe account configured (test mode recommended for initial tests)

### 2. Test Account
Create a test account:
- Email: test@example.com (or your test email)
- Password: Strong password (8+ characters)
- First Name: Test
- Last Name: User

---

## Authentication & Authorization Tests

### Test 1.1: Sign Up
**Steps:**
1. Navigate to https://lushlandsmanagement.com
2. Should see login/signup form
3. Click "Sign Up" tab or button
4. Fill in:
   - First Name: "Test"
   - Last Name: "User"
   - Email: "test@example.com"
   - Password: "TestPassword123!"
5. Click "Sign Up" button

**Expected Results:**
- ✅ Form validates required fields
- ✅ Sign up completes successfully
- ✅ User is automatically logged in
- ✅ Redirected to dashboard
- ✅ User profile created in database

**Failure Indicators:**
- ❌ "Email already exists" error
- ❌ "Invalid email format" error
- ❌ Database connection error
- ❌ Page doesn't redirect

---

### Test 1.2: Sign In
**Steps:**
1. Sign out if currently logged in
2. Enter email and password
3. Click "Sign In" button

**Expected Results:**
- ✅ Authentication successful
- ✅ Redirected to dashboard
- ✅ User session persists on page reload

**Failure Indicators:**
- ❌ "Invalid credentials" error
- ❌ Infinite loading state
- ❌ Session not persisting

---

### Test 1.3: Sign Out
**Steps:**
1. While logged in, click profile menu or sign out button
2. Confirm sign out

**Expected Results:**
- ✅ User logged out successfully
- ✅ Redirected to login page
- ✅ Can't access protected routes without logging back in

---

## Dashboard Tests

### Test 2.1: Dashboard Load
**Steps:**
1. Log in and navigate to dashboard (/)

**Expected Results:**
- ✅ Dashboard loads without errors
- ✅ Shows overview statistics
- ✅ Navigation menu visible
- ✅ User profile/settings accessible

---

## Properties Page Tests

### Test 3.1: Properties Page Load
**Steps:**
1. Navigate to /properties or click "Properties" in nav

**Expected Results:**
- ✅ Properties page loads
- ✅ Shows "Add Property" button
- ✅ Search and filter controls visible
- ✅ Empty state shown if no properties ("No properties found")

---

### Test 3.2: Add Property
**Steps:**
1. Click "Add Property" button
2. Fill in the form:
   - Address: "123 Test Street, Test City, TS 12345"
   - Type: "Single Family" (dropdown)
   - Status: "Vacant" (dropdown)
   - Rent Amount: "1500"
   - Bedrooms: "3"
   - Bathrooms: "2"
   - Square Feet: "1800"
   - Description: "Beautiful test property"
3. Click "Save" or "Add Property"

**Expected Results:**
- ✅ Form validates all fields
- ✅ Property saved to database
- ✅ Modal/form closes
- ✅ New property appears in properties list
- ✅ Success message displayed

**Failure Indicators:**
- ❌ Validation errors for required fields
- ❌ Database save error
- ❌ Property doesn't appear in list

---

### Test 3.3: View Property Details
**Steps:**
1. Click on a property in the list (if details view exists)
2. OR hover over property to see details

**Expected Results:**
- ✅ All property details displayed correctly
- ✅ Rent amount formatted as currency
- ✅ Status badge shows correct color

---

### Test 3.4: Edit Property
**Steps:**
1. Click "Edit" button (pencil icon) on a property
2. Modify fields:
   - Change rent amount to "1600"
   - Change status to "Occupied"
3. Click "Save"

**Expected Results:**
- ✅ Edit form pre-populated with current data
- ✅ Changes saved to database
- ✅ Property list updates immediately
- ✅ Success message displayed

---

### Test 3.5: Delete Property
**Steps:**
1. Click "Delete" button (trash icon) on a property
2. Confirm deletion in confirmation dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Property deleted from database
- ✅ Property removed from list immediately
- ✅ Success message displayed

**Failure Indicators:**
- ❌ Property not deleted
- ❌ Error message appears

---

### Test 3.6: Search Properties
**Steps:**
1. Type "Test" in search box
2. Verify filtering works

**Expected Results:**
- ✅ List filters in real-time as you type
- ✅ Shows only properties matching search term
- ✅ Searches address and type fields
- ✅ Clear search shows all properties again

---

### Test 3.7: Filter Properties by Status
**Steps:**
1. Select "Vacant" from status filter dropdown
2. Verify only vacant properties shown
3. Select "All Status" to clear filter

**Expected Results:**
- ✅ List filters by selected status
- ✅ Filter updates immediately
- ✅ Can combine search and filter

---

### Test 3.8: Property Photos
**Steps:**
1. Click "Photos" button on a property
2. Upload photos modal should open
3. (If implemented) Upload test images

**Expected Results:**
- ✅ Photos modal opens
- ✅ Can upload images
- ✅ Images saved to storage
- ✅ Images display in property view

---

### Test 3.9: Status Change Dropdown
**Steps:**
1. Click the status badge/dropdown on a property
2. Select a different status

**Expected Results:**
- ✅ Status updates immediately
- ✅ Badge color changes
- ✅ Database updated

---

### Test 3.10: AI Audio Generation (Premium Feature)
**Steps:**
1. Scroll to "AI Property Features" section
2. Enter property description text
3. Click "Generate Audio Description"

**Expected Results:**
- ✅ Loading state shows
- ✅ Audio file generated
- ✅ Audio player appears
- ✅ Can play audio
- ✅ Can download audio
- ✅ Usage count decrements (if free tier)

**Note:** This requires API keys configured

---

## Tenants Page Tests

### Test 4.1: Tenants Page Load
**Steps:**
1. Navigate to /tenants

**Expected Results:**
- ✅ Tenants page loads
- ✅ Shows "Add Tenant" button
- ✅ Empty state if no tenants

---

### Test 4.2: Add Tenant
**Steps:**
1. Click "Add Tenant" button
2. Fill in form:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Phone: "555-123-4567"
   - Property: Select from dropdown
   - Lease Start: Select date
   - Lease End: Select date
   - Income: "50000"
3. Submit form

**Expected Results:**
- ✅ Tenant saved to database
- ✅ Tenant appears in list
- ✅ Associated with selected property
- ✅ Form validates email format

---

### Test 4.3: Edit Tenant
**Steps:**
1. Click edit on a tenant
2. Modify fields
3. Save changes

**Expected Results:**
- ✅ Changes saved
- ✅ List updates

---

### Test 4.4: Delete Tenant
**Steps:**
1. Click delete on a tenant
2. Confirm deletion

**Expected Results:**
- ✅ Tenant deleted
- ✅ Removed from list

---

### Test 4.5: AI Tenant Screening (Premium Feature)
**Steps:**
1. Find tenant screening feature
2. Enter tenant information
3. Run screening

**Expected Results:**
- ✅ Screening results generated
- ✅ Score displayed
- ✅ Recommendation provided

**Note:** Requires API configuration

---

## Maintenance Page Tests

### Test 5.1: Maintenance Page Load
**Steps:**
1. Navigate to /maintenance

**Expected Results:**
- ✅ Maintenance page loads
- ✅ Shows maintenance requests list
- ✅ "New Request" button visible

---

### Test 5.2: Create Maintenance Request
**Steps:**
1. Click "New Request" or similar button
2. Fill in:
   - Property: Select from dropdown
   - Description: "Leaky faucet in kitchen"
   - Priority: "Medium"
3. Submit

**Expected Results:**
- ✅ Request saved
- ✅ Appears in list
- ✅ Shows priority badge
- ✅ Status shows "Pending" or similar

---

### Test 5.3: Update Request Status
**Steps:**
1. Click on a request
2. Change status (Pending → In Progress → Completed)

**Expected Results:**
- ✅ Status updates
- ✅ Badge color changes
- ✅ Database updated

---

### Test 5.4: Filter Maintenance Requests
**Steps:**
1. Filter by status
2. Filter by priority
3. Search by description

**Expected Results:**
- ✅ Filters work correctly
- ✅ Can combine multiple filters

---

## Payments Page Tests

### Test 6.1: Payments Page Load
**Steps:**
1. Navigate to /payments

**Expected Results:**
- ✅ Payments page loads
- ✅ Shows payment history
- ✅ Shows payment forms

---

### Test 6.2: Record Payment
**Steps:**
1. Click "Add Payment" or similar
2. Fill in:
   - Tenant: Select from dropdown
   - Amount: "1500"
   - Type: "Rent"
   - Due Date: Select date
3. Submit

**Expected Results:**
- ✅ Payment recorded
- ✅ Appears in list
- ✅ Status shown correctly

---

### Test 6.3: Stripe Payment (Premium/Test Mode)
**Steps:**
1. Initiate Stripe payment
2. Use test card: 4242 4242 4242 4242
3. Complete payment

**Expected Results:**
- ✅ Stripe checkout opens
- ✅ Payment processes successfully
- ✅ Payment recorded in database
- ✅ Stripe payment ID saved

**Note:** Only test in Stripe test mode

---

## Pricing/Subscription Tests

### Test 7.1: Pricing Page Load
**Steps:**
1. Navigate to /pricing

**Expected Results:**
- ✅ Pricing page loads
- ✅ Shows Free and Premium tiers
- ✅ Feature comparison visible
- ✅ "Upgrade" or "Subscribe" buttons work

---

### Test 7.2: View Subscription Status
**Steps:**
1. Navigate to /subscription or profile

**Expected Results:**
- ✅ Shows current subscription tier
- ✅ Shows usage limits (if free tier)
- ✅ Shows renewal date (if premium)

---

## Mobile Responsiveness Tests

### Test 8.1: Mobile Navigation
**Steps:**
1. Open site on mobile device or use browser dev tools
2. Set viewport to mobile size (375px width)
3. Test navigation

**Expected Results:**
- ✅ Mobile menu works (hamburger icon)
- ✅ Navigation items stack vertically
- ✅ All pages accessible on mobile

---

### Test 8.2: Forms on Mobile
**Steps:**
1. Try adding property on mobile
2. Try adding tenant on mobile

**Expected Results:**
- ✅ Forms are usable
- ✅ Inputs properly sized
- ✅ Dropdowns work
- ✅ Can submit forms

---

## Performance Tests

### Test 9.1: Page Load Speed
**Expected:**
- ✅ First Contentful Paint < 2 seconds
- ✅ Time to Interactive < 4 seconds
- ✅ No layout shifts

---

### Test 9.2: Database Queries
**Expected:**
- ✅ Properties load within 1 second
- ✅ Tenants load within 1 second
- ✅ No infinite loading states

---

## Security Tests

### Test 10.1: Route Protection
**Steps:**
1. Log out
2. Try to access /properties directly

**Expected Results:**
- ✅ Redirected to login
- ✅ Can't access protected routes without auth

---

### Test 10.2: Data Isolation
**Steps:**
1. Create data with User A
2. Log in as User B
3. Try to access User A's data

**Expected Results:**
- ✅ Can only see own data
- ✅ Can't access other users' properties/tenants
- ✅ RLS policies enforced

---

## Error Handling Tests

### Test 11.1: Network Error
**Steps:**
1. Disconnect internet
2. Try to load page or submit form

**Expected Results:**
- ✅ User-friendly error message
- ✅ Doesn't crash
- ✅ Recovers when connection restored

---

### Test 11.2: Invalid Input
**Steps:**
1. Try to submit forms with invalid data
2. Try negative numbers
3. Try special characters

**Expected Results:**
- ✅ Form validation catches errors
- ✅ Clear error messages shown
- ✅ Prevents submission with invalid data

---

## Browser Compatibility Tests

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Mobile Chrome (Android)

---

## Final Checklist

- [ ] All pages load without errors
- [ ] All buttons and links work
- [ ] All forms submit successfully
- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] Search and filters work
- [ ] Authentication works
- [ ] Database connections work
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Fast page loads
- [ ] Secure (HTTPS, RLS)
- [ ] Error handling works

---

## Reporting Issues

When reporting issues, include:
1. Exact steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/device info
5. Screenshots/video if applicable
6. Console errors (F12 → Console tab)
7. Network errors (F12 → Network tab)
