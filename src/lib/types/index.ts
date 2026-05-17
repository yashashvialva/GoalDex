// ============================================================
// GoalDex — TypeScript Type Definitions
// ============================================================

export type UserRole = 'employee' | 'manager' | 'admin';

export type GoalSheetStatus = 'draft' | 'submitted' | 'approved' | 'sent_back';

export type GoalStatus = 'draft' | 'submitted' | 'approved' | 'sent_back';

export type UoMType = 'numeric' | 'percentage' | 'timeline' | 'zero_based';

export type CheckinStatus = 'not_started' | 'on_track' | 'completed';

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

// --- Database Models ---

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  manager_id: string | null;
  department: string;
  created_at: string;
}

export interface GoalSheet {
  id: string;
  employee_id: string;
  cycle_year: number;
  status: GoalSheetStatus;
  total_weightage: number;
  locked: boolean;
  submitted_at: string | null;
  approved_at: string | null;
  manager_comment: string | null;
  created_at: string;
  // Joined
  employee?: User;
  goals?: Goal[];
}

export interface Goal {
  id: string;
  goal_sheet_id: string;
  title: string;
  description: string;
  thrust_area: string;
  uom_type: UoMType;
  target_value: number;
  achievement_value: number;
  weightage: number;
  status: GoalStatus;
  progress_score: number;
  is_shared_goal: boolean;
  primary_owner_id: string | null;
  shared_goal_id: string | null;
  created_at: string;
  // Joined
  checkins?: QuarterlyCheckin[];
}

export interface QuarterlyCheckin {
  id: string;
  goal_id: string;
  quarter: Quarter;
  planned_target: number;
  actual_achievement: number;
  employee_comment: string | null;
  manager_comment: string | null;
  status: CheckinStatus;
  updated_at: string;
  // Joined
  goal?: Goal;
}

export interface SharedGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  department: string;
  created_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: string | null;
  new_value: string | null;
  timestamp: string;
  // Joined
  user?: User;
}

// --- UI Types ---

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface StatCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
}
