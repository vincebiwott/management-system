-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extending auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    department_id UUID REFERENCES public.departments(id),
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    department_id UUID REFERENCES public.departments(id) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create report_comments table
CREATE TABLE IF NOT EXISTS public.report_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON public.departments
    FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users" ON public.reports
    FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own reports" ON public.reports
    USING (auth.uid() = user_id);

CREATE POLICY "Managers can manage their department's reports" ON public.reports
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'manager' 
            AND profiles.department_id = reports.department_id
        )
    );

-- Insert default departments
INSERT INTO public.departments (name, description)
VALUES 
    ('Front Desk', 'Handles guest check-ins, check-outs, and guest services'),
    ('Housekeeping', 'Responsible for room cleaning and maintenance'),
    ('Maintenance', 'Handles repairs and facility maintenance'),
    ('Food & Beverage', 'Manages restaurant and room service'),
    ('Management', 'Administrative and management staff')
ON CONFLICT (name) DO NOTHING;
