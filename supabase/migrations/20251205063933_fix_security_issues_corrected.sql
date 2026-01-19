/*
  # Fix Database Security Issues

  ## Overview
  This migration addresses critical security and performance issues identified by Supabase security scan.

  ## Changes Made

  ### 1. Unindexed Foreign Keys
  Added indexes for foreign keys to improve query performance:
    - `maintenance_partners.claimed_by`
    - `partner_submission_upvotes.user_id`
    - `partner_submissions.reviewed_by`
    - `seo_analytics.user_id`

  ### 2. RLS Policy Optimization
  Updated all RLS policies to use `(select auth.uid())` pattern instead of `auth.uid()`.
  This prevents re-evaluation of auth functions for each row, significantly improving query performance at scale.
  
  Tables updated:
    - user_location_preferences
    - partner_submissions
    - partner_submission_upvotes
    - user_favorite_partners
    - properties
    - feedback
    - users
    - tenants
    - payments
    - screening_results
    - maintenance_requests
    - user_subscriptions
    - premium_usage_logs
    - seo_analytics
    - stripe_customers
    - stripe_subscriptions (via customer_id join)
    - stripe_orders (via customer_id join)

  ### 3. Function Security
  Fixed search_path for all functions to prevent search path attacks:
    - find_nearby_partners
    - update_updated_at_column
    - calculate_distance
    - handle_new_user_profile
    - handle_new_user_subscription

  ## Security Notes
  - All changes are non-destructive and maintain existing functionality
  - RLS policies are now more performant and secure
  - Function security is hardened against search path attacks
*/

-- ============================================================================
-- SECTION 1: ADD MISSING INDEXES FOR FOREIGN KEYS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_maintenance_partners_claimed_by 
  ON maintenance_partners(claimed_by);

CREATE INDEX IF NOT EXISTS idx_partner_submission_upvotes_user_id 
  ON partner_submission_upvotes(user_id);

CREATE INDEX IF NOT EXISTS idx_partner_submissions_reviewed_by 
  ON partner_submissions(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_seo_analytics_user_id 
  ON seo_analytics(user_id);

-- ============================================================================
-- SECTION 2: FIX RLS POLICIES - USE (SELECT auth.uid()) PATTERN
-- ============================================================================

-- TABLE: user_location_preferences
DROP POLICY IF EXISTS "Users can view own location preferences" ON user_location_preferences;
DROP POLICY IF EXISTS "Users can insert own location preferences" ON user_location_preferences;
DROP POLICY IF EXISTS "Users can update own location preferences" ON user_location_preferences;
DROP POLICY IF EXISTS "Users can delete own location preferences" ON user_location_preferences;

CREATE POLICY "Users can view own location preferences"
  ON user_location_preferences FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own location preferences"
  ON user_location_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own location preferences"
  ON user_location_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own location preferences"
  ON user_location_preferences FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- TABLE: partner_submissions
DROP POLICY IF EXISTS "Users can submit partner recommendations" ON partner_submissions;
DROP POLICY IF EXISTS "Users can update own partner submissions" ON partner_submissions;

CREATE POLICY "Users can submit partner recommendations"
  ON partner_submissions FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = (select auth.uid()));

CREATE POLICY "Users can update own partner submissions"
  ON partner_submissions FOR UPDATE
  TO authenticated
  USING (submitted_by = (select auth.uid()))
  WITH CHECK (submitted_by = (select auth.uid()));

-- TABLE: partner_submission_upvotes
DROP POLICY IF EXISTS "Users can upvote partner submissions" ON partner_submission_upvotes;
DROP POLICY IF EXISTS "Users can remove own upvotes" ON partner_submission_upvotes;

CREATE POLICY "Users can upvote partner submissions"
  ON partner_submission_upvotes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can remove own upvotes"
  ON partner_submission_upvotes FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- TABLE: user_favorite_partners
