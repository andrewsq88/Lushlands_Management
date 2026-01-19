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

-- Create maintenance_partners table
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
  state text NOT NULL,
  postal_code text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
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

-- Create function to calculate distance between two coordinates using Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
RETURNS numeric AS $$
DECLARE
  r numeric := 3959;
  dlat numeric;
  dlon numeric;
  a numeric;
  c numeric;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to find nearby partners within a radius
CREATE OR REPLACE FUNCTION find_nearby_partners(
  user_lat numeric,
  user_lon numeric,
  radius_miles integer DEFAULT 50,
  service_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  business_name text,
  description text,
  business_type text,
  phone text,
  email text,
  website_url text,
  address text,
  city text,
  state text,
  postal_code text,
  latitude numeric,
  longitude numeric,
  service_radius integer,
  hourly_rate numeric,
  rating numeric,
  review_count integer,
  is_verified boolean,
  is_featured boolean,
  availability_status text,
  response_time_hours integer,
  logo_url text,
  distance_miles numeric,
  service_types text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.id,
    mp.business_name,
    mp.description,
    mp.business_type,
    mp.phone,
    mp.email,
    mp.website_url,
    mp.address,
    mp.city,
    mp.state,
    mp.postal_code,
    mp.latitude,
    mp.longitude,
    mp.service_radius,
    mp.hourly_rate,
    mp.rating,
    mp.review_count,
    mp.is_verified,
    mp.is_featured,
    mp.availability_status,
    mp.response_time_hours,
    mp.logo_url,
    calculate_distance(user_lat, user_lon, mp.latitude, mp.longitude) as distance_miles,
    ARRAY_AGG(DISTINCT pst.service_type) as service_types
  FROM maintenance_partners mp
  LEFT JOIN partner_service_types pst ON mp.id = pst.partner_id
  WHERE calculate_distance(user_lat, user_lon, mp.latitude, mp.longitude) <= radius_miles
    AND (service_filter IS NULL OR pst.service_type = service_filter)
  GROUP BY mp.id
  ORDER BY is_featured DESC, distance_miles ASC;
END;
$$ LANGUAGE plpgsql;