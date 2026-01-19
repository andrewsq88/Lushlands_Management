/*
  # Tenant Management, Payments, and Affiliate Links Schema

  1. New Tables
    - `tenants`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null)
      - `phone` (text)
      - `property_id` (uuid, foreign key to properties)
      - `lease_start` (date)
      - `lease_end` (date)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `payments`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants)
      - `amount` (numeric, not null)
      - `type` (text, not null - rent/mortgage/maintenance)
      - `status` (text, default 'pending' - pending/paid)
      - `due_date` (date, not null)
      - `stripe_payment_id` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `affiliate_links`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, not null)
      - `url` (text, not null)
      - `category` (text, not null - mortgage/insurance/tax_lien)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Managers can only access their own tenants and payments
    - Affiliate links are publicly readable

  3. Initial Data
    - Insert default affiliate partner data
*/

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  lease_start date,
  lease_end date,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('rent', 'mortgage', 'maintenance')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  due_date date NOT NULL,
  stripe_payment_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create affiliate_links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  category text NOT NULL CHECK (category IN ('mortgage', 'insurance', 'tax_lien')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

-- Tenants policies
CREATE POLICY "Managers can view own tenants"
  ON tenants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can insert own tenants"
  ON tenants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can update own tenants"
  ON tenants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can delete own tenants"
  ON tenants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Managers can view payments for their tenants"
  ON payments
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tenants 
    WHERE tenants.id = payments.tenant_id 
    AND tenants.user_id = auth.uid()
  ));

CREATE POLICY "Managers can insert payments for their tenants"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM tenants 
    WHERE tenants.id = payments.tenant_id 
    AND tenants.user_id = auth.uid()
  ));

CREATE POLICY "Managers can update payments for their tenants"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tenants 
    WHERE tenants.id = payments.tenant_id 
    AND tenants.user_id = auth.uid()
  ));

CREATE POLICY "Managers can delete payments for their tenants"
  ON payments
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tenants 
    WHERE tenants.id = payments.tenant_id 
    AND tenants.user_id = auth.uid()
  ));

-- Affiliate links policies (public read access)
CREATE POLICY "Affiliate links are public"
  ON affiliate_links
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_category ON affiliate_links(category);

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_links_updated_at
  BEFORE UPDATE ON affiliate_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial affiliate data
INSERT INTO affiliate_links (name, description, url, category) VALUES
  ('Mortgage Partner', 'Competitive rates for property financing', '#', 'mortgage'),
  ('Insurance Partner', 'Comprehensive landlord coverage', '#', 'insurance'),
  ('Tax Lien Help', 'Expert assistance to resolve property liens', '#', 'tax_lien')
ON CONFLICT DO NOTHING;