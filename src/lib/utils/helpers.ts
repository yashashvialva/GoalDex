import { GoalSheetStatus, GoalStatus, CheckinStatus, UserRole } from '@/lib/types';

/**
 * Status color mapping for chips
 */
export function getStatusColor(
  status: GoalSheetStatus | GoalStatus | CheckinStatus | string
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  const colorMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    draft: 'default',
    submitted: 'info',
    approved: 'success',
    sent_back: 'warning',
    not_started: 'default',
    on_track: 'info',
    completed: 'success',
  };
  return colorMap[status] || 'default';
}

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date-time for display
 */
export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get role display label
 */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    employee: 'Employee',
    manager: 'Manager (L1)',
    admin: 'Admin / HR',
  };
  return labels[role];
}

/**
 * Get role color
 */
export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    employee: '#6366f1',
    manager: '#14b8a6',
    admin: '#f59e0b',
  };
  return colors[role];
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Current fiscal cycle year
 */
export function getCurrentCycleYear(): number {
  const now = new Date();
  // Fiscal year: Apr-Mar. If before April, use previous year.
  return now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
}

/**
 * Get current quarter
 */
export function getCurrentQuarter(): string {
  const month = new Date().getMonth();
  if (month >= 3 && month <= 5) return 'Q1';
  if (month >= 6 && month <= 8) return 'Q2';
  if (month >= 9 && month <= 11) return 'Q3';
  return 'Q4';
}
