/*
  # Create Maintenance Partners Location System

  1. New Tables
    - user_location_preferences: Stores user location data for personalized partner recommendations
    - maintenance_partners: Stores maintenance and service provider business information
    - partner_service_types: Junction table linking partners to multiple service specialties
    - partner_submissions: User-submitted partner recommendations for review and approval
    - partner_submission_upvotes: Tracks which users upvoted which partner submissions
    - user_favorite_partners: Stores users saved/favorite maintenance partners

  2. Security
    - Enable RLS on all tables
    - Users can read all partner data
    - Users can manage their own location preferences and favorites
    - Only authenticated users can access the system
*/

-- Create user_location_preferences table
CREATE TABLE IF NOT EXISTS user_location_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  city text,
  state text,
  country text DEFAULT 'US',
  postal_code text,
  address text,
  location_name text,
  is_primary boolean DEFAULT true,
  detection_method text DEFAULT 'manual',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create maintenance_partners table with country column
CREATE TABLE IF NOT EXISTS maintenance_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  description text,
  business_type text NOT NULL,
  phone text,
  email text,
  website_url text,
  address text NOT NULL,
  city text NOT NULL,
  state text,
  country text DEFAULT 'USA',
  postal_code text,
  latitude numeric DEFAULT 0,
  longitude numeric DEFAULT 0,
  service_radius integer DEFAULT 50,
  hourly_rate numeric,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  availability_status text DEFAULT 'available',
  response_time_hours integer DEFAULT 24,
  logo_url text,
  claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create partner_service_types table
CREATE TABLE IF NOT EXISTS partner_service_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES maintenance_partners(id) ON DELETE CASCADE NOT NULL,
  service_type text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(partner_id, service_type)
);

-- Create partner_submissions table
CREATE TABLE IF NOT EXISTS partner_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  phone text,
  email text,
  website_url text,
  address text NOT NULL,
  service_types text[] NOT NULL,
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  user_notes text,
  status text DEFAULT 'pending',
  upvote_count integer DEFAULT 0,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create partner_submission_upvotes table
CREATE TABLE IF NOT EXISTS partner_submission_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES partner_submissions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(submission_id, user_id)
);

