-- Database setup script for Hotel Operations Reporting System
-- Run this in your Supabase SQL editor

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    hod_email TEXT,
    hod_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default departments
INSERT INTO departments (name) VALUES 
('Guest Relations Office (GRO)'),
('Concierge'),
('Reservations'),
('Switchboard'),
('Front Desk'),
('Housekeeping'),
('Maintenance'),
('Food & Beverage'),
('Management')
ON CONFLICT DO NOTHING;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'supervisor', 'admin', 'manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    department_id INTEGER REFERENCES departments(id) NOT NULL,
    shift TEXT NOT NULL CHECK (shift IN ('morning', 'evening', 'night')),
    activities TEXT NOT NULL,
    guest_feedback TEXT,
    issues TEXT,
    has_incident BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'action_required')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for reports
CREATE POLICY "Users can view own department reports" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.department_id = reports.department_id
        )
    );

CREATE POLICY "Users can create own reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON reports
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for departments (read-only for authenticated users)
CREATE POLICY "Authenticated users can view departments" ON departments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create function to get department HOD
CREATE OR REPLACE FUNCTION get_department_hod(department_id INTEGER)
RETURNS TABLE(hod_id UUID, hod_email TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT d.hod_id, d.hod_email
    FROM departments d
    WHERE d.id = get_department_hod.department_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_department_id ON reports(department_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, department_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'department_id')::INTEGER, 1),
    'staff'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
