-- Run this in the Supabase SQL Editor

-- 1. Create a table for User Profiles (to store pay rules)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  hourly_rate DECIMAL(10,2) DEFAULT 20.00,
  overtime_15x_after_hours DECIMAL(4,2) DEFAULT 8.0,
  overtime_2x_after_hours DECIMAL(4,2) DEFAULT 12.0,
  weekend_15x_after_hours DECIMAL(4,2) DEFAULT 0.0,
  weekend_2x_after_hours DECIMAL(4,2) DEFAULT 8.0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Create a table for Shifts
CREATE TABLE shifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  unpaid_break_minutes INTEGER DEFAULT 0,
  total_hours DECIMAL(5,2) NOT NULL,
  gross_pay DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Set up Row Level Security (RLS) so users can only see their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own shifts" ON shifts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shifts" ON shifts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shifts" ON shifts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shifts" ON shifts FOR DELETE USING (auth.uid() = user_id);
