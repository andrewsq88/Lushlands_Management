/*
  # Add AI Features: Tenant Screening and Maintenance Requests

  1. New Tables
    - Update `tenants` table to add `income` column
    - `screening_results`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants)
      - `user_id` (uuid, foreign key to auth.users)
      - `score` (numeric, AI confidence score 0-100)
      - `recommendation` (text, Approve/Reject)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `maintenance_requests`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants)
      - `property_id` (uuid, foreign key to properties)
      - `user_id` (uuid, foreign key to auth.users)
      - `description` (text, maintenance issue description)
      - `priority` (text, High/Medium/Low - AI assigned)
      - `status` (text, Open/Closed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on new tables
    - Managers can access their tenants' data
    - Tenants can view/create their own maintenance requests
    - Proper indexes for performance
*/

-- Add income column to existing tenants table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tenants' AND column_name = 'income'
  ) THEN
    ALTER TABLE tenants ADD COLUMN income numeric;
  END IF;
END $$;

-- Create screening_results table
CREATE TABLE IF NOT EXISTS screening_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score numeric NOT NULL CHECK (score >= 0 AND score <= 100),
  recommendation text NOT NULL CHECK (recommendation IN ('Approve', 'Reject')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create maintenance_requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Screening results policies
CREATE POLICY "Managers can view screening results for their tenants"
  ON screening_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can insert screening results for their tenants"
  ON screening_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can update screening results for their tenants"
  ON screening_results
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can delete screening results for their tenants"
  ON screening_results
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Maintenance requests policies
CREATE POLICY "Users can view maintenance requests for their properties"
  ON maintenance_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM tenants 
      WHERE tenants.id = maintenance_requests.tenant_id 
      AND tenants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert maintenance requests"
  ON maintenance_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM tenants 
      WHERE tenants.id = maintenance_requests.tenant_id 
      AND tenants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update maintenance requests for their properties"
  ON maintenance_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM tenants 
      WHERE tenants.id = maintenance_requests.tenant_id 
      AND tenants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete maintenance requests for their properties"
  ON maintenance_requests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_screening_results_tenant_id ON screening_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_screening_results_user_id ON screening_results(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_tenant_id ON maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_id ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_user_id ON maintenance_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);

-- Create triggers for updated_at
CREATE TRIGGER update_screening_results_updated_at
  BEFORE UPDATE ON screening_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at
  BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();