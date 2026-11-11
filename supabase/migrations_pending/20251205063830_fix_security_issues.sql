/*
  # Fix Database Security Issues

  ## 1. Add Missing Indexes for Foreign Keys
  - Add index for maintenance_partners.claimed_by
  - Add index for partner_submission_upvotes.user_id
  - Add index for partner_submissions.reviewed_by
  - Add index for seo_analytics.user_id

  ## 2. Optimize RLS Policies for Performance
  Replace `auth.uid()` with `(select auth.uid())` in all RLS policies to prevent
  re-evaluation for each row. This significantly improves query performance at scale.

  ## 3. Fix Function Search Paths
  Set proper search_path for all functions to prevent security vulnerabilities.

  ## Security Enhancements
  - Improved query performance through proper indexing
  - Optimized RLS policy evaluation
  - Secured function execution paths
*/

-- ============================================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_maintenance_partners_claimed_by 
  ON public.maintenance_partners(claimed_by);

CREATE INDEX IF NOT EXISTS idx_partner_submission_upvotes_user_id 
  ON public.partner_submission_upvotes(user_id);

CREATE INDEX IF NOT EXISTS idx_partner_submissions_reviewed_by 
  ON public.partner_submissions(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_seo_analytics_user_id 
  ON public.seo_analytics(user_id);

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES - Replace auth.uid() with (select auth.uid())
-- ============================================================================

-- User Location Preferences
DROP POLICY IF EXISTS "Users can view own location preferences" ON public.user_location_preferences;
CREATE POLICY "Users can view own location preferences"
  ON public.user_location_preferences FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own location preferences" ON public.user_location_preferences;
CREATE POLICY "Users can insert own location preferences"
  ON public.user_location_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own location preferences" ON public.user_location_preferences;
CREATE POLICY "Users can update own location preferences"
  ON public.user_location_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own location preferences" ON public.user_location_preferences;
CREATE POLICY "Users can delete own location preferences"
  ON public.user_location_preferences FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Partner Submissions
DROP POLICY IF EXISTS "Users can submit partner recommendations" ON public.partner_submissions;
CREATE POLICY "Users can submit partner recommendations"
  ON public.partner_submissions FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own partner submissions" ON public.partner_submissions;
CREATE POLICY "Users can update own partner submissions"
  ON public.partner_submissions FOR UPDATE
  TO authenticated
  USING (submitted_by = (select auth.uid()))
  WITH CHECK (submitted_by = (select auth.uid()));

-- Partner Submission Upvotes
DROP POLICY IF EXISTS "Users can upvote partner submissions" ON public.partner_submission_upvotes;
CREATE POLICY "Users can upvote partner submissions"
  ON public.partner_submission_upvotes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can remove own upvotes" ON public.partner_submission_upvotes;
CREATE POLICY "Users can remove own upvotes"
  ON public.partner_submission_upvotes FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- User Favorite Partners
DROP POLICY IF EXISTS "Users can view own favorite partners" ON public.user_favorite_partners;
CREATE POLICY "Users can view own favorite partners"
  ON public.user_favorite_partners FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can add favorite partners" ON public.user_favorite_partners;
CREATE POLICY "Users can add favorite partners"
  ON public.user_favorite_partners FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own favorite partners" ON public.user_favorite_partners;
CREATE POLICY "Users can update own favorite partners"
  ON public.user_favorite_partners FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own favorite partners" ON public.user_favorite_partners;
CREATE POLICY "Users can delete own favorite partners"
  ON public.user_favorite_partners FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Properties
DROP POLICY IF EXISTS "Users can view own properties" ON public.properties;
CREATE POLICY "Users can view own properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own properties" ON public.properties;
CREATE POLICY "Users can insert own properties"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own properties" ON public.properties;
CREATE POLICY "Users can update own properties"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own properties" ON public.properties;
CREATE POLICY "Users can delete own properties"
  ON public.properties FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
CREATE POLICY "Users can view own feedback"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own feedback" ON public.feedback;
CREATE POLICY "Users can insert own feedback"
  ON public.feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own feedback" ON public.feedback;
CREATE POLICY "Users can update own feedback"
  ON public.feedback FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Users
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- Tenants
DROP POLICY IF EXISTS "Managers can view own tenants" ON public.tenants;
CREATE POLICY "Managers can view own tenants"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = tenants.property_id
      AND properties.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Managers can insert own tenants" ON public.tenants;
CREATE POLICY "Managers can insert own tenants"
  ON public.tenants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = tenants.property_id
      AND properties.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Managers can update own tenants" ON public.tenants;
CREATE POLICY "Managers can update own tenants"
  ON public.tenants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = tenants.property_id
      AND properties.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = tenants.property_id
      AND properties.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Managers can delete own tenants" ON public.tenants;
CREATE POLICY "Managers can delete own tenants"
  ON public.tenants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = tenants.property_id
      AND properties.user_id = (select auth.uid())
    )
  );

-- Payments
DROP POLICY IF EXISTS "Managers can view payments for their tenants" ON public.payments;
CREATE POLICY "Managers can view payments for their tenants"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      JOIN public.properties ON properties.id = tenants.property_id
      WHERE tenants.id = payments.tenant_id
      AND properties.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Managers can insert payments for their tenants" ON public.payments;
CREATE POLICY "Managers can insert payments for their tenants"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenants
      JOIN public.properties ON properties.id = tenants.property_id
      WHERE tenants.id = payments.tenant_id
      AND properties.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Managers can update payments for their tenants" ON public.payments;