DROP POLICY IF EXISTS "Users can view own favorite partners" ON user_favorite_partners;
DROP POLICY IF EXISTS "Users can add favorite partners" ON user_favorite_partners;
DROP POLICY IF EXISTS "Users can update own favorite partners" ON user_favorite_partners;
DROP POLICY IF EXISTS "Users can delete own favorite partners" ON user_favorite_partners;

CREATE POLICY "Users can view own favorite partners"
  ON user_favorite_partners FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can add favorite partners"
  ON user_favorite_partners FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own favorite partners"
  ON user_favorite_partners FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own favorite partners"
  ON user_favorite_partners FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- TABLE: properties
DROP POLICY IF EXISTS "Users can view own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;

CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- TABLE: feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can update own feedback" ON feedback;

CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own feedback"
  ON feedback FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- TABLE: users
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- TABLE: tenants
DROP POLICY IF EXISTS "Managers can view own tenants" ON tenants;
DROP POLICY IF EXISTS "Managers can insert own tenants" ON tenants;
DROP POLICY IF EXISTS "Managers can update own tenants" ON tenants;
DROP POLICY IF EXISTS "Managers can delete own tenants" ON tenants;

CREATE POLICY "Managers can view own tenants"
  ON tenants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = tenants.property_id 
      AND properties.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Managers can insert own tenants"
  ON tenants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = tenants.property_id 
      AND properties.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Managers can update own tenants"
  ON tenants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = tenants.property_id 
      AND properties.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = tenants.property_id 
      AND properties.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Managers can delete own tenants"
  ON tenants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = tenants.property_id 
      AND properties.user_id = (select auth.uid())
    )
  );

-- TABLE: payments
DROP POLICY IF EXISTS "Managers can view payments for their tenants" ON payments;
DROP POLICY IF EXISTS "Managers can insert payments for their tenants" ON payments;
DROP POLICY IF EXISTS "Managers can update payments for their tenants" ON payments;
DROP POLICY IF EXISTS "Managers can delete payments for their tenants" ON payments;

CREATE POLICY "Managers can view payments for their tenants"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenants 
      JOIN properties ON properties.id = tenants.property_id
      WHERE tenants.id = payments.tenant_id 
      AND properties.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Managers can insert payments for their tenants"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenants 
      JOIN properties ON properties.id = tenants.property_id
      WHERE tenants.id = payments.tenant_id 
      AND properties.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Managers can update payments for their tenants"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenants 
      JOIN properties ON properties.id = tenants.property_id
      WHERE tenants.id = payments.tenant_id 
      AND properties.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenants 
      JOIN properties ON properties.id = tenants.property_id
      WHERE tenants.id = payments.tenant_id 
      AND properties.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Managers can delete payments for their tenants"
  ON payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenants 
      JOIN properties ON properties.id = tenants.property_id
      WHERE tenants.id = payments.tenant_id 
      AND properties.user_id = (select auth.uid())
    )
  );

-- TABLE: screening_results
DROP POLICY IF EXISTS "Managers can view screening results for their tenants" ON screening_results;
DROP POLICY IF EXISTS "Managers can insert screening results for their tenants" ON screening_results;
DROP POLICY IF EXISTS "Managers can update screening results for their tenants" ON screening_results;
DROP POLICY IF EXISTS "Managers can delete screening results for their tenants" ON screening_results;

CREATE POLICY "Managers can view screening results for their tenants"
  ON screening_results FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Managers can insert screening results for their tenants"
  ON screening_results FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Managers can update screening results for their tenants"
  ON screening_results FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Managers can delete screening results for their tenants"
  ON screening_results FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- TABLE: maintenance_requests
DROP POLICY IF EXISTS "Users can view maintenance requests for their properties" ON maintenance_requests;
DROP POLICY IF EXISTS "Users can insert maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Users can update maintenance requests for their properties" ON maintenance_requests;
DROP POLICY IF EXISTS "Users can delete maintenance requests for their properties" ON maintenance_requests;

