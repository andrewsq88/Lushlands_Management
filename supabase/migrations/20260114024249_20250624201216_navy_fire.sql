/*
  # Create premium_usage table for tracking AI feature usage

  1. New Tables
    - `premium_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `feature_type` (text, 'voiceover' or 'video')
      - `api_provider` (text, 'eleven_labs' or 'tavus')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on premium_usage table
    - Users can only access their own usage records
    - Proper policies for usage tracking
*/

-- Create premium_usage table
CREATE TABLE IF NOT EXISTS premium_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type text NOT NULL CHECK (feature_type IN ('voiceover', 'video')),
  api_provider text NOT NULL CHECK (api_provider IN ('eleven_labs', 'tavus')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE premium_usage ENABLE ROW LEVEL SECURITY;

-- Premium usage policies
CREATE POLICY "Users can view own usage"
  ON premium_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON premium_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_premium_usage_user_id ON premium_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_usage_feature_type ON premium_usage(feature_type);
CREATE INDEX IF NOT EXISTS idx_premium_usage_created_at ON premium_usage(created_at);