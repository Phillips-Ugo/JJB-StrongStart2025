-- Supabase Database Schema
-- Copy and paste this into Supabase SQL Editor to create tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  extension_user_id TEXT UNIQUE NOT NULL
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(extension_user_id) ON DELETE CASCADE,
  goals TEXT[] NOT NULL,
  goal_weights JSONB NOT NULL DEFAULT '{}',
  price_sensitivity JSONB NOT NULL,
  category_preferences JSONB[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Swipe decisions table
CREATE TABLE IF NOT EXISTS swipe_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(extension_user_id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_data JSONB NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('like', 'dislike')),
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase attempts table
CREATE TABLE IF NOT EXISTS purchase_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(extension_user_id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_data JSONB NOT NULL,
  recommendation TEXT NOT NULL,
  score DECIMAL(3,2) NOT NULL,
  user_decision TEXT NOT NULL CHECK (user_decision IN ('proceeded', 'cancelled', 'viewed_alternative')),
  alternative_selected TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(extension_user_id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_data JSONB NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  would_recommend BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_swipe_decisions_user_id ON swipe_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_swipe_decisions_decision ON swipe_decisions(decision);
CREATE INDEX IF NOT EXISTS idx_purchase_attempts_user_id ON purchase_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_attempts_recommendation ON purchase_attempts(recommendation);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_users_extension_id ON users(extension_user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since using anon key in extension)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_preferences" ON user_preferences FOR ALL USING (true);
CREATE POLICY "Allow all operations on swipe_decisions" ON swipe_decisions FOR ALL USING (true);
CREATE POLICY "Allow all operations on purchase_attempts" ON purchase_attempts FOR ALL USING (true);
CREATE POLICY "Allow all operations on product_reviews" ON product_reviews FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

