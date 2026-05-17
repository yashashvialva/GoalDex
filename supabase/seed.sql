-- ============================================================
-- GoalDex — Seed Data
-- Run AFTER migration.sql and AFTER creating auth users
-- ============================================================
-- IMPORTANT: Replace the UUIDs below with the actual auth.users IDs
-- from your Supabase Auth dashboard after creating the demo accounts.
--
-- Demo accounts to create in Supabase Auth:
--   employee@goaldex.com / goaldex123
--   manager@goaldex.com  / goaldex123
--   admin@goaldex.com    / goaldex123
--
-- Then create additional auth users for the seeded employees below,
-- OR use the simpler approach: insert directly into public.users
-- with UUID references and use the 3 demo accounts for login.
-- ============================================================

-- For hackathon: We'll use fixed UUIDs for seed data.
-- The 3 demo auth users will be mapped to the first 3 entries.
-- Other employees exist as data for dashboards/analytics.

-- NOTE: After creating auth users, replace these placeholder UUIDs
-- with real auth user IDs for the 3 demo accounts:
--   EMPLOYEE_AUTH_ID → employee@goaldex.com auth.users.id
--   MANAGER_AUTH_ID  → manager@goaldex.com auth.users.id
--   ADMIN_AUTH_ID    → admin@goaldex.com auth.users.id

-- ============================================================
-- USERS (15+ employees across 4 departments)
-- ============================================================
-- These will be inserted after you provide the real auth user IDs.
-- Template SQL below uses placeholders.

-- STEP 1: Insert the 3 demo users (replace UUIDs after auth creation)
-- INSERT INTO public.users (id, name, email, role, manager_id, department) VALUES
--   ('EMPLOYEE_AUTH_ID', 'Arjun Mehta', 'employee@goaldex.com', 'employee', 'MANAGER_AUTH_ID', 'Engineering'),
--   ('MANAGER_AUTH_ID', 'Priya Sharma', 'manager@goaldex.com', 'manager', NULL, 'Engineering'),
--   ('ADMIN_AUTH_ID', 'Rahul Verma', 'admin@goaldex.com', 'admin', NULL, 'HR');

-- STEP 2: After the 3 demo users are inserted, run the full seed below.
-- For hackathon speed, we provide a self-contained seed that creates
-- fake UUIDs for non-login users. They appear in dashboards but can't login.

-- ============================================================
-- FULL SEED SCRIPT (run after inserting 3 demo users above)
-- ============================================================

-- Additional employees (these won't have auth accounts - they're data-only)
-- Their UUIDs are generated but they can't log in.

-- We'll create a function to help with seeding
DO $$
DECLARE
  -- Replace these 3 with real auth user IDs from Supabase
  v_employee_id UUID := '0ff5ce19-6f14-4918-870a-d612140dd53c';
  v_manager_id UUID := 'f9140ab9-91ba-4bde-9c2a-f34af4e3a633';
  v_admin_id UUID := 'fa53497d-6067-4605-8b5e-0ee687db38a5';

  -- Additional seed employees (non-login)
  v_emp2 UUID := uuid_generate_v4();
  v_emp3 UUID := uuid_generate_v4();
  v_emp4 UUID := uuid_generate_v4();
  v_emp5 UUID := uuid_generate_v4();
  v_emp6 UUID := uuid_generate_v4();
  v_emp7 UUID := uuid_generate_v4();
  v_emp8 UUID := uuid_generate_v4();
  v_emp9 UUID := uuid_generate_v4();
  v_emp10 UUID := uuid_generate_v4();
  v_emp11 UUID := uuid_generate_v4();
  v_emp12 UUID := uuid_generate_v4();
  v_mgr2 UUID := uuid_generate_v4();
  v_mgr3 UUID := uuid_generate_v4();

  -- Goal sheets
  v_gs1 UUID := uuid_generate_v4();
  v_gs2 UUID := uuid_generate_v4();
  v_gs3 UUID := uuid_generate_v4();

  -- Goals
  v_g1 UUID := uuid_generate_v4();
  v_g2 UUID := uuid_generate_v4();
  v_g3 UUID := uuid_generate_v4();
  v_g4 UUID := uuid_generate_v4();
  v_g5 UUID := uuid_generate_v4();

  -- Shared goals
  v_sg1 UUID := uuid_generate_v4();
  v_sg2 UUID := uuid_generate_v4();