CREATE POLICY "Users can view maintenance requests for their properties"
  ON maintenance_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = maintenance_requests.property_id 
      AND properties.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert maintenance requests"
  ON maintenance_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update maintenance requests for their properties"
  ON maintenance_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = maintenance_requests.property_id 
      AND properties.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = maintenance_requests.property_id 
      AND properties.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete maintenance requests for their properties"
  ON maintenance_requests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = maintenance_requests.property_id 
      AND properties.user_id = (select auth.uid())
    )
  );

-- TABLE: user_subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions;

CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- TABLE: premium_usage_logs
DROP POLICY IF EXISTS "Users can view own usage logs" ON premium_usage_logs;
DROP POLICY IF EXISTS "Users can insert own usage logs" ON premium_usage_logs;

CREATE POLICY "Users can view own usage logs"
  ON premium_usage_logs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own usage logs"
  ON premium_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- TABLE: seo_analytics
DROP POLICY IF EXISTS "Users can view own SEO analytics" ON seo_analytics;
DROP POLICY IF EXISTS "Authenticated users can insert SEO analytics" ON seo_analytics;

CREATE POLICY "Users can view own SEO analytics"
  ON seo_analytics FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR user_id IS NULL);

CREATE POLICY "Authenticated users can insert SEO analytics"
  ON seo_analytics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR user_id IS NULL);

-- TABLE: stripe_customers
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON stripe_customers FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- TABLE: stripe_subscriptions
-- Note: stripe_subscriptions uses customer_id, need to join through stripe_customers
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stripe_customers
      WHERE stripe_customers.customer_id = stripe_subscriptions.customer_id
      AND stripe_customers.user_id = (select auth.uid())
    )
  );

-- TABLE: stripe_orders
-- Note: stripe_orders uses customer_id, need to join through stripe_customers
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

CREATE POLICY "Users can view their own order data"
  ON stripe_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stripe_customers
      WHERE stripe_customers.customer_id = stripe_orders.customer_id
      AND stripe_customers.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- SECTION 3: FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Fix find_nearby_partners function
CREATE OR REPLACE FUNCTION find_nearby_partners(
  user_lat double precision,
  user_lng double precision,
  radius_miles integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  business_name text,
  business_type text,
  address text,
  city text,
  state text,
  zip_code text,
  phone text,
  email text,
  website text,
  rating numeric,
  distance_miles double precision
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
    mp.address,
    mp.city,
    mp.state,
    mp.postal_code as zip_code,
    mp.phone,
    mp.email,
    mp.website_url as website,
    mp.rating,
    calculate_distance(user_lat, user_lng, mp.latitude, mp.longitude) as distance_miles
  FROM maintenance_partners mp
  WHERE calculate_distance(user_lat, user_lng, mp.latitude, mp.longitude) <= radius_miles
  ORDER BY distance_miles ASC;
END;
$$;

-- Fix calculate_distance function
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
)
RETURNS double precision
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  earth_radius constant double precision := 3959.0;
  lat1_rad double precision;
  lat2_rad double precision;
  lat_diff_rad double precision;
  lng_diff_rad double precision;
  a double precision;
  c double precision;
BEGIN
  lat1_rad := radians(lat1);
  lat2_rad := radians(lat2);
  lat_diff_rad := radians(lat2 - lat1);
  lng_diff_rad := radians(lng2 - lng1);
  
  a := sin(lat_diff_rad / 2) * sin(lat_diff_rad / 2) +
       cos(lat1_rad) * cos(lat2_rad) *
       sin(lng_diff_rad / 2) * sin(lng_diff_rad / 2);
  
  c := 2 * atan2(sqrt(a), sqrt(1 - a));
  
  RETURN earth_radius * c;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user_profile function
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix handle_new_user_subscription function
CREATE OR REPLACE FUNCTION handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, subscription_type, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;