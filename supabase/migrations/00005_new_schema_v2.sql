-- ==========================================================
-- Migration: Upgrade schema to match CLAUDE.md v2
-- Adds new columns to profiles, creates new tables
-- ==========================================================

-- PROFILES: add missing columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_listing boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level text DEFAULT 'starter';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_weeks int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_task_completed_at timestamptz;

-- LISTINGS: add missing columns
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_name text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT true;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS current_score int;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_price numeric;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_currency text DEFAULT 'EUR';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_rating numeric;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_reviews_count int;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_photo_count int;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_bedrooms int;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_beds int;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_bathrooms int;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_amenities text[];
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_host_response_rate text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_competitor boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS competitor_of uuid REFERENCES listings(id);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS last_scraped_at timestamptz;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- TASKS: add missing columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS listing_id uuid REFERENCES listings(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS analysis_id uuid;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS instructions text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tool_link text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS level text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0;

-- GENERATED_CONTENT: add missing columns
ALTER TABLE generated_content ADD COLUMN IF NOT EXISTS input_data jsonb;
ALTER TABLE generated_content ADD COLUMN IF NOT EXISTS selected_variant int;

-- PHOTOS: add missing columns
ALTER TABLE photos ADD COLUMN IF NOT EXISTS original_url text;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS suggested_order int;

-- ANALYSES table (new - separate from listings)
CREATE TABLE IF NOT EXISTS analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  overall_score int,
  title_score int,
  photos_score int,
  description_score int,
  amenities_score int,
  pricing_score int,
  seo_score int,
  analysis_data jsonb,
  tips jsonb,
  created_at timestamptz DEFAULT now()
);

-- ACHIEVEMENTS table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_key text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

-- NOTIFICATIONS table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text,
  title text NOT NULL,
  body text,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- COMPETITOR_SNAPSHOTS table
CREATE TABLE IF NOT EXISTS competitor_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  price numeric,
  rating numeric,
  reviews_count int,
  photo_count int,
  amenities text[],
  scraped_at timestamptz DEFAULT now()
);

-- MARKET_DATA table
CREATE TABLE IF NOT EXISTS market_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  city text NOT NULL,
  area text,
  avg_price numeric,
  median_price numeric,
  p25_price numeric,
  p75_price numeric,
  avg_rating numeric,
  avg_photos int,
  top_amenities jsonb,
  total_listings int,
  data_date date,
  created_at timestamptz DEFAULT now()
);

-- HOLIDAYS table
CREATE TABLE IF NOT EXISTS holidays (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  date date NOT NULL,
  country text DEFAULT 'IT',
  city text,
  price_markup_percent int,
  category text,
  recurrence text
);

-- ADMIN_LOGS table
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action text,
  user_id uuid REFERENCES profiles(id),
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- EARNINGS table
CREATE TABLE IF NOT EXISTS earnings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id),
  month date NOT NULL,
  amount numeric,
  nights_booked int,
  occupancy_rate numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ==========================================================
-- RLS for new tables
-- ==========================================================
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "own_analyses" ON analyses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_achievements" ON achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_earnings" ON earnings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_competitor_data" ON competitor_snapshots FOR ALL USING (
  listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid())
);

-- Public read for market data and holidays (authenticated users)
CREATE POLICY "read_market" ON market_data FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "read_holidays" ON holidays FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin policies
CREATE POLICY "admin_logs_access" ON admin_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
