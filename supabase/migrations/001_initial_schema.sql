-- Bulk eBay Comic Lister - Initial Schema
-- Run this in Supabase SQL Editor to create the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Publisher table (no dependencies)
CREATE TABLE publisher (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publishername TEXT NOT NULL
);

-- Series table (depends on publisher)
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seriesname TEXT NOT NULL,
  publisher_id UUID NOT NULL REFERENCES publisher(id) ON DELETE CASCADE,
  starting_year NUMERIC
);

-- Profiles table (extends Supabase auth.users)
-- Supabase Auth automatically creates auth.users; we sync to profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing table
CREATE TABLE listing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  issuenumber TEXT NOT NULL,
  listing TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  listed_date TIMESTAMPTZ
);

-- Row Level Security
ALTER TABLE publisher ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing ENABLE ROW LEVEL SECURITY;

-- Publisher: anyone can read, authenticated can manage
CREATE POLICY "Publisher readable by all" ON publisher FOR SELECT TO authenticated USING (true);
CREATE POLICY "Publisher insert by authenticated" ON publisher FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Publisher update by authenticated" ON publisher FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Publisher delete by authenticated" ON publisher FOR DELETE TO authenticated USING (true);

-- Series: anyone can read, authenticated can manage
CREATE POLICY "Series readable by all" ON series FOR SELECT TO authenticated USING (true);
CREATE POLICY "Series insert by authenticated" ON series FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Series update by authenticated" ON series FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Series delete by authenticated" ON series FOR DELETE TO authenticated USING (true);

-- Profiles: users can read/update own profile
CREATE POLICY "Profiles readable by owner" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles insert by owner" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update by owner" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Listing: users can only access their own
CREATE POLICY "Listing readable by owner" ON listing FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Listing insert by owner" ON listing FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Listing update by owner" ON listing FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Listing delete by owner" ON listing FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
