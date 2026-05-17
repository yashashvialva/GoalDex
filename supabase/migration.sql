-- ============================================================
-- GoalDex — Complete Database Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin')),
  manager_id UUID REFERENCES public.users(id),
  department TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. GOAL_SHEETS TABLE
-- ============================================================
CREATE TABLE public.goal_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cycle_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'sent_back')),
  total_weightage INTEGER NOT NULL DEFAULT 0,
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  manager_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, cycle_year)
);

-- ============================================================
-- 3. GOALS TABLE
-- ============================================================
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_sheet_id UUID NOT NULL REFERENCES public.goal_sheets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thrust_area TEXT NOT NULL DEFAULT 'Operational',
  uom_type TEXT NOT NULL DEFAULT 'numeric' CHECK (uom_type IN ('numeric', 'percentage', 'timeline', 'zero_based')),
  target_value NUMERIC NOT NULL DEFAULT 0,
  achievement_value NUMERIC NOT NULL DEFAULT 0,
  weightage INTEGER NOT NULL DEFAULT 10 CHECK (weightage >= 10 AND weightage <= 100),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'sent_back')),
  progress_score INTEGER NOT NULL DEFAULT 0,
  is_shared_goal BOOLEAN NOT NULL DEFAULT FALSE,
  primary_owner_id UUID REFERENCES public.users(id),
  shared_goal_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. QUARTERLY_CHECKINS TABLE
-- ============================================================
CREATE TABLE public.quarterly_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  planned_target NUMERIC NOT NULL DEFAULT 0,
  actual_achievement NUMERIC NOT NULL DEFAULT 0,
  employee_comment TEXT,
  manager_comment TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'on_track', 'completed')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, quarter)
);

-- ============================================================
-- 5. SHARED_GOALS TABLE
-- ============================================================
CREATE TABLE public.shared_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target NUMERIC NOT NULL DEFAULT 0,
  department TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. AUDIT_LOGS TABLE
-- ============================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_goal_sheets_employee ON public.goal_sheets(employee_id);
CREATE INDEX idx_goal_sheets_status ON public.goal_sheets(status);
CREATE INDEX idx_goals_sheet ON public.goals(goal_sheet_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_checkins_goal ON public.quarterly_checkins(goal_id);
CREATE INDEX idx_checkins_quarter ON public.quarterly_checkins(quarter);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_manager ON public.users(manager_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarterly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- --- USERS policies ---
CREATE POLICY "Users can view all users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can insert users
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- --- GOAL_SHEETS policies ---
CREATE POLICY "Employees see own goal sheets" ON public.goal_sheets
  FOR SELECT USING (
    employee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = employee_id AND u.manager_id = auth.uid()
    )
  );

CREATE POLICY "Employees can insert own goal sheets" ON public.goal_sheets
  FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own draft sheets" ON public.goal_sheets
  FOR UPDATE USING (
    employee_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('manager', 'admin'))
  );

-- --- GOALS policies ---
CREATE POLICY "Goals visible to owner, manager, admin" ON public.goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.goal_sheets gs
      WHERE gs.id = goal_sheet_id
      AND (
        gs.employee_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('manager', 'admin'))
        OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = gs.employee_id AND u.manager_id = auth.uid())
      )
    )
  );

CREATE POLICY "Goals insertable by owner" ON public.goals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goal_sheets gs
      WHERE gs.id = goal_sheet_id AND gs.employee_id = auth.uid()
    )
  );

CREATE POLICY "Goals updatable by owner or manager" ON public.goals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.goal_sheets gs
      WHERE gs.id = goal_sheet_id
      AND (
        gs.employee_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('manager', 'admin'))
      )
    )
  );

CREATE POLICY "Goals deletable by owner" ON public.goals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.goal_sheets gs
      WHERE gs.id = goal_sheet_id
      AND gs.employee_id = auth.uid()
      AND gs.locked = FALSE
    )
  );

-- --- QUARTERLY_CHECKINS policies ---
CREATE POLICY "Checkins visible to relevant users" ON public.quarterly_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.goals g
      JOIN public.goal_sheets gs ON gs.id = g.goal_sheet_id
      WHERE g.id = goal_id
      AND (
        gs.employee_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('manager', 'admin'))
        OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = gs.employee_id AND u.manager_id = auth.uid())
      )
    )
  );

CREATE POLICY "Checkins insertable by goal owner" ON public.quarterly_checkins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goals g
      JOIN public.goal_sheets gs ON gs.id = g.goal_sheet_id
      WHERE g.id = goal_id AND gs.employee_id = auth.uid()
    )
  );

CREATE POLICY "Checkins updatable by owner or manager" ON public.quarterly_checkins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.goals g
      JOIN public.goal_sheets gs ON gs.id = g.goal_sheet_id
      WHERE g.id = goal_id
      AND (
        gs.employee_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('manager', 'admin'))
      )
    )
  );

-- --- SHARED_GOALS policies ---
CREATE POLICY "Shared goals visible to all" ON public.shared_goals
  FOR SELECT USING (true);

CREATE POLICY "Shared goals created by admin" ON public.shared_goals
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Shared goals updated by admin" ON public.shared_goals
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- --- AUDIT_LOGS policies ---
CREATE POLICY "Audit logs visible to admin" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- GRANTS & PERMISSIONS
-- ============================================================
-- Ensure the API roles have access to the tables in the public schema
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;
