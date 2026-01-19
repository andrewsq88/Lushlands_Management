/*
  # Optimize RLS Policies for Performance

  1. Performance Optimization
    - Replace all `auth.uid()` with `(select auth.uid())` in RLS policies
    - This prevents re-evaluation of auth functions for each row
    - Significantly improves query performance at scale

  2. Tables Updated
    - properties (4 policies)
    - premium_usage_logs (2 policies)
    - tenants (4 policies)
    - user_subscriptions (2 policies)
    - maintenance_requests (4 policies)
    - feedback (3 policies)
    - payments (4 policies)
    - screening_results (4 policies)
    - users (2 policies)
    - stripe_customers (1 policy)
    - stripe_subscriptions (1 policy)
    - stripe_orders (1 policy)

  3. Function Security
    - Add search_path security to functions

  4. Security Best Practices
    - All policies maintain existing security rules
    - Only optimization changes applied
    - No changes to access control logic
*/

-- Drop and recreate properties policies with optimization
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

-- Drop and recreate premium_usage_logs policies with optimization
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

-- Drop and recreate tenants policies with optimization
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

-- Drop and recreate user_subscriptions policies with optimization
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

-- Drop and recreate maintenance_requests policies with optimization
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
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = maintenance_requests.property_id
      AND properties.user_id = (select auth.uid())
    )
  );

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

-- Drop and recreate feedback policies with optimization
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

-- Drop and recreate payments policies with optimization
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

-- Drop and recreate screening_results policies with optimization
DROP POLICY IF EXISTS "Managers can view screening results for their tenants" ON screening_results;
DROP POLICY IF EXISTS "Managers can insert screening results for their tenants" ON screening_results;
DROP POLICY IF EXISTS "Managers can update screening results for their tenants" ON screening_results;
DROP POLICY IF EXISTS "Managers can delete screening results for their tenants" ON screening_results;

CREATE POLICY "Managers can view screening results for their tenants"
  ON screening_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenants
      JOIN properties ON properties.id = tenants.property_id
      WHERE tenants.id = screening_results.tenant_id
      AND properties.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Managers can insert screening results for their tenants"
  ON screening_results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenants
      JOIN properties ON properties.id = tenants.property_id
      WHERE tenants.id = screening_results.tenant_id
      AND properties.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Managers can update screening results for their tenants"
  ON screening_results FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenants
      JOIN properties ON properties.id = tenants.property_id
      WHERE tenants.id = screening_results.tenant_id
      AND properties.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenants
      JOIN properties ON properties.id = tenants.property_id
      WHERE tenants.id = screening_results.tenant_id
      AND properties.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Managers can delete screening results for their tenants"
  ON screening_results FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenants
      JOIN properties ON properties.id = tenants.property_id
      WHERE tenants.id = screening_results.tenant_id
      AND properties.user_id = (select auth.uid())
    )
  );

-- Drop and recreate users policies with optimization
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

-- Drop and recreate stripe_customers policy with optimization
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON stripe_customers FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate stripe_subscriptions policy with optimization
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

-- Drop and recreate stripe_orders policy with optimization
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

-- Fix function search_path security issues
ALTER FUNCTION handle_new_user_profile() SECURITY DEFINER SET search_path = public, auth;
ALTER FUNCTION handle_new_user_subscription() SECURITY DEFINER SET search_path = public, auth;
ALTER FUNCTION update_updated_at_column() SECURITY DEFINER SET search_path = public;