CREATE POLICY "Managers can update payments for their tenants"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      JOIN public.properties ON properties.id = tenants.property_id
      WHERE tenants.id = payments.tenant_id
      AND properties.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenants
      JOIN public.properties ON properties.id = tenants.property_id
      WHERE tenants.id = payments.tenant_id
      AND properties.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Managers can delete payments for their tenants" ON public.payments;
CREATE POLICY "Managers can delete payments for their tenants"
  ON public.payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      JOIN public.properties ON properties.id = tenants.property_id
      WHERE tenants.id = payments.tenant_id
      AND properties.user_id = (select auth.uid())
    )
  );

-- Screening Results
DROP POLICY IF EXISTS "Managers can view screening results for their tenants" ON public.screening_results;
CREATE POLICY "Managers can view screening results for their tenants"
  ON public.screening_results FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Managers can insert screening results for their tenants" ON public.screening_results;
CREATE POLICY "Managers can insert screening results for their tenants"
  ON public.screening_results FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Managers can update screening results for their tenants" ON public.screening_results;
CREATE POLICY "Managers can update screening results for their tenants"
  ON public.screening_results FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Managers can delete screening results for their tenants" ON public.screening_results;
CREATE POLICY "Managers can delete screening results for their tenants"
  ON public.screening_results FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Maintenance Requests
DROP POLICY IF EXISTS "Users can view maintenance requests for their properties" ON public.maintenance_requests;
CREATE POLICY "Users can view maintenance requests for their properties"
  ON public.maintenance_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = maintenance_requests.property_id
      AND properties.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert maintenance requests" ON public.maintenance_requests;
CREATE POLICY "Users can insert maintenance requests"
  ON public.maintenance_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update maintenance requests for their properties" ON public.maintenance_requests;
CREATE POLICY "Users can update maintenance requests for their properties"
  ON public.maintenance_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = maintenance_requests.property_id
      AND properties.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = maintenance_requests.property_id
      AND properties.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete maintenance requests for their properties" ON public.maintenance_requests;
CREATE POLICY "Users can delete maintenance requests for their properties"
  ON public.maintenance_requests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = maintenance_requests.property_id
      AND properties.user_id = (select auth.uid())
    )
  );

-- User Subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Premium Usage Logs
DROP POLICY IF EXISTS "Users can view own usage logs" ON public.premium_usage_logs;
CREATE POLICY "Users can view own usage logs"
  ON public.premium_usage_logs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own usage logs" ON public.premium_usage_logs;
CREATE POLICY "Users can insert own usage logs"
  ON public.premium_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- SEO Analytics
DROP POLICY IF EXISTS "Users can view own SEO analytics" ON public.seo_analytics;
CREATE POLICY "Users can view own SEO analytics"
  ON public.seo_analytics FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR user_id IS NULL);

DROP POLICY IF EXISTS "Authenticated users can insert SEO analytics" ON public.seo_analytics;
CREATE POLICY "Authenticated users can insert SEO analytics"
  ON public.seo_analytics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR user_id IS NULL);

-- Stripe Customers
DROP POLICY IF EXISTS "Users can view their own customer data" ON public.stripe_customers;
CREATE POLICY "Users can view their own customer data"
  ON public.stripe_customers FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Stripe Subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription data" ON public.stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
  ON public.stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stripe_customers
      WHERE stripe_customers.customer_id = stripe_subscriptions.customer_id
      AND stripe_customers.user_id = (select auth.uid())
    )
  );

-- Stripe Orders
DROP POLICY IF EXISTS "Users can view their own order data" ON public.stripe_orders;
CREATE POLICY "Users can view their own order data"
  ON public.stripe_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.stripe_customers
      WHERE stripe_customers.customer_id = stripe_orders.customer_id
      AND stripe_customers.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- 3. FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Fix find_nearby_partners function
CREATE OR REPLACE FUNCTION public.find_nearby_partners(
  user_lat double precision,
  user_lng double precision,
  search_radius double precision DEFAULT 50,
  service_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  business_name text,
  business_type text,
  contact_name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  latitude double precision,
  longitude double precision,
  rating numeric,
  total_reviews integer,
  years_in_business integer,
  license_number text,
  insurance_verified boolean,
  distance double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.id,
    mp.business_name,
    mp.business_type,
    mp.contact_name,
    mp.email,
    mp.phone,
    mp.address,
    mp.city,
    mp.state,
    mp.zip_code,
    mp.latitude,
    mp.longitude,
    mp.rating,
    mp.total_reviews,
    mp.years_in_business,
    mp.license_number,
    mp.insurance_verified,
    calculate_distance(user_lat, user_lng, mp.latitude, mp.longitude) as distance
  FROM public.maintenance_partners mp
  WHERE calculate_distance(user_lat, user_lng, mp.latitude, mp.longitude) <= search_radius
    AND (service_filter IS NULL OR EXISTS (
      SELECT 1 FROM public.partner_service_types pst
      WHERE pst.partner_id = mp.id
      AND pst.service_type = service_filter
    ))
  ORDER BY distance;
END;
$$;

-- Fix calculate_distance function
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
)
RETURNS double precision
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  earth_radius constant double precision := 3959.0;
  dlat double precision;
  dlng double precision;
  a double precision;
  c double precision;
BEGIN
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  
  a := sin(dlat / 2) * sin(dlat / 2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlng / 2) * sin(dlng / 2);
  
  c := 2 * atan2(sqrt(a), sqrt(1 - a));
  
  RETURN earth_radius * c;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user_profile function
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Fix handle_new_user_subscription function
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (
    user_id,
    subscription_type,
    status,
    current_period_start,
    current_period_end
  )
  VALUES (
    NEW.id,
    'free',
    'active',
    NOW(),
    NOW() + INTERVAL '1 year'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;