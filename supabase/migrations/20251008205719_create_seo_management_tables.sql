/*
  # SEO Management Tables

  1. New Tables
    - `seo_pages`
      - `id` (uuid, primary key)
      - `page_key` (text, unique) - Identifier for the page (e.g., 'home', 'properties')
      - `title` (text) - Page title for SEO
      - `description` (text) - Meta description
      - `keywords` (text[]) - Array of keywords
      - `og_title` (text) - Open Graph title
      - `og_description` (text) - Open Graph description
      - `canonical_url` (text) - Canonical URL
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `seo_faqs`
      - `id` (uuid, primary key)
      - `page_key` (text) - Related page identifier
      - `question` (text) - FAQ question
      - `answer` (text) - FAQ answer
      - `order_index` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `seo_analytics`
      - `id` (uuid, primary key)
      - `page_key` (text) - Page identifier
      - `search_query` (text) - User search query
      - `user_id` (uuid) - Reference to auth.users
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin access
*/

-- Create seo_pages table
CREATE TABLE IF NOT EXISTS seo_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  keywords text[] DEFAULT '{}',
  og_title text,
  og_description text,
  canonical_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create seo_faqs table
CREATE TABLE IF NOT EXISTS seo_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create seo_analytics table
CREATE TABLE IF NOT EXISTS seo_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  search_query text,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_seo_faqs_page_key ON seo_faqs(page_key);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_page_key ON seo_analytics(page_key);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_created_at ON seo_analytics(created_at);

-- Enable RLS
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for seo_pages (public read, authenticated admin write)
CREATE POLICY "Anyone can view SEO page data"
  ON seo_pages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert SEO page data"
  ON seo_pages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update SEO page data"
  ON seo_pages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for seo_faqs (public read, authenticated admin write)
CREATE POLICY "Anyone can view SEO FAQs"
  ON seo_faqs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert SEO FAQs"
  ON seo_faqs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update SEO FAQs"
  ON seo_faqs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete SEO FAQs"
  ON seo_faqs FOR DELETE
  TO authenticated
  USING (true);

-- Policies for seo_analytics (authenticated users can insert and view their own)
CREATE POLICY "Users can view own SEO analytics"
  ON seo_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert SEO analytics"
  ON seo_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_seo_pages_updated_at ON seo_pages;
CREATE TRIGGER update_seo_pages_updated_at
  BEFORE UPDATE ON seo_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seo_faqs_updated_at ON seo_faqs;
CREATE TRIGGER update_seo_faqs_updated_at
  BEFORE UPDATE ON seo_faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
