-- Safari Park Hotel Reporting System - Initial Schema
-- This file contains the database schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('staff', 'department_head', 'general_manager', 'admin')),
    department TEXT CHECK (department IN ('guest_relations', 'concierge', 'cashier', 'switchboard', 'management', 'administration')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports Table
CREATE TABLE public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    report_date DATE NOT NULL,
    shift TEXT NOT NULL CHECK (shift IN ('morning', 'afternoon', 'night')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
    content JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.users(id),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Department Summaries Table
CREATE TABLE public.department_summaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    department TEXT NOT NULL,
    summary_date DATE NOT NULL,
    department_head_id UUID REFERENCES public.users(id),
    summary_data JSONB NOT NULL,
    total_reports INTEGER DEFAULT 0,
    staff_present INTEGER DEFAULT 0,
    issues_resolved INTEGER DEFAULT 0,
    pending_actions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(department, summary_date)
);

-- Feedback Table (for department heads to review staff reports)
CREATE TABLE public.feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    feedback_type TEXT DEFAULT 'review' CHECK (feedback_type IN ('review', 'comment', 'approval', 'rejection')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Settings Table
CREATE TABLE public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log Table
CREATE TABLE public.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Templates Table (for different departments)
CREATE TABLE public.report_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    department TEXT NOT NULL,
    template_name TEXT NOT NULL,
    template_fields JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(department, template_name)
);

-- Indexes for better performance
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_department ON public.reports(department);
CREATE INDEX idx_reports_date ON public.reports(report_date);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_created_at ON public.reports(created_at);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_department ON public.users(department);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_feedback_report_id ON public.feedback(report_id);
CREATE INDEX idx_feedback_from_user ON public.feedback(from_user_id);
CREATE INDEX idx_feedback_to_user ON public.feedback(to_user_id);
CREATE INDEX idx_activity_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_created_at ON public.activity_log(created_at);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can only see their own profile (except admins)
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Department heads can view users in their department
CREATE POLICY "HODs can view department users" ON public.users
    FOR SELECT USING (
        department = (
            SELECT department FROM public.users 
            WHERE id = auth.uid() AND role = 'department_head'
        )
    );

-- Staff can only create reports for themselves
CREATE POLICY "Staff can create own reports" ON public.reports
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Department heads can view reports from their department
CREATE POLICY "HODs can view department reports" ON public.reports
    FOR SELECT USING (
        department = (
            SELECT department FROM public.users 
            WHERE id = auth.uid() AND role = 'department_head'
        )
    );

-- General managers and admins can view all reports
CREATE POLICY "Management can view all reports" ON public.reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('general_manager', 'admin')
        )
    );

-- Department heads can update report status and add review notes
CREATE POLICY "HODs can review department reports" ON public.reports
    FOR UPDATE USING (
        department = (
            SELECT department FROM public.users 
            WHERE id = auth.uid() AND role = 'department_head'
        )
    );

-- Users can only view feedback sent to them or by them
CREATE POLICY "Users can view own feedback" ON public.feedback
    FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Users can create feedback for reports in their department
CREATE POLICY "HODs can create feedback" ON public.feedback
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'department_head'
        )
    );

-- Only admins can modify system settings
CREATE POLICY "Only admins can modify settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can view their own activity
CREATE POLICY "Users can view own activity" ON public.activity_log
    FOR SELECT USING (user_id = auth.uid());

-- Admins can view all activity
CREATE POLICY "Admins can view all activity" ON public.activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Everyone can view active report templates
CREATE POLICY "Everyone can view templates" ON public.report_templates
    FOR SELECT USING (is_active = true);

-- Only admins can modify report templates
CREATE POLICY "Only admins can modify templates" ON public.report_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_department_summaries_updated_at BEFORE UPDATE ON public.department_summaries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON public.report_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.activity_log (user_id, action, resource_type, resource_id, details)
    VALUES (
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        json_build_object('old', OLD, 'new', NEW)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Activity logging triggers
CREATE TRIGGER log_users_activity AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER log_reports_activity AFTER INSERT OR UPDATE OR DELETE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.log_activity();

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('auto_save_interval', '5', 'Auto-save interval in minutes'),
('require_approval', 'true', 'Require approval for reports'),
('email_notifications', 'true', 'Enable email notifications'),
('desktop_notifications', 'false', 'Enable desktop notifications'),
('max_file_size', '10485760', 'Maximum file size in bytes (10MB)'),
('session_timeout', '3600', 'Session timeout in seconds (1 hour)')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default report templates
INSERT INTO public.report_templates (department, template_name, template_fields) VALUES
('guest_relations', 'Daily Report', '[
    {"field": "guest_issues_resolved", "type": "number", "label": "Guest Issues Resolved", "required": false},
    {"field": "vip_guests_assisted", "type": "number", "label": "VIP Guests Assisted", "required": false},
    {"field": "complaints_received", "type": "textarea", "label": "Complaints Received", "required": false},
    {"field": "special_requests", "type": "textarea", "label": "Special Requests Handled", "required": false}
]'),
('concierge', 'Daily Report', '[
    {"field": "safari_bookings", "type": "number", "label": "Safari Bookings Made", "required": false},
    {"field": "tour_arrangements", "type": "textarea", "label": "Tour Arrangements", "required": false},
    {"field": "transport_requests", "type": "number", "label": "Transportation Requests", "required": false},
    {"field": "restaurant_reservations", "type": "number", "label": "Restaurant Reservations", "required": false}
]'),
('cashier', 'Daily Report', '[
    {"field": "shift_revenue", "type": "number", "label": "Shift Revenue", "required": false},
    {"field": "payment_methods", "type": "textarea", "label": "Payment Methods Processed", "required": false},
    {"field": "refunds_issued", "type": "number", "label": "Refunds Issued", "required": false},
    {"field": "cash_discrepancies", "type": "textarea", "label": "Cash Discrepancies", "required": false}
]'),
('switchboard', 'Daily Report', '[
    {"field": "calls_handled", "type": "number", "label": "Calls Handled", "required": false},
    {"field": "messages_taken", "type": "number", "label": "Messages Taken", "required": false},
    {"field": "wake_up_calls", "type": "number", "label": "Wake-up Calls", "required": false},
    {"field": "emergency_calls", "type": "number", "label": "Emergency Calls", "required": false}
]')
ON CONFLICT (department, template_name) DO NOTHING;

-- Create a view for report statistics
CREATE OR REPLACE VIEW public.report_stats AS
SELECT 
    department,
    COUNT(*) as total_reports,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_reports,
    COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed_reports,
    COUNT(*) FILTER (WHERE report_date = CURRENT_DATE) as today_reports,
    COUNT(*) FILTER (WHERE report_date >= CURRENT_DATE - INTERVAL '7 days') as week_reports,
    COUNT(*) FILTER (WHERE report_date >= CURRENT_DATE - INTERVAL '30 days') as month_reports
FROM public.reports
GROUP BY department;

-- Create a view for user statistics
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
    u.id,
    u.full_name,
    u.role,
    u.department,
    COUNT(r.id) as total_reports,
    COUNT(r.id) FILTER (WHERE r.status = 'approved') as approved_reports,
    COUNT(r.id) FILTER (WHERE r.report_date = CURRENT_DATE) as today_reports,
    MAX(r.created_at) as last_report_date
FROM public.users u
LEFT JOIN public.reports r ON u.id = r.user_id
GROUP BY u.id, u.full_name, u.role, u.department;
