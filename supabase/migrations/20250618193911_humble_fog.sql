/*
  # Property Management Schema

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `address` (text, required)
      - `type` (text, required) - apartment, house, condo, etc.
      - `status` (text, required) - vacant, occupied, maintenance
      - `rent_amount` (numeric, optional)
      - `bedrooms` (integer, optional)
      - `bathrooms` (numeric, optional)
      - `square_feet` (integer, optional)
      - `description` (text, optional)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `feedback`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `message` (text, required)
      - `category` (text, required) - general, complaint, suggestion, maintenance
      - `status` (text, default 'open') - open, in_progress, resolved
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own properties and feedback
    - Proper policies for landlords and tenants
</thinking>

*/

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'vacant',
  rent_amount numeric,
  bedrooms integer,
  bathrooms numeric,
  square_feet integer,
  description text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Users can view own properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can view own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();