-- Create user_favorite_partners table
CREATE TABLE IF NOT EXISTS user_favorite_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_id uuid REFERENCES maintenance_partners(id) ON DELETE CASCADE NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, partner_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_location_preferences_user_id ON user_location_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_location_preferences_coords ON user_location_preferences(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_maintenance_partners_coords ON maintenance_partners(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_maintenance_partners_city_state ON maintenance_partners(city, state);
CREATE INDEX IF NOT EXISTS idx_maintenance_partners_country ON maintenance_partners(country);
CREATE INDEX IF NOT EXISTS idx_maintenance_partners_business_type ON maintenance_partners(business_type);

CREATE INDEX IF NOT EXISTS idx_partner_service_types_partner_id ON partner_service_types(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_service_types_service_type ON partner_service_types(service_type);

CREATE INDEX IF NOT EXISTS idx_partner_submissions_submitted_by ON partner_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_partner_submissions_status ON partner_submissions(status);

CREATE INDEX IF NOT EXISTS idx_user_favorite_partners_user_id ON user_favorite_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_partners_partner_id ON user_favorite_partners(partner_id);

-- Enable Row Level Security
ALTER TABLE user_location_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_submission_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_partners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_location_preferences
CREATE POLICY "Users can view own location preferences"
  ON user_location_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own location preferences"
  ON user_location_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own location preferences"
  ON user_location_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own location preferences"
  ON user_location_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for maintenance_partners (public read)
CREATE POLICY "Anyone can view maintenance partners"
  ON maintenance_partners FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for partner_service_types (public read)
CREATE POLICY "Anyone can view partner service types"
  ON partner_service_types FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for partner_submissions
CREATE POLICY "Users can view all partner submissions"
  ON partner_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can submit partner recommendations"
  ON partner_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update own partner submissions"
  ON partner_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = submitted_by)
  WITH CHECK (auth.uid() = submitted_by);

-- RLS Policies for partner_submission_upvotes
CREATE POLICY "Users can view all submission upvotes"
  ON partner_submission_upvotes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upvote partner submissions"
  ON partner_submission_upvotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own upvotes"
  ON partner_submission_upvotes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_favorite_partners
CREATE POLICY "Users can view own favorite partners"
  ON user_favorite_partners FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorite partners"
  ON user_favorite_partners FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorite partners"
  ON user_favorite_partners FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorite partners"
  ON user_favorite_partners FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert maintenance partner data
INSERT INTO maintenance_partners (
  business_name,
  description,
  business_type,
  website_url,
  address,
  city,
  state,
  country,
  latitude,
  longitude,
  service_radius,
  is_verified,
  availability_status,
  rating
) VALUES
  -- New York partners
  (
    'NYC Property Pros',
    'Full-service property maintenance and repair specialists serving Manhattan and Brooklyn.',
    'maintenance_partner',
    '#',
    '123 Main St',
    'New York',
    'NY',
    'USA',
    40.7128,
    -74.0060,
    50,
    true,
    'available',
    4.5
  ),
  (
    'Metro Maintenance Solutions',
    'Emergency repairs, HVAC services, and general maintenance for residential properties.',
    'maintenance_partner',
    '#',
    '456 Broadway',
    'New York',
    'NY',
    'USA',
    40.7128,
    -74.0060,
    50,
    true,
    'available',
    4.7
  ),

  -- Los Angeles partners
  (
    'LA Property Care',
    'Professional maintenance services for apartments and single-family homes in Los Angeles.',
    'maintenance_partner',
    '#',
    '789 Sunset Blvd',
    'Los Angeles',
    'CA',
    'USA',
    34.0522,
    -118.2437,
    50,
    true,
    'available',
    4.6
  ),
  (
    'West Coast Repairs',
    'Reliable maintenance and emergency repair services throughout the LA metro area.',
    'maintenance_partner',
    '#',
    '321 Santa Monica Blvd',
    'Los Angeles',
    'CA',
    'USA',
    34.0522,
    -118.2437,
    50,
    true,
    'available',
    4.4
  ),

  -- Chicago partners
  (
    'Windy City Maintenance',
    'Comprehensive property maintenance services for Chicago landlords and property managers.',
    'maintenance_partner',
    '#',
    '147 Michigan Ave',
    'Chicago',
    'IL',
    'USA',
    41.8781,
    -87.6298,
    50,
    true,
    'available',
    4.8
  ),
  (
    'Chicago Property Solutions',
    'Expert maintenance, plumbing, electrical, and HVAC services for rental properties.',
    'maintenance_partner',
    '#',
    '258 State St',
    'Chicago',
    'IL',
    'USA',
    41.8781,
    -87.6298,
    50,
    true,
    'available',
    4.5
  ),

  -- Miami partners
  (
    'Miami Property Maintenance',
    'Tropical climate specialists providing maintenance services for South Florida properties.',
    'maintenance_partner',
    '#',
    '369 Ocean Drive',
    'Miami',
    'FL',
    'USA',
    25.7617,
    -80.1918,
    50,
    true,
    'available',
    4.6
  ),
  (
    'South Beach Repairs',
    'Fast response maintenance and repair services for Miami-Dade County properties.',
    'maintenance_partner',
    '#',
    '741 Collins Ave',
    'Miami',
    'FL',
    'USA',
    25.7617,
    -80.1918,
    50,
    true,
    'available',
    4.7
  ),

  -- Toronto partner
  (
    'Toronto Property Services',
    'Professional property maintenance and repair services for the Greater Toronto Area.',
    'maintenance_partner',
    '#',
    '852 Yonge St',
    'Toronto',
    'ON',
    'Canada',
    43.6532,
    -79.3832,
    50,
    true,
    'available',
    4.8
  ),

  -- Vancouver partner
  (
    'Vancouver Maintenance Co',
    'Reliable maintenance solutions for residential properties in Vancouver and surrounding areas.',
    'maintenance_partner',
    '#',
    '963 Granville St',
    'Vancouver',
    'BC',
    'Canada',
    49.2827,
    -123.1207,
    50,
    true,
    'available',
    4.6
  ),

  -- London partner
  (
    'London Property Maintenance',
    'Expert property maintenance services for landlords and property managers in London.',
    'maintenance_partner',
    '#',
    '159 Oxford St',
    'London',
    'Greater London',
    'UK',
    51.5074,
    -0.1278,
    50,
    true,
    'available',
    4.7
  ),

  -- Manchester partner
  (
    'Manchester Property Care',
    'Comprehensive maintenance and repair services for properties in Manchester and the North West.',
    'maintenance_partner',
    '#',
    '357 Deansgate',
    'Manchester',
    'Greater Manchester',
    'UK',
    53.4808,
    -2.2426,
    50,
    true,
    'available',
    4.5
  )
ON CONFLICT DO NOTHING;