BEGIN
  -- ============================================================
  -- Note: The 3 demo users must be inserted BEFORE this script
  -- via the manual step above. This script inserts additional data.
  -- ============================================================

  -- Additional users (insert directly, bypassing auth)
  -- These are for dashboard data only
  INSERT INTO public.users (id, name, email, role, manager_id, department) VALUES
    (v_emp2, 'Sneha Patel', 'sneha.patel@goaldex.com', 'employee', v_manager_id, 'Engineering'),
    (v_emp3, 'Vikram Singh', 'vikram.singh@goaldex.com', 'employee', v_manager_id, 'Engineering'),
    (v_emp4, 'Ananya Roy', 'ananya.roy@goaldex.com', 'employee', v_manager_id, 'Engineering'),
    (v_emp5, 'Karthik Nair', 'karthik.nair@goaldex.com', 'employee', v_mgr2, 'Product'),
    (v_emp6, 'Deepa Iyer', 'deepa.iyer@goaldex.com', 'employee', v_mgr2, 'Product'),
    (v_emp7, 'Rohit Gupta', 'rohit.gupta@goaldex.com', 'employee', v_mgr2, 'Product'),
    (v_emp8, 'Meera Joshi', 'meera.joshi@goaldex.com', 'employee', v_mgr3, 'Marketing'),
    (v_emp9, 'Aditya Kumar', 'aditya.kumar@goaldex.com', 'employee', v_mgr3, 'Marketing'),
    (v_emp10, 'Riya Chopra', 'riya.chopra@goaldex.com', 'employee', v_mgr3, 'Marketing'),
    (v_emp11, 'Sanjay Mishra', 'sanjay.mishra@goaldex.com', 'employee', v_admin_id, 'HR'),
    (v_emp12, 'Kavita Reddy', 'kavita.reddy@goaldex.com', 'employee', v_admin_id, 'HR'),
    (v_mgr2, 'Amit Desai', 'amit.desai@goaldex.com', 'manager', NULL, 'Product'),
    (v_mgr3, 'Neha Kulkarni', 'neha.kulkarni@goaldex.com', 'manager', NULL, 'Marketing')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- GOAL SHEETS for demo employee
  -- ============================================================
  INSERT INTO public.goal_sheets (id, employee_id, cycle_year, status, total_weightage, locked, submitted_at, approved_at) VALUES
    (v_gs1, v_employee_id, 2026, 'approved', 100, TRUE, '2026-04-10', '2026-04-15')
  ON CONFLICT (employee_id, cycle_year) DO NOTHING;

  -- Goal sheets for other employees
  INSERT INTO public.goal_sheets (id, employee_id, cycle_year, status, total_weightage, locked, submitted_at, approved_at) VALUES
    (v_gs2, v_emp2, 2026, 'submitted', 100, FALSE, '2026-04-12', NULL),
    (v_gs3, v_emp3, 2026, 'draft', 60, FALSE, NULL, NULL)
  ON CONFLICT (employee_id, cycle_year) DO NOTHING;

  -- ============================================================
  -- GOALS for demo employee (approved sheet)
  -- ============================================================
  INSERT INTO public.goals (id, goal_sheet_id, title, description, thrust_area, uom_type, target_value, achievement_value, weightage, status, progress_score, is_shared_goal) VALUES
    (v_g1, v_gs1, 'Increase API Response Time', 'Reduce P95 API latency from 450ms to under 200ms across all critical endpoints', 'Technical Excellence', 'numeric', 200, 180, 30, 'approved', 90, FALSE),
    (v_g2, v_gs1, 'Code Coverage Improvement', 'Increase unit test coverage from 65% to 85% across all microservices', 'Quality', 'percentage', 85, 72, 25, 'approved', 85, FALSE),
    (v_g3, v_gs1, 'Zero Critical Bugs in Production', 'Maintain zero critical/P0 bugs in production for the entire quarter', 'Quality', 'zero_based', 0, 0, 20, 'approved', 100, FALSE),
    (v_g4, v_gs1, 'Feature Delivery Timeline', 'Deliver all committed features within sprint timelines (measured in days delayed)', 'Delivery', 'timeline', 5, 7, 15, 'approved', 71, FALSE),
    (v_g5, v_gs1, 'Team Knowledge Sharing', 'Conduct 12 tech talks / brown bag sessions for the team throughout the year', 'People', 'numeric', 12, 5, 10, 'approved', 42, FALSE);

  -- ============================================================
  -- QUARTERLY CHECK-INS for demo employee
  -- ============================================================
  INSERT INTO public.quarterly_checkins (goal_id, quarter, planned_target, actual_achievement, employee_comment, manager_comment, status) VALUES
    -- Q1 checkins
    (v_g1, 'Q1', 300, 280, 'Optimized database queries and added caching layer', 'Good progress, keep focusing on the auth service endpoints', 'on_track'),
    (v_g2, 'Q1', 72, 70, 'Added tests for user service and payment module', 'Solid start. Prioritize the notification service next', 'on_track'),
    (v_g3, 'Q1', 0, 0, 'No critical bugs this quarter!', 'Excellent discipline in code reviews', 'completed'),
    (v_g4, 'Q1', 5, 3, 'Delivered 3 out of 5 features on time, 2 delayed by dependency', 'Escalate blockers earlier next quarter', 'on_track'),
    (v_g5, 'Q1', 3, 2, 'Conducted sessions on GraphQL and Docker best practices', 'Good topics, try to engage more junior devs', 'on_track'),
    -- Q2 checkins
    (v_g1, 'Q2', 250, 220, 'Implemented connection pooling and query optimization', 'Strong improvement trend', 'on_track'),
    (v_g2, 'Q2', 78, 75, 'Added integration tests and improved mock coverage', NULL, 'on_track'),
    (v_g3, 'Q2', 0, 0, 'Clean quarter again', NULL, 'completed'),
    (v_g4, 'Q2', 5, 6, 'One feature slipped due to scope change', NULL, 'on_track'),
    (v_g5, 'Q2', 3, 3, 'Sessions on Kubernetes, CI/CD pipelines, and security', NULL, 'completed');

  -- ============================================================
  -- SHARED GOALS
  -- ============================================================
  INSERT INTO public.shared_goals (id, title, description, target, department, created_by) VALUES
    (v_sg1, 'Customer Satisfaction Score', 'Achieve organization-wide CSAT score of 4.5+', 4.5, 'All', v_admin_id),
    (v_sg2, 'Engineering Velocity', 'Increase sprint velocity by 20% across all engineering teams', 20, 'Engineering', v_admin_id);

  -- ============================================================
  -- AUDIT LOGS
  -- ============================================================
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, timestamp) VALUES
    (v_employee_id, 'created', 'goal_sheet', v_gs1::TEXT, NULL, '{"cycle_year": 2026}', '2026-04-05 10:30:00+05:30'),
    (v_employee_id, 'submitted', 'goal_sheet', v_gs1::TEXT, '{"status": "draft"}', '{"status": "submitted"}', '2026-04-10 14:20:00+05:30'),
    (v_manager_id, 'approved', 'goal_sheet', v_gs1::TEXT, '{"status": "submitted"}', '{"status": "approved"}', '2026-04-15 09:45:00+05:30'),
    (v_employee_id, 'updated', 'checkin', v_g1::TEXT, NULL, '{"quarter": "Q1", "achievement": 280}', '2026-06-28 16:00:00+05:30'),
    (v_emp2, 'created', 'goal_sheet', v_gs2::TEXT, NULL, '{"cycle_year": 2026}', '2026-04-08 11:00:00+05:30'),
    (v_emp2, 'submitted', 'goal_sheet', v_gs2::TEXT, '{"status": "draft"}', '{"status": "submitted"}', '2026-04-12 10:15:00+05:30'),
    (v_admin_id, 'created', 'shared_goal', v_sg1::TEXT, NULL, '{"title": "Customer Satisfaction Score"}', '2026-04-01 09:00:00+05:30'),
    (v_admin_id, 'created', 'shared_goal', v_sg2::TEXT, NULL, '{"title": "Engineering Velocity"}', '2026-04-01 09:30:00+05:30'),
    (v_manager_id, 'commented', 'checkin', v_g1::TEXT, NULL, '{"comment": "Good progress"}', '2026-07-01 10:00:00+05:30'),
    (v_employee_id, 'updated', 'checkin', v_g2::TEXT, NULL, '{"quarter": "Q2", "achievement": 75}', '2026-09-25 15:30:00+05:30');

END $$;